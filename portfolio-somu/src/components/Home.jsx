import React, { useEffect, useState, useMemo } from "react";
import { FaHeart, FaSearch, FaSpinner, FaCloud } from "react-icons/fa";

const Home = ({ error, ad, videos, loading, handleVideoError, Host }) => {
  const [likedVideos, setLikedVideos] = useState(() => {
    const storedLikes = localStorage.getItem("likedVideos");
    return storedLikes ? JSON.parse(storedLikes) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");

  // Fix: Ensure videos is always an array
  const videosArray = useMemo(() => {
    if (!videos) return [];
    // If videos is an object with pagination, extract the videos array
    if (videos.videos && Array.isArray(videos.videos)) {
      return videos.videos;
    }
    // If videos is already an array, return it
    if (Array.isArray(videos)) {
      return videos;
    }
    // Fallback to empty array
    return [];
  }, [videos]);

  // Memoized filtered videos for better performance
  const filteredVideos = useMemo(() => {
    if (searchQuery) {
      return videosArray.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return videosArray;
  }, [searchQuery, videosArray]);

  const likedVideoList = useMemo(() => 
    videosArray.filter((video) => likedVideos.includes(video._id)),
    [videosArray, likedVideos]
  );

  useEffect(() => {
    localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
  }, [likedVideos]);

  const handleLike = (videoId) => {
    setLikedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const isVideoLiked = (videoId) => likedVideos.includes(videoId);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const renderVideoGrid = (videoList, emptyMessage) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <FaSpinner className="animate-spin text-4xl text-purple-600 to-purple-800" />
        </div>
      );
    }

    if (!videoList || videoList.length === 0) {
      return (
        <div className="text-center py-12">
          <FaCloud className="mx-auto text-6xl  mb-4" />
          <p className=" text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoList.map((video) => (
          <div key={video._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="card-title text-lg font-semibold line-clamp-2 flex-1 mr-2">
                  {video.title}
                </h3>
                <button 
                  className="btn btn-ghost btn-sm btn-circle hover:bg-red-50 transition-colors"
                  onClick={() => handleLike(video._id)}
                  aria-label={isVideoLiked(video._id) ? "Unlike video" : "Like video"}
                >
                  <FaHeart
                    className={isVideoLiked(video._id) ? "text-purple-500" : "text-gray-400"}
                    size={18}
                  />
                </button>
              </div>
              
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={video.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  onError={handleVideoError}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="card-actions justify-between items-center mt-3">
                <div className="flex items-center gap-2">
                  <FaCloud className="text-purple-500" size={14} />
                  <span className="text-xs text-gray-500">Flixxx</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(video.uploadedAt).toLocaleDateString()}
                  </span>
                  {video.duration && (
                    <span className="badge badge-outline badge-sm">
                      {Math.round(video.duration)}s
                    </span>
                  )}
                </div>
              </div>
              
              {video.fileSize && (
                <div className="text-xs text-gray-400 text-right">
                  {(video.fileSize / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search videos by title..."
            className="input input-bordered w-full pr-12 border-2 border-purple-600 to-purple-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed justify-center mb-8 bg-base-200">
        <button
          className={`tab tab-lg ${activeTab === "latest" ? "tab-active bg-gradient-to-r from-purple-600 to-purple-800 text-white" : ""} `}
          onClick={() => setActiveTab("latest")}
        >
          Latest
        </button>
        <button
          className={`tab tab-lg ${activeTab === "liked" ? "tab-active bg-gradient-to-r from-purple-600 to-purple-800 text-white" : ""}`}
          onClick={() => setActiveTab("liked")}
        >
          Liked ({likedVideoList.length})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`alert ${error.includes('successfully') ? 'alert-success' : 'alert-error'} mb-6`}>
          <span>{error}</span>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="mb-8">
        {activeTab === "latest" && 
          renderVideoGrid(
            filteredVideos, 
            searchQuery ? "No videos found matching your search." : "No videos available. Upload the first video!"
          )
        }
        {activeTab === "liked" && 
          renderVideoGrid(
            likedVideoList, 
            "No liked videos yet. Start liking some videos!"
          )
        }
      </div>

      {/* Ad Section */}
      {ad && (
        <div className="card bg-gradient-to-r from-purple-600 to-purple-800 text-white mb-8">
          <div className="card-body">
            <h2 className="card-title text-purple-200">Sponsored</h2>
            <a 
              href={ad.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="no-underline hover:no-underline"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full md:w-48 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-xl font-semibold mb-2">{ad.title}</p>
                  <p className="text-purple-200">Click to learn more</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;