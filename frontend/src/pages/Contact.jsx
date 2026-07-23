import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function Contact() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FBF5E7' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '80px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0A2E0C', marginBottom: '20px' }}>Contact Us</h1>
        <p style={{ fontSize: '18px', color: '#3A4D38', lineHeight: '1.6', marginBottom: '40px' }}>
          Have questions or need assistance? We're here to help. Reach out to our support team and we will get back to you as soon as possible.
        </p>
        
        <div style={{ backgroundColor: '#fff', padding: '50px 40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1B5E20', marginBottom: '16px' }}>Email Support</h2>
          <p style={{ fontSize: '16px', color: '#5C6B5A', marginBottom: '24px' }}>
            For all inquiries, please email us directly at:
          </p>
          <a href="mailto:admin5939@gmail.com" style={{ display: 'inline-block', fontSize: '20px', fontWeight: '700', color: '#0284C7', textDecoration: 'none', padding: '14px 28px', backgroundColor: '#E0F2FE', borderRadius: '10px', transition: 'background 0.2s' }}>
            admin5939@gmail.com
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
