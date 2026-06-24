import { createRoot } from "react-dom/client";
import "@fontsource/archivo-black/400.css";
import "@fontsource/hind/300.css";
import "@fontsource/hind/400.css";
import "@fontsource/hind/500.css";
import "@fontsource/hind/600.css";
import "@fontsource/hind/700.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
