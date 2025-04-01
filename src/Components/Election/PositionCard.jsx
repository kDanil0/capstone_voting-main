import React from "react";
import { Image } from "antd";
import { UserOutlined } from "@ant-design/icons";

const PositionCard = ({ position }) => {
  // Function to format profile photo URL
  const formatProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return null;

    // If it's already a full URL, return it
    if (photoPath.startsWith("http")) {
      // For development environment, transform localhost URL if needed
      if (photoPath.includes("127.0.0.1:8000")) {
        return photoPath.replace("127.0.0.1:8000", "localhost:8000");
      }
      return photoPath;
    }

    // If it's a storage path, construct the full URL
    return `${
      process.env.REACT_APP_API_URL || "http://localhost:8000"
    }/storage/${photoPath}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-[#3F4B8C] text-lg font-bold mb-2">
        {position.title}
      </h3>
      <p className="text-gray-600 text-sm mb-3">
        {position.candidates.length} candidates
      </p>

      <div className="space-y-2">
        {position.candidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center">
            <div className="w-8 h-8 bg-[#3F4B8C] rounded-full flex items-center justify-center text-white mr-3 overflow-hidden">
              {candidate.profile_photo ? (
                <Image
                  src={formatProfilePhotoUrl(candidate.profile_photo)}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                  preview={false}
                  fallback="/default-profile.png"
                  placeholder={
                    <div className="w-full h-full flex items-center justify-center bg-[#3F4B8C]">
                      <UserOutlined style={{ color: "white" }} />
                    </div>
                  }
                />
              ) : (
                <UserOutlined />
              )}
            </div>
            <span className="text-gray-800 font-assistant">
              {candidate.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionCard;
