import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "../src/Components/App";
import "../src/style.css";

// Server data handling (local MOQ)
window._frontConfig = 
window._frontConfig || {
    apiBaseUrl: '/api/',
    lumiService: '12025408120',
};

ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById("root")
);
