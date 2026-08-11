import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorProtectedRoute from "./components/DoctorProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Departments from "./pages/Departments";
import Contact from "./pages/Contact";
import BookAppointment from "./pages/BookAppointment";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />

          {/* Doctor dashboard */}
          <Route
            path="/doctor/appointments"
            element={
              <DoctorProtectedRoute>
                <DoctorAppointments />
              </DoctorProtectedRoute>
            }
          />

          {/* Patient app — all inside Layout (sidebar) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home"             element={<Home />} />
            <Route path="about"            element={<About />} />
            <Route path="departments"      element={<Departments />} />
            <Route path="contact"          element={<Contact />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="profile"          element={<Profile />} />
            <Route path="settings"         element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
