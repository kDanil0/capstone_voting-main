import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, User, Edit, X, Check } from "lucide-react";
import StatusBadge from "../CommonComponents/StatusBadge";
import Post from "../Post";
import { BASE_URL } from "../../utils/api";

/**
 * CandidateProfile component displays a candidate's profile information, posts, and documents
 * @param {Object} props Component props
 * @param {Object} props.candidateData Data for the candidate
 * @param {Function} props.onBioUpdate Callback for updating candidate bio
 * @param {Function} props.onPhotoUpload Callback for uploading profile photo
 */
const CandidateProfile = ({ candidateData, onBioUpdate, onPhotoUpload }) => {
  const navigate = useNavigate();

  // State management
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(candidateData?.bio || "");
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * Navigate to documents page
   */
  const handleDocumentClick = () => {
    navigate("/document");
  };

  /**
   * Handle file selection for profile image upload
   * @param {Event} e The file input change event
   */
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setProfileImage(e.target.files[0].name);
    }
  };

  /**
   * Submit an updated bio
   */
  const handleBioSubmit = async () => {
    try {
      await onBioUpdate(newBio);
      setIsEditingBio(false);
    } catch (error) {
      console.error("Failed to update bio:", error);
    }
  };

  /**
   * Handle profile photo upload
   * @param {Event} e The file input change event
   */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        await onPhotoUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  /**
   * Get the full storage URL for a file path
   * @param {string} path The relative file path
   * @returns {string|null} The full storage URL or null if no path provided
   */
  const getStorageUrl = (path) => {
    if (!path) return null;
    const baseUrl = BASE_URL.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${baseUrl}/storage/${cleanPath}`;
  };

  /**
   * Render the profile image or placeholder if no image exists
   * @returns {JSX.Element} The profile image component
   */
  const renderProfileImage = () => {
    if (!candidateData?.profile_photo || imageError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
          <User size={40} className="text-gray-400" />
        </div>
      );
    }

    const imageUrl = getStorageUrl(candidateData.profile_photo);

    return (
      <img
        src={imageUrl}
        alt={candidateData.user?.name || "Profile"}
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          console.error("Image failed to load:", e);
          setImageError(true);
        }}
      />
    );
  };

  // Early return if no candidate data is available
  if (!candidateData) return null;

  return (
    <div className="h-full max-w-[1200px] mx-auto pt-6 px-4">
      <div className="flex gap-6">
        {/* Main Content Column */}
        <div className="flex-grow max-w-[800px]">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {/* Banner Image */}
            <div className="h-48 bg-[#38438c] rounded-t-lg relative">
              {candidateData?.banner_image && (
                <img
                  src={getStorageUrl(candidateData.banner_image)}
                  alt="Banner"
                  className="w-full h-full object-cover rounded-t-lg"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-5">
              <div className="flex items-end -mt-10">
                {/* Profile Picture with Upload Button */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                    {renderProfileImage()}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-[#38438c] text-white p-2 rounded-full cursor-pointer hover:bg-[#4B5FCD] shadow-md transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={isUploading}
                    />
                    <Upload size={16} />
                  </label>
                </div>

                {/* Candidate Details */}
                <div className="ml-4 -mb-4">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {candidateData?.user?.name}
                  </h1>
                  <p className="text-gray-600">
                    {candidateData?.position?.name}
                  </p>
                  <div className="text-[#38438c] font-medium">
                    {candidateData?.partylist?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="border-t border-gray-100 px-6 py-5">
              <div className="rounded-lg p-4">
                {/* Bio Header with Edit Button */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-gray-800">Bio</h2>
                  {!isEditingBio && (
                    <button
                      onClick={() => {
                        setIsEditingBio(true);
                        setNewBio(candidateData?.bio || "");
                      }}
                      className="text-[#38438c] hover:text-[#4B5FCD] transition-colors"
                      aria-label="Edit bio"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>

                {/* Bio Content - Edit Mode or Display Mode */}
                {isEditingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38438c] focus:border-transparent transition-all"
                      rows="4"
                      placeholder="Write your bio here..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditingBio(false);
                          setNewBio(candidateData?.bio || "");
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Cancel"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={handleBioSubmit}
                        className="p-1.5 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50 transition-colors"
                        aria-label="Save"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed border border-gray-200 rounded-lg p-2">
                    {candidateData?.bio || "No bio available"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5">
              <h2 className="font-bold text-gray-800 mb-4">Posts</h2>
              <Post readOnly={false} candidateId={candidateData.id} />
            </div>
          </div>
        </div>

        {/* Documents Column */}
        <div className="w-[320px]">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Documents</h2>

            {/* Document Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 mb-5 text-center">
              <p className="text-gray-500 text-sm">
                Drag and drop files here to upload
              </p>
            </div>

            {/* Document List */}
            <div className="space-y-2.5">
              {/* Example documents - replace with actual data */}
              {[
                { name: "PLATFORM PROPOSAL", status: "APPROVED" },
                { name: "LEAVE OF CONSULTATION", status: "APPROVED" },
                { name: "INCREASE OF FUNDS", status: "APPROVED" },
              ].map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2.5 rounded"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {doc.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded font-medium">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;

{
  /* Add this CSS to your global styles or as a style tag */
}
<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(56, 115, 140, 0.1);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(56, 115, 140, 0.3);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(56, 115, 140, 0.5);
  }
`}</style>;
