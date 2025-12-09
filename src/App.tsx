import { Routes, Route } from 'react-router-dom';
import "./test.css"
import Home from "./pages/Home/Home";
import UserProfile from "./pages/UserProfile/UserProfile";
import Order from "./pages/Order/Order";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/order" element={<Order />} />
    </Routes>
  );
}

export default App
