import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import VideoDetail from "./components/VideoDetail";
import VideoEdit from "./components/VideoEdit";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <div className="h-12"></div>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/upload-video" element={authUser ? <VideoUpload /> : <Navigate to="/login" />} />
        <Route path="/videos" element={authUser ? <VideoList /> : <Navigate to="/login" />} />
        <Route path="/videos/:id" element={authUser ?<VideoDetail /> : <Navigate to={'/login'} />} />
        <Route path="/videos/:id/edit" element={authUser ?<VideoEdit /> : <Navigate to={'/login'} />} />
    
      </Routes>
      <Toaster />
    </div>
  );
};
export default App;