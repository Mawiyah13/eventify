import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminRegistration from "./pages/AdminRegistrations";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <BrowserRouter>
      {/* 🌈 Global Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        
        <Navbar />

        {/* 📦 Centered Page Container */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/events/:id/registrations"
              element={
                <AdminRoute>
                  <AdminRegistration />
                </AdminRoute>
              }
            />
            <Route path="/event/:id" element={<EventDetails />} />

          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
