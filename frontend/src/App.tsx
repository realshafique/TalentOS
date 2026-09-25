import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";

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
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/discover" element={<Discover />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-profile" element={<CreateProfile />} />

        <Route
          path="/student/:studentId"
          element={<StudentProfile />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;