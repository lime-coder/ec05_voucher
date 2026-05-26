import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthContext";
import { Toaster } from "sonner";
import { LanguageProvider } from "./shared/contexts/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </LanguageProvider>
  );
}
