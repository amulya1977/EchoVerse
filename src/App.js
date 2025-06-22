import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/navbar";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Profile from "./pages/profile";
import ForgotPassword from "./pages/forgotpassword";
import Editor from "./pages/editor";
import Publish from "./pages/publish";
import BlogsDashboard from "./pages/blogs";
import EditBlog from "./pages/editblog";
import BlogDetails from "./pages/blog";
import ProfilePage from "./pages/profilepage";
import NotificationsPage from "./pages/notifications";

// Split App into inner component so we can use `useLocation`
const AppRoutes = () => {
  const location = useLocation();
  const isEditorPage = location.pathname === "/write";

  return (
    <>
      <Navbar
        onPublish={
          isEditorPage ? () => document.dispatchEvent(new CustomEvent("publishBlog")) : undefined
        }
        onSaveDraft={
          isEditorPage ? () => document.dispatchEvent(new CustomEvent("saveDraftBlog")) : undefined
        }
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/write" element={<Editor />} />
        <Route path="/publish/:id" element={<Publish />} />
        <Route path="/blogs" element={<BlogsDashboard />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/profilepage/:username" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/editblog/:id" element={<EditBlog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
