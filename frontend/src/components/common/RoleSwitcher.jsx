import useRoleSwitch from '../../hooks/useRoleSwitch';

export default function RoleSwitcher({ currentRole }) {
    const { targetRole, switching, switchRole } = useRoleSwitch(currentRole);

    return (
        <button onClick={switchRole} className="role-switcher-btn" disabled={switching}>
            {switching ? 'Switching…' : `Switch to ${targetRole === 'buyer' ? 'Buyer' : 'Farmer'}`}
        </button>
    );
}
