import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EventPage from "./pages/EventPage";

export default function App() {
  return (
    <BrowserRouter>
      <main className="container">
        <h1 className="logo">Huddle</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/e/:id" element={<EventPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}