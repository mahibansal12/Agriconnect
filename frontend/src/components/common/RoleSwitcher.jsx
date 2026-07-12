import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';

export default function RoleSwitcher({ currentRole }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const targetRole = currentRole === 'farmer' ? 'buyer' : 'farmer';

    const handleSwitch = () => {
        // Log out the current session and send user to login page
        // with a ?role= hint so Login/Register can pre-select the correct role
        dispatch(logoutUser());
        navigate(`/login?role=${targetRole}`, { replace: true });
    };

    return (
        <button onClick={handleSwitch} className="role-switcher-btn">
            Switch to {targetRole === 'buyer' ? 'Buyer' : 'Farmer'}
        </button>
    );
}