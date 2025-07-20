import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { useThemeInit } from "@/hooks/useThemeInit"

const AppWithTheme = () => {
  useThemeInit();
  return (
    <>
      <App />
      <Toaster />
    </>
  );
};

createRoot(document.getElementById("root")!).render(<AppWithTheme />);
  