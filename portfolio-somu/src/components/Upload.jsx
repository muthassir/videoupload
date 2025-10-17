import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const Upload = ({setError, fetchVideos, Host}) => {

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError("Please provide a title and select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);

    try {
      await axios.post(`${Host}/api/videos/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      setError("");
      fetchVideos()
      navigate("/")
    } catch (error) {
      console.error("Error uploading video:", error);
      setError("Failed to upload video.");
    }
  };
  return (
    <div className="h-screen flex justify-center items-center flex-col">
        <h2 className="text-xl font-semibold mb-2">Upload Video</h2>
        <form onSubmit={handleUpload} className="space-y-4 m-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video Title"
            className="w-full p-2 border rounded file-input border-[#800080]"
            required
          />
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileChange}
            className="w-full p-2 border rounded file-input border-[#800080] "
            required
          />
          <button
            type="submit"
            className="btn bg-[#800080] text-white px-4 py-2 w-full cursor-pointer rounded"
          >
            Upload
          </button>
        </form>
      </div>
  )
}

export default Upload