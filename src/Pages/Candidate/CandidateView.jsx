import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Image, Spin, Alert } from "antd";
import Post from "../../Components/Post";
import {
  getAllCandidates,
  getApprovedPostsByCandidate,
  getStorageUrl,
} from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";

const CandidateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch candidate details
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        // Using getAllCandidates since it's a public endpoint
        const response = await getAllCandidates();

        // Find the specific candidate by ID
        const candidateData = Array.isArray(response.candidates)
          ? response.candidates.find((c) => c.id === parseInt(id))
          : Array.isArray(response)
          ? response.find((c) => c.id === parseInt(id))
          : null;

        if (candidateData) {
          setCandidate(candidateData);
        } else {
          setError("Candidate not found");
        }
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError("Failed to load candidate data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  // Handle missing data with placeholders
  const candidateName = candidate?.user?.name || "Unknown Candidate";
  const position = candidate?.position?.name || "Candidate";
  const partylist = candidate?.partylist?.name || "Independent";
  const bio = candidate?.bio || "No bio available";

  // Get proper URL for profile image
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return getStorageUrl(path);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading candidate profile..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={() => navigate(-1)}
              className="bg-[#38438c] text-white px-4 py-1 rounded hover:bg-[#2a3178] transition-colors"
            >
              Go Back
            </button>
          }
        />
      </div>
    );
  }

  // Missing candidate data
  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert
          message="Candidate Not Found"
          description="The candidate you're looking for doesn't exist or has been removed."
          type="warning"
          showIcon
          action={
            <button
              onClick={() => navigate(-1)}
              className="bg-[#38438c] text-white px-4 py-1 rounded hover:bg-[#2a3178] transition-colors"
            >
              Go Back
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-56 bg-[#3F4B8C] overflow-hidden">
          {candidate.banner_image ? (
            <img
              src={getImageUrl(candidate.banner_image)}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#3F4B8C] to-[#5A67D8]"></div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pb-4">
          {/* Profile Picture - Overlapping Banner */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              <Image
                src={getImageUrl(candidate.profile_photo)}
                alt={candidateName}
                className="w-full h-full object-cover"
                fallback="/default-profile.png"
                preview={false}
                onError={() => setImageError(true)}
              />
            </div>
          </div>

          {/* Name and Details */}
          <div className="ml-32 pt-2">
            <h1 className="text-[#3F4B8C] text-2xl font-bold">
              {candidateName}
            </h1>
            <div className="flex flex-row text-sm mt-1 gap-5">
              <span className="text-[#3F4B8C] font-medium">{position}</span>
              <span className="text-[#3F4B8C] font-medium">{partylist}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Bio</h2>
            <div className="border border-[#3F4B8C] border-opacity-30 rounded-md p-4 bg-blue-50 bg-opacity-30">
              <p className="text-gray-700">{bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Posts</h2>
        <Post readOnly={true} candidateId={candidate.id} />
      </div>
    </div>
  );
};

export default CandidateView;
