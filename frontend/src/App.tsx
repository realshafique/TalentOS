import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import StudentProfile from "./pages/StudentProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* AI Talent Discovery */}
        <Route
          path="/discover"
          element={<Discover />}
        />

        {/* Teams */}
        <Route
          path="/teams"
          element={<Teams />}
        />

        {/* Current User Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Create Profile */}
        <Route
          path="/create-profile"
          element={<CreateProfile />}
        />

        {/* Student Profile */}
        <Route
          path="/student/:studentId"
          element={<StudentProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;