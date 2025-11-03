import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCloudUploadAlt, FaSpinner, FaCheck } from 'react-icons/fa';

const Upload = ({ setError, fetchVideos, Host }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  // Cloudinary configuration
  const cloudName = "de13d1vnc"; 
  const uploadPreset = "my_upload_preset";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please select a valid video file (MP4, WebM, OGG, MOV, AVI).");
        return;
      }
      
      // Validate file size (100MB limit for Cloudinary)
      const maxSize = 100 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError("File size too large. Please select a video under 100MB.");
        return;
      }
      
      setFile(selectedFile);
      setError("");
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'video');
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload to Cloudinary');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Please provide a title and select a video file.");
      return;
    }

    if (title.length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for Cloudinary upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Upload to Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Save video info to your backend
      const videoData = {
        title: title.trim(),
        videoUrl: cloudinaryResponse.secure_url,
        cloudinaryId: cloudinaryResponse.public_id,
        duration: cloudinaryResponse.duration,
        fileSize: cloudinaryResponse.bytes
      };

      await axios.post(`${Host}/api/videos/upload`, videoData);
      
      // Cleanup
      setTitle("");
      setFile(null);
      setPreviewUrl("");
      setUploadProgress(0);
      setError("");
      
      // Show success and redirect
      setError("Video uploaded successfully!");
      setTimeout(() => {
        fetchVideos();
        navigate("/");
      }, 1500);
      
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(error.response?.data?.error || "Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewUrl("");
    setTitle("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-100 py-8">
      <div className="card w-full max-w-2xl  shadow-2xl">
        <div className="card-body bg-gradient-to-r from-purple-600 to-purple-800">
          <div className="text-center mb-6">
            <FaCloudUploadAlt className="mx-auto text-4xl text-gradient-to-r from-purple-600 to-purple-800 mb-2" />
            <h2 className="text-2xl font-bold">Upload Video</h2>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Video Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your video"
                className="input input-bordered w-full border-[#800080] focus:border-purple-600"
                required
                maxLength={100}
                disabled={uploading}
              />
              <label className="label">
                <span className="label-text-alt">{title.length}/100 characters</span>
              </label>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Select Video</span>
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full border-[#800080] focus:border-purple-600"
                required
                disabled={uploading}
              />
              <label className="label">
                <span className="label-text-alt">MP4, WebM, OGG, MOV, AVI • Max 100MB</span>
              </label>
            </div>

            {/* Video Preview */}
            {previewUrl && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Preview</span>
                </label>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                {file && (
                  <div className="text-sm text-gray-500 mt-2">
                    File: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {uploadProgress < 100 ? 'Uploading to Cloudinary...' : 'Processing...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={uploadProgress} 
                  max="100"
                ></progress>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {file && !uploading && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary flex-1 bg-[#800080] hover:bg-purple-700 border-none text-white"
                disabled={uploading || !file || !title.trim()}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </>
                ) : uploadProgress === 100 ? (
                  <>
                    <FaCheck className="mr-2" />
                    Success!
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mr-2 " />
                    Upload 
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => navigate("/")}
              className="btn btn-ghost btn-sm"
              disabled={uploading}
            >
              Back to Home
            </button>
          </div>

          {/* Cloudinary Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">AD</h3>
            <p className="text-sm text-blue-600">
              Your videos are securely stored and delivered through Cloudinary's global CDN for optimal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;