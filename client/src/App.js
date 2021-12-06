import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Routes, Route } from "react-router-dom";
import ToolBar from "./components/ToolBar";
import ImagePage from "./pages/ImagePage";

function App() {
  return (
    <div style={{ maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
      <ToastContainer />
      <ToolBar />

      <Routes>
        <Route path="/images/:imageId" exact element={<ImagePage />} />
        <Route path="/auth/login" exact element={<LoginPage />} />
        <Route path="/auth/register" exact element={<RegisterPage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </div>
  );
}

export default App;
