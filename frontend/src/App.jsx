import { Toaster } from 'sonner';
import ProtectedRoute from "../src/components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Navi from "./components/Navi";
import Mainpage from "./components/Mainpage";
import History from "./components/HIstory";
import Signup from "../src/auth/Signup";
import Login from "./auth/Login";
import Profile from "./components/Profile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
function App() {
  return (
    <div>
      <Toaster richColors position="top-center" closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route 
            path="/signup" 
            element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
            } />

            <Route 
              path="/login" 
              element={
              <PublicRoute>
                <Login />
              </PublicRoute>
             } 
            />

          <Route
            path="/swipe"
            element={
              <ProtectedRoute>
                <Navi/>
                <Mainpage/>
              </ProtectedRoute>
            } />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navi/>
                <Profile/>
              </ProtectedRoute>
            } />

            <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Navi/>
                <History/>
              </ProtectedRoute>
            } />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
