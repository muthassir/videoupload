import React, { useEffect, useState } from "react";
import { FaHeart, FaSearch } from "react-icons/fa";

const Home = ({ error, ad, videos, handleVideoError }) => {
  const [likedVideos, setLikedVideos] = useState(() => {
    const storedLikes = localStorage.getItem("likedVideos");
    return storedLikes ? JSON.parse(storedLikes) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState(videos);

  useEffect(() => {
    localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
  }, [likedVideos]);

  useEffect(() => {
    const results = videos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVideos(results);
  }, [searchQuery, videos]);

  const handleLike = (videoId) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos(likedVideos.filter((id) => id !== videoId));
    } else {
      setLikedVideos([...likedVideos, videoId]);
    }
  };

  const isVideoLiked = (videoId) => likedVideos.includes(videoId);

  const likedVideoList = videos.filter((video) => likedVideos.includes(video._id));

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search videos..."
            className="input input-bordered w-full pr-10 file-input border-2 border-[#800080]"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaSearch className="text-gray-500" />
          </div>
        </div>
      </div>
      {/* */}
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="my_tabs_2"
          className="tab "
          aria-label="Latest"
          defaultChecked
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <div key={video._id} className="rounded p-4">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-lg font-medium mb-2">{video.title}</h3>
                  <button className="cursor-pointer" onClick={() => handleLike(video._id)}>
                    <FaHeart
                      className={isVideoLiked(video._id) ? "text-[#800080]" : "text-gray-500"}
                    />
                  </button>
                </div>
                <video
                  src={`http://localhost:5000${video.videoUrl}`}
                  controls
                  className="w-full h-48 object-cover rounded"
                  onError={handleVideoError}
                />
              </div>
            ))}
            {filteredVideos.length === 0 && searchQuery !== "" && (
              <p>No videos found matching your search query.</p>
            )}
            {filteredVideos.length === 0 && searchQuery === "" && videos.length === 0 && (
              <p>No videos available.</p>
            )}
          </div>
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Watch Uploads"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          Tab content 2
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Liked"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          {likedVideoList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedVideoList.map((video) => (
                <div key={video._id} className="rounded p-4">
                  <h3 className="text-lg font-medium mb-2">{video.title}</h3>
                  <video
                    src={`http://localhost:5000${video.videoUrl}`}
                    controls
                    className="w-full h-48 object-cover rounded"
                    onError={handleVideoError}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="h-screen">No liked videos yet.</p>
          )}
        </div>
      </div>
      {/* */}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {/* Ad Section */}
      {ad && (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Sponsored Ad</h2>
          <a href={ad.url} target="_blank" rel="noopener noreferrer">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="text-lg font-medium">{ad.title}</p>
          </a>
        </div>
      )}

      {/* Video List */}
    </div>
  );
};

export default Home;