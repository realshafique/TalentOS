import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import StudentProfile from "./pages/StudentProfile";

import Login from "./Login";
import Register from "./Register";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/discover"
            element={<Discover />}
          />

          <Route
            path="/teams"
            element={<Teams />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/create-profile"
            element={<CreateProfile />}
          />

          <Route
            path="/student/:studentId"
            element={<StudentProfile />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;