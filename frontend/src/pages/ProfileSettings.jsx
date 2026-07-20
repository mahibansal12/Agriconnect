// src/pages/ProfileSettings.jsx
// Covers ALL backend user-model fields that had no frontend UI:
//   • avatar         → PATCH /v1/user/update-avatar
//   • name / email   → PATCH /v1/user/update-account  (email change requires OTP)
//   • password       → PATCH /v1/user/change-password
//   • payoutDetails  → PATCH /v1/user/payout-details  (farmer only)
//   • isPhoneVerified / isEmailVerified / isActive  → display-only

import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { updateUserInfo } from '../redux/slices/authSlice';

/* ─── API helpers ──────────────────────────────────────────────── */
const API = {
  me:                 () => axiosInstance.get('/v1/user/me'),
  updateAvatar:       (fd) => axiosInstance.patch('/v1/user/update-avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateAccount:      (body) => axiosInstance.patch('/v1/user/update-account', body),
  changePassword:     (body) => axiosInstance.patch('/v1/user/change-password', body),
  updatePayout:       (body) => axiosInstance.patch('/v1/user/payout-details', body),
  verifyUpi:          (body) => axiosInstance.post('/v1/user/verify-upi', body),
  sendEmailChangeOtp: (body) => axiosInstance.post('/v1/user/send-email-change-otp', body),
};

/* ─── Tiny reusable components ─────────────────────────────────── */

function Badge({ ok, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: ok ? '#DCFCE7' : '#FEF9C3',
      color: ok ? '#15803D' : '#A16207',
    }}>
      <span style={{ fontSize: 9 }}>{ok ? '●' : '○'}</span>
      {label}
    </span>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      overflow: 'hidden', marginBottom: 24,
    }}>
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #F0F4F0',
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A2E14' }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7C65' }}>{subtitle}</p>
        )}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: '#3D5030', marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {hint  && <p style={{ fontSize: 12, color: '#9AB088', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const inputSt = (err) => ({
  width: '100%', padding: '10px 14px',
  border: `1.5px solid ${err ? '#EF4444' : '#D8E4CC'}`,
  borderRadius: 10, fontSize: 14, color: '#1A2E14',
  background: '#F7FAF4', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
});

function Btn({ loading, label, loadingLabel = 'Saving…', type = 'submit', onClick, danger }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 10,
        background: danger ? '#DC2626' : '#3D7A2B',
        color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
        transition: 'background 0.15s',
      }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
          borderRadius: '50%', animation: 'ps-spin 0.7s linear infinite',
          display: 'inline-block', flexShrink: 0,
        }} />
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}

function Toast({ msg, ok }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      padding: '12px 20px', borderRadius: 12,
      background: ok ? '#1B5E20' : '#B91C1C',
      color: '#fff', fontSize: 14, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'ps-slide-in 0.3s ease',
      maxWidth: 340,
    }}>
      <span style={{ flexShrink: 0 }}>{ok ? '✓' : '✕'}</span>
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
export default function ProfileSettings() {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.auth.user);
  const isFarmer = user?.role === 'farmer';

  const [activeTab, setActiveTab]   = useState('profile');
  const [serverUser, setServerUser] = useState(null);
  const [toast, setToast]           = useState({ msg: '', ok: true });

  // Avatar
  const fileRef = useRef();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Account details
  const [accForm, setAccForm]       = useState({ name: '', email: '' });
  const [accErrs, setAccErrs]       = useState({});
  const [accLoading, setAccLoading] = useState(false);

  // Change password
  const [pwForm, setPwForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  });
  const [pwErrs, setPwErrs]       = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]       = useState({ old: false, new: false, confirm: false });

  // Payout details
  const [payForm, setPayForm] = useState({
    upiId: '', bankAccountNumber: '', ifscCode: '', accountHolderName: '',
  });
  const [payErrs, setPayErrs]         = useState({});
  const [payLoading, setPayLoading]   = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiName, setUpiName]         = useState('');
  const [upiVerifying, setUpiVerifying] = useState(false);

  // Email-change OTP flow
  // Stage: 'idle' | 'sending' | 'awaiting-otp' | 'verifying'
  const [emailOtpStage, setEmailOtpStage] = useState('idle');
  const [emailOtpCode,  setEmailOtpCode]  = useState('');
  const [emailOtpErr,   setEmailOtpErr]   = useState('');
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const emailOtpTargetRef = React.useRef(''); // the new email we sent OTP to

  /* ── fetch fresh user on mount ──────────────────────────────── */
  useEffect(() => {
    API.me()
      .then(({ data }) => {
        const u = data?.data ?? data;
        setServerUser(u);
        setAccForm({ name: u.name || '', email: u.email || '' });
        setPayForm({
          upiId:             u.payoutDetails?.upiId             || '',
          bankAccountNumber: u.payoutDetails?.bankAccountNumber || '',
          ifscCode:          u.payoutDetails?.ifscCode           || '',
          accountHolderName: u.payoutDetails?.accountHolderName || '',
        });
      })
      .catch(() => {
        if (user) {
          setServerUser(user);
          setAccForm({ name: user.name || '', email: user.email || '' });
        }
      });
  }, []);            // eslint-disable-line react-hooks/exhaustive-deps

  /* ── toast helper ───────────────────────────────────────────── */
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  };

  /* ── email OTP cooldown ticker ──────────────────────────────── */
  useEffect(() => {
    if (emailOtpCooldown <= 0) return;
    const t = setInterval(() => setEmailOtpCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [emailOtpCooldown]);

  /* ── avatar ─────────────────────────────────────────────────── */
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB', false); return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const { data } = await API.updateAvatar(fd);
      const updated  = data?.data ?? data;
      dispatch(updateUserInfo({ avatar: updated.avatar }));
      setServerUser(prev => ({ ...prev, avatar: updated.avatar }));
      showToast('Avatar updated!');
      setAvatarFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Avatar upload failed', false);
    } finally {
      setAvatarLoading(false);
    }
  };

  /* ── account details ────────────────────────────────────────── */
  const validateAcc = () => {
    const errs = {};
    if (!accForm.name.trim())
      errs.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accForm.email))
      errs.email = 'Enter a valid email';
    setAccErrs(errs);
    return !Object.keys(errs).length;
  };

  const currentEmail = (serverUser || user)?.email || '';
  const isChangingEmail = accForm.email.trim().toLowerCase() !== currentEmail.toLowerCase();

  /* Step 1: Send OTP to the new email */
  const sendEmailOtp = async () => {
    if (!validateAcc()) return;
    setEmailOtpStage('sending');
    setEmailOtpErr('');
    try {
      await API.sendEmailChangeOtp({ email: accForm.email.trim() });
      emailOtpTargetRef.current = accForm.email.trim();
      setEmailOtpCode('');
      setEmailOtpStage('awaiting-otp');
      setEmailOtpCooldown(30);
    } catch (err) {
      setEmailOtpStage('idle');
      setEmailOtpErr(err.response?.data?.message || 'Failed to send verification code');
    }
  };

  /* Step 2: Submit name + email + OTP together */
  const saveAccount = async (e) => {
    e.preventDefault();
    setEmailOtpErr('');
    if (!validateAcc()) return;

    // If email is changing, gate behind OTP
    if (isChangingEmail) {
      if (emailOtpStage !== 'awaiting-otp') {
        // Haven't sent OTP yet — kick off the send instead of saving
        sendEmailOtp();
        return;
      }
      // OTP UI is showing — the user clicks the separate "Verify & Save" button
      // so this path only runs for name-only saves
      return;
    }

    // Name-only change (or email unchanged) — save directly
    setAccLoading(true);
    try {
      const { data } = await API.updateAccount({ name: accForm.name });
      const updated  = data?.data ?? data;
      dispatch(updateUserInfo({ name: updated.name, email: updated.email }));
      setServerUser(prev => ({ ...prev, name: updated.name, email: updated.email }));
      showToast('Profile updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', false);
    } finally {
      setAccLoading(false);
    }
  };

  /* OTP verification + final save (email change) */
  const verifyEmailOtpAndSave = async () => {
    setEmailOtpErr('');
    if (emailOtpCode.length !== 6) {
      setEmailOtpErr('Enter the complete 6-digit code');
      return;
    }
    setEmailOtpStage('verifying');
    try {
      const { data } = await API.updateAccount({
        name: accForm.name,
        email: emailOtpTargetRef.current,
        otp: emailOtpCode,
      });
      const updated = data?.data ?? data;
      dispatch(updateUserInfo({ name: updated.name, email: updated.email }));
      setServerUser(prev => ({ ...prev, name: updated.name, email: updated.email }));
      setEmailOtpStage('idle');
      setEmailOtpCode('');
      showToast('Email updated successfully!');
    } catch (err) {
      setEmailOtpStage('awaiting-otp');
      setEmailOtpErr(err.response?.data?.message || 'Incorrect code or verification failed');
    }
  };

  /* ── change password ────────────────────────────────────────── */
  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword)
      errs.oldPassword = 'Enter your current password';
    if (pwForm.newPassword.length < 8)
      errs.newPassword = 'New password must be at least 8 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    setPwErrs(errs);
    return !Object.keys(errs).length;
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwLoading(true);
    try {
      await API.changePassword({
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      showToast('Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', false);
    } finally {
      setPwLoading(false);
    }
  };

  /* ── payout ─────────────────────────────────────────────────── */
  const verifyUpi = async () => {
    if (!payForm.upiId.trim()) return;
    setUpiVerifying(true);
    setUpiVerified(false);
    setUpiName('');
    try {
      const { data } = await API.verifyUpi({ upiId: payForm.upiId.trim() });
      const res = data?.data ?? data;
      setUpiVerified(true);
      setUpiName(res.name || '');
      showToast(`UPI verified: ${res.name}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'UPI verification failed', false);
    } finally {
      setUpiVerifying(false);
    }
  };

  const validatePayout = () => {
    const errs = {};
    if (!payForm.upiId && !payForm.bankAccountNumber)
      errs.upiId = 'Provide at least a UPI ID or bank account number';
    if (payForm.bankAccountNumber && !payForm.ifscCode)
      errs.ifscCode = 'IFSC code is required with a bank account';
    setPayErrs(errs);
    return !Object.keys(errs).length;
  };

  const savePayout = async (e) => {
    e.preventDefault();
    if (!validatePayout()) return;
    setPayLoading(true);
    try {
      await API.updatePayout(payForm);
      showToast('Payout details saved!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', false);
    } finally {
      setPayLoading(false);
    }
  };

  /* ── derived ────────────────────────────────────────────────── */
  const cu          = serverUser || user;
  const displayName = cu?.name || 'User';
  const avatarSrc   = avatarPreview || cu?.avatar || null;

  const backHref =
    user?.role === 'farmer' ? '/farmer/dashboard' :
    user?.role === 'buyer'  ? '/buyer/dashboard'  : '/admin/dashboard';

  const tabs = [
    { key: 'profile',  label: '👤 Profile'  },
    { key: 'security', label: '🔒 Security'  },
    ...(isFarmer ? [{ key: 'payout', label: '💳 Payout' }] : []),
    { key: 'account',  label: '⚙️ Account'  },
  ];

  /* ─── render ──────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#F2F6EF', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E8EFE4',
        padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <Link to={backHref} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#3E4A3C', textDecoration: 'none', fontWeight: 500,
        }}>
          ← Back
        </Link>
        <span style={{ color: '#D0DAC8' }}>|</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1B5E20' }}>🌿 AgriConnect</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6B7C65', fontWeight: 600 }}>
          Profile Settings
        </span>
      </div>

      {/* Layout */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 16px 60px' }}>

        {/* Heading */}
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#1A2E14' }}>
          Profile Settings
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6B7C65' }}>
          Manage your account information, security, and payment details.
        </p>

        {/* Identity strip */}
        <div style={{
          background: 'linear-gradient(135deg, #0A3D0C 0%, #2E7D32 100%)',
          borderRadius: 16, padding: '22px 24px',
          display: 'flex', alignItems: 'center', gap: 18,
          marginBottom: 28, boxShadow: '0 4px 20px rgba(10,61,12,0.25)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: avatarSrc ? 'transparent' : 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: '#fff', overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : displayName.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{displayName}</p>
            <p style={{ margin: '3px 0 5px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {cu?.email}
            </p>
            <span style={{
              padding: '2px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', fontSize: 11, color: '#A8D5A2',
              textTransform: 'capitalize', fontWeight: 600, letterSpacing: '0.04em',
            }}>
              {cu?.role} account
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: '#fff', borderRadius: 14, padding: 6,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
        }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, minWidth: 90, padding: '10px 12px', border: 'none',
                cursor: 'pointer', borderRadius: 10, fontSize: 13, fontWeight: 600,
                transition: 'all 0.15s',
                background: activeTab === t.key ? '#3D7A2B' : 'transparent',
                color:      activeTab === t.key ? '#fff' : '#6B7C65',
                fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: PROFILE ══════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <>
            <Card title="Profile Photo" subtitle="Upload a clear photo so others can recognise you.">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: '#E8F5E9', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 700, color: '#2E7D32',
                  overflow: 'hidden', border: '3px solid #C8E6C9', flexShrink: 0,
                }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : displayName.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    ref={fileRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={onFileChange}
                    id="ps-avatar-file"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: '9px 18px', borderRadius: 10,
                      border: '1.5px solid #3D7A2B', background: '#F7FAF4',
                      color: '#3D7A2B', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    📷 Choose Photo
                  </button>
                  {avatarFile && (
                    <Btn
                      type="button" onClick={uploadAvatar}
                      loading={avatarLoading} label="Upload" loadingLabel="Uploading…"
                    />
                  )}
                  <p style={{ fontSize: 12, color: '#9AB088', margin: 0 }}>
                    JPG, PNG or WebP · Max 5 MB
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Account Details" subtitle="Update your name and email address.">
              <form onSubmit={saveAccount}>
                <Field label="Full Name" error={accErrs.name}>
                  <input
                    id="ps-name"
                    value={accForm.name}
                    onChange={(e) => {
                      setAccForm(p => ({ ...p, name: e.target.value }));
                      setAccErrs(p => ({ ...p, name: '' }));
                    }}
                    placeholder="Ramesh Yadav"
                    style={inputSt(accErrs.name)}
                  />
                </Field>
                <Field label="Email Address" error={accErrs.email}
                  hint={isChangingEmail ? undefined : 'Changing your email will require a verification code sent to the new address.'}
                >
                  <input
                    id="ps-email"
                    type="email"
                    value={accForm.email}
                    onChange={(e) => {
                      setAccForm(p => ({ ...p, email: e.target.value }));
                      setAccErrs(p => ({ ...p, email: '' }));
                      // Reset OTP stage if user edits email after sending
                      if (emailOtpStage !== 'idle') {
                        setEmailOtpStage('idle');
                        setEmailOtpCode('');
                        setEmailOtpErr('');
                      }
                    }}
                    placeholder="you@example.com"
                    style={inputSt(accErrs.email)}
                  />
                </Field>

                {/* ── Email OTP verification block ─────────────── */}
                {isChangingEmail && emailOtpStage === 'awaiting-otp' && (
                  <div style={{
                    background: '#F0F9FF', border: '1.5px solid #BAE6FD',
                    borderRadius: 12, padding: '16px 18px', marginBottom: 16,
                  }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#0369A1' }}>
                      📧 Verification code sent to <strong>{emailOtpTargetRef.current}</strong>
                    </p>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#0284C7' }}>
                      Enter the 6-digit code to confirm your new email address.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        id="ps-email-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={emailOtpCode}
                        onChange={(e) => {
                          setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setEmailOtpErr('');
                        }}
                        autoFocus
                        style={{
                          ...inputSt(!!emailOtpErr),
                          width: 160, letterSpacing: 4,
                          fontSize: 18, textAlign: 'center',
                          background: '#fff',
                        }}
                      />
                      <Btn
                        type="button"
                        loading={emailOtpStage === 'verifying'}
                        label="Verify & Save"
                        loadingLabel="Verifying…"
                        onClick={verifyEmailOtpAndSave}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (emailOtpCooldown > 0) return;
                          sendEmailOtp();
                        }}
                        disabled={emailOtpCooldown > 0 || emailOtpStage === 'sending'}
                        style={{
                          background: 'none', border: 'none',
                          fontSize: 12, color: '#0369A1',
                          fontWeight: 600, cursor: emailOtpCooldown > 0 ? 'not-allowed' : 'pointer',
                          padding: '4px 2px', fontFamily: 'inherit',
                        }}
                      >
                        {emailOtpCooldown > 0 ? `Resend in ${emailOtpCooldown}s` : 'Resend'}
                      </button>
                    </div>
                    {emailOtpErr && (
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#EF4444' }}>{emailOtpErr}</p>
                    )}
                  </div>
                )}

                <Field label="Phone Number" hint="Phone is verified and cannot be changed here.">
                  <input
                    id="ps-phone"
                    value={cu?.phone || ''}
                    readOnly
                    style={{ ...inputSt(false), opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </Field>

                {/* Show different button depending on email-change stage */}
                {isChangingEmail && emailOtpStage === 'idle' ? (
                  <Btn
                    type="button"
                    loading={emailOtpStage === 'sending'}
                    label="Send Verification Code"
                    loadingLabel="Sending…"
                    onClick={sendEmailOtp}
                  />
                ) : isChangingEmail && emailOtpStage === 'awaiting-otp' ? (
                  // OTP UI already shown above; primary action is Verify & Save there
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOtpStage('idle');
                      setEmailOtpCode('');
                      setEmailOtpErr('');
                    }}
                    style={{
                      background: 'none', border: '1.5px solid #D8E4CC',
                      color: '#6B7C65', fontSize: 13, fontWeight: 600,
                      borderRadius: 10, padding: '9px 18px',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancel email change
                  </button>
                ) : (
                  <Btn loading={accLoading} label="Save Changes" />
                )}
              </form>
            </Card>
          </>
        )}

        {/* ══ TAB: SECURITY ═════════════════════════════════════ */}
        {activeTab === 'security' && (
          <Card title="Change Password" subtitle="Use a strong, unique password.">
            <form onSubmit={savePassword}>
              {[
                { key: 'oldPassword',     label: 'Current Password',    show: 'old',     hint: undefined },
                { key: 'newPassword',     label: 'New Password',         show: 'new',     hint: 'At least 8 characters' },
                { key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm', hint: undefined },
              ].map(({ key, label, show, hint }) => (
                <Field key={key} label={label} error={pwErrs[key]} hint={hint}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id={`ps-${key}`}
                      type={showPw[show] ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={(e) => {
                        setPwForm(p => ({ ...p, [key]: e.target.value }));
                        setPwErrs(p => ({ ...p, [key]: '' }));
                      }}
                      placeholder="••••••••"
                      style={{ ...inputSt(pwErrs[key]), paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                      aria-label="Toggle visibility"
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#8FA87E', fontSize: 15, padding: 2,
                      }}
                    >
                      {showPw[show] ? '🙈' : '👁️'}
                    </button>
                  </div>
                </Field>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Btn loading={pwLoading} label="Update Password" />
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#3D7A2B', textDecoration: 'none' }}>
                  Forgot your password?
                </Link>
              </div>
            </form>
          </Card>
        )}

        {/* ══ TAB: PAYOUT (farmer only) ═════════════════════════ */}
        {activeTab === 'payout' && isFarmer && (
          <>
            <Card
              title="Payout Details"
              subtitle="Receive payments for crop orders via UPI or bank transfer."
            >
              <form onSubmit={savePayout}>

                {/* UPI */}
                <div style={{
                  background: '#F7FAF4', borderRadius: 12, padding: 16,
                  border: '1.5px solid #D8E4CC', marginBottom: 20,
                }}>
                  <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#3D5030' }}>
                    💳 UPI Payment
                  </p>
                  <Field label="UPI ID" error={payErrs.upiId}
                    hint="e.g. yourname@upi or 9876543210@paytm"
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        id="ps-upiId"
                        value={payForm.upiId}
                        onChange={(e) => {
                          setPayForm(p => ({ ...p, upiId: e.target.value }));
                          setPayErrs(p => ({ ...p, upiId: '' }));
                          setUpiVerified(false);
                          setUpiName('');
                        }}
                        placeholder="yourname@upi"
                        style={{ ...inputSt(payErrs.upiId), flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={verifyUpi}
                        disabled={upiVerifying || !payForm.upiId.trim()}
                        style={{
                          padding: '10px 16px', borderRadius: 10, border: 'none',
                          background: '#3D7A2B', color: '#fff', fontSize: 13, fontWeight: 600,
                          cursor: upiVerifying || !payForm.upiId.trim() ? 'not-allowed' : 'pointer',
                          opacity: upiVerifying || !payForm.upiId.trim() ? 0.6 : 1,
                          fontFamily: 'inherit', whiteSpace: 'nowrap',
                        }}
                      >
                        {upiVerifying ? '…' : 'Verify'}
                      </button>
                    </div>
                  </Field>
                  {upiVerified && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', background: '#DCFCE7',
                      borderRadius: 8, fontSize: 13, color: '#15803D',
                    }}>
                      <span>✓</span>
                      <span>Verified — <strong>{upiName}</strong></span>
                    </div>
                  )}
                </div>

                {/* Bank */}
                <div style={{
                  background: '#F7FAF4', borderRadius: 12, padding: 16,
                  border: '1.5px solid #D8E4CC', marginBottom: 20,
                }}>
                  <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#3D5030' }}>
                    🏦 Bank Account (optional)
                  </p>
                  <Field label="Account Holder Name">
                    <input
                      id="ps-accountHolderName"
                      value={payForm.accountHolderName}
                      onChange={(e) => setPayForm(p => ({ ...p, accountHolderName: e.target.value }))}
                      placeholder="As per bank records"
                      style={inputSt(false)}
                    />
                  </Field>
                  <Field label="Bank Account Number">
                    <input
                      id="ps-bankAccountNumber"
                      value={payForm.bankAccountNumber}
                      onChange={(e) => setPayForm(p => ({
                        ...p, bankAccountNumber: e.target.value.replace(/\D/g, ''),
                      }))}
                      placeholder="1234567890"
                      style={inputSt(false)}
                    />
                  </Field>
                  <Field label="IFSC Code" error={payErrs.ifscCode}>
                    <input
                      id="ps-ifscCode"
                      value={payForm.ifscCode}
                      onChange={(e) => {
                        setPayForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }));
                        setPayErrs(p => ({ ...p, ifscCode: '' }));
                      }}
                      placeholder="SBIN0001234"
                      style={inputSt(payErrs.ifscCode)}
                    />
                  </Field>
                </div>

                <Btn loading={payLoading} label="Save Payout Details" />
              </form>
            </Card>

            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: '#FEF9C3', border: '1px solid #FDE68A',
              color: '#92400E', fontSize: 13,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span>⚠️</span>
              <span>
                Your payout details are encrypted and used only to release payments after
                confirmed deliveries. They are never shared with buyers.
              </span>
            </div>
          </>
        )}

        {/* ══ TAB: ACCOUNT STATUS ═══════════════════════════════ */}
        {activeTab === 'account' && (
          <>
            <Card title="Account Status" subtitle="Verification and standing of your account.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {[
                  { label: 'Email Address', value: cu?.email, key: 'isEmailVerified' },
                  { label: 'Phone Number',  value: cu?.phone, key: 'isPhoneVerified'  },
                ].map(({ label, value, key }) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '14px 16px',
                    background: '#F7FAF4', borderRadius: 12,
                    border: '1px solid #E8EFE4', flexWrap: 'wrap', gap: 8,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3D5030' }}>{label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7C65' }}>{value || '—'}</p>
                    </div>
                    <Badge ok={!!cu?.[key]} label={cu?.[key] ? 'Verified' : 'Not Verified'} />
                  </div>
                ))}

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '14px 16px',
                  background: '#F7FAF4', borderRadius: 12,
                  border: '1px solid #E8EFE4', flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3D5030' }}>Account Status</p>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7C65' }}>
                      {cu?.isActive !== false ? 'Your account is in good standing.' : 'Account is currently inactive.'}
                    </p>
                  </div>
                  <Badge ok={cu?.isActive !== false} label={cu?.isActive !== false ? 'Active' : 'Inactive'} />
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '14px 16px',
                  background: '#F7FAF4', borderRadius: 12, border: '1px solid #E8EFE4',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3D5030' }}>Account Role</p>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7C65', textTransform: 'capitalize' }}>
                      {cu?.role}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12,
                    background: '#E8F5E9', color: '#2E7D32', fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {cu?.role}
                  </span>
                </div>

                {cu?.createdAt && (
                  <div style={{
                    padding: '14px 16px', background: '#F7FAF4',
                    borderRadius: 12, border: '1px solid #E8EFE4',
                  }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3D5030' }}>Member Since</p>
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7C65' }}>
                      {new Date(cu.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      <Toast msg={toast.msg} ok={toast.ok} />

      <style>{`
        @keyframes ps-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ps-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        #ps-name:focus, #ps-email:focus, #ps-phone:focus,
        #ps-oldPassword:focus, #ps-newPassword:focus, #ps-confirmPassword:focus,
        #ps-upiId:focus, #ps-accountHolderName:focus,
        #ps-bankAccountNumber:focus, #ps-ifscCode:focus {
          border-color: #3D7A2B !important;
          box-shadow: 0 0 0 3px rgba(61,122,43,0.12);
          background: #fff !important;
        }
      `}</style>
    </div>
  );
}
