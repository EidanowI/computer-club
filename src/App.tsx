import { Routes, Route } from 'react-router-dom';
import "./test.css"
import Home from "./pages/Home/Home";
import UserProfile from "./pages/UserProfile/UserProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  );
}

export default App
