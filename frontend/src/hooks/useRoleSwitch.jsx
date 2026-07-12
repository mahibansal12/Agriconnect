// src/hooks/useRoleSwitch.js
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { switchToRole } from "../redux/slices/authSlice";

/**
 * Single source of truth for "switch to the other role" behaviour.
 * - If a valid (or refreshable) cached session exists for the target role,
 *   restore it and go straight to that role's dashboard.
 * - Otherwise, keep the current session alive and send the user to
 *   /login?role=<target> so they can sign in (or create an account) for
 *   that role without losing their current one.
 *
 * Use this from any component that offers a role switch — don't
 * reimplement the logic locally, or it'll drift out of sync again.
 */
export default function useRoleSwitch(currentRole) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const targetRole = currentRole === "farmer" ? "buyer" : "farmer";

  const switchRole = async () => {
    setSwitching(true);
    const result = await dispatch(switchToRole(targetRole));
    setSwitching(false);

    if (result.payload?.needsLogin) {
      navigate(`/login?role=${targetRole}`, { replace: true });
    } else {
      navigate(`/${targetRole}/dashboard`, { replace: true });
    }
  };

  return { targetRole, switching, switchRole };
}