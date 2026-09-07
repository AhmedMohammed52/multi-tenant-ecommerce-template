import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <StrictMode>
      <Toaster position="bottom-right" richColors closeButton />

      <AppRoutes />
    </StrictMode>
  </ThemeProvider>,
);
