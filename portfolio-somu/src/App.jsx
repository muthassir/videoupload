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
  // const localHost = "http://localhost:5000"
  const [videos, setVideos] = useState([]);
  const [ad, setAd] = useState(null);
  const [error, setError] = useState("");

  const [api, setApi] = useState([])
 

  // Fetch videos and ad on mount
  useEffect(() => {
    fetchVideos();
    fetchAd();
    getApi()
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/videos");
      setVideos(response.data);
      setError("");
      
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos.");
    }
  };
  const getApi = async ()=>{
try {
  const resp = await axios.get(`/producers/?count=5&offset=0&producerId=5924703508103168&producerName=Playboy&sort=date`)
  console.log(resp.data);
  setApi(resp.data)
} catch (error) {
  console.error("Error fetching videos api:", error);
  setError("Failed to load videos api.");
}
  }
 



  const fetchAd = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/ads/random");
      setAd(response.data);
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
  };

  const handleVideoError = (e) => {
    console.error("Video playback error:", e);
    setError(`Failed to play video: ${e.target.src}`);
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
                handleVideoError={handleVideoError}
              />
            }
          />
          <Route
            path="/upload"
            element={<Upload setError={setError} fetchVideos={fetchVideos} />}
          />
          <Route
            path="/content-removal"
            element={<Contentremoval setError={setError}  />}
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
