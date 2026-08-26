import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { setupLeafletDefaults } from "./lib/leafletIcons";

setupLeafletDefaults();

createRoot(document.getElementById("root")!).render(<App />);
