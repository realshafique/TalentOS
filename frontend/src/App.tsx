import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/discover" element={<Discover />} />

        <Route path="/teams" element={<Teams />} />

        <Route path="/profile" element={<Profile />} />

        <Route
          path="/create-profile"
          element={<CreateProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;