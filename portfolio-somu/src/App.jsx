import Header from "./components/Header";
import Home from "./components/Home";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import Upload from "./components/Upload";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Age from "./components/Age";
import Contentremoval from "./pages/Contentremoval";
import Dmca from "./pages/Dmca";
import Privacy from "./pages/Privacy";

function App() {
  const Host = "https://videoupload-wp35.onrender.com";
  // const Host = "http://localhost:5000";

  const [videos, setVideos] = useState([]);
  const [ad, setAd] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch videos and ad on mount
  useEffect(() => {
    fetchVideos();
    fetchAd();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Host}/api/videos`);
      setVideos(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAd = async () => {
    try {
      const response = await axios.get(`${Host}/api/ads/random`);
      setAd(response.data);
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
  };

  const handleVideoError = (e) => {
    console.error("Video playback error:", e);
    setError(`Failed to play video: ${e.target.error?.message || 'Unknown error'}`);
  };

  return (
    <>
      <BrowserRouter>
        <Header />
        <Age />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                error={error}
                ad={ad}
                videos={videos}
                loading={loading}
                handleVideoError={handleVideoError}
                Host={Host}
              />
            }
          />
          <Route
            path="/upload"
            element={<Upload setError={setError} fetchVideos={fetchVideos} Host={Host} />}
          />
          <Route
            path="/content-removal"
            element={<Contentremoval setError={setError} Host={Host} />}
          />
          <Route path="/DMCA" element={<Dmca />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;