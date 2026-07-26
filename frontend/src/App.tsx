import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./modules/admin/students/components/Toast";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
