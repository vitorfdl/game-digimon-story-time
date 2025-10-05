import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter basename={import.meta.env.BASE_URL}>
		<App />
	</BrowserRouter>,
);
