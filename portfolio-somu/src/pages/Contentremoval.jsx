import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaComment, FaSpinner } from 'react-icons/fa';

const Contentremoval = ({ setError, Host }) => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRemove = async (e) => {
    e.preventDefault();
    
    if (!email || !msg.trim()) {
      setError("Please provide both email and message.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (msg.trim().length < 10) {
      setError("Please provide a detailed message (at least 10 characters).");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${Host}/api/contentremove`, { 
        msg: msg.trim(), 
        email: email.trim() 
      });
      
      setMsg('');
      setEmail('');
      setError('');
      
      // Show success message
      setError("Content removal request submitted successfully!");
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting content removal request:", error);
      setError(error.response?.data?.error || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex justify-center items-center bg-base-100 py-8'>
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body bg-gradient-to-r from-purple-600 to-purple-800">
          <div className="text-center mb-6">
            <FaComment className="mx-auto text-3xl text-[#800080] mb-2" />
            <h2 className="text-2xl font-bold">Content Removal Request</h2>
            <p >
              Submit a request to remove content that violates our policies
            </p>
          </div>
          
          <form onSubmit={handleRemove} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input input-bordered w-full pl-10 border-[#800080] focus:border-purple-600"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Removal Request Details</span>
              </label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Please provide detailed information about the content you want removed, including video titles, URLs, and reasons for removal..."
                className="textarea textarea-bordered w-full h-32 border-[#800080] focus:border-purple-600 resize-none"
                required
                maxLength={1000}
                disabled={submitting}
              />
              <label className="label">
                <span className="label-text-alt">{msg.length}/1000 characters</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full bg-[#800080] hover:bg-purple-700 border-none text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>

          <div className="text-center mt-4 space-y-2">
            <button 
              onClick={() => navigate("/")}
              className="btn btn-ghost btn-sm"
              disabled={submitting}
            >
              Back to Home
            </button>
            <p className="text-xs">
              We'll review your request and respond within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contentremoval;