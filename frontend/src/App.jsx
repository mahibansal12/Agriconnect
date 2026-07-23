import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "./redux/slices/authSlice";
import AppRoutes from "./routes/AppRoutes";
import FloatingAIAssistant from "./components/common/FloatingAIAssistant";
import ScrollToTop from "./components/common/ScrollToTop";

export default function App() {
  const dispatch = useDispatch();

  // Restore user session from localStorage on every page refresh
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <FloatingAIAssistant />
    </>
  );
}
