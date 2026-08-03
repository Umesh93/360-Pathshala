import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./modules/admin/students/components/Toast";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
