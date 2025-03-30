import React from "react";
import Post from "../Post";

const CandidateProfileView = ({ candidate }) => {
  // Default candidate data (replace with props or API data)
  const defaultCandidate = {
    name: "Cullera, Michael Angelo",
    partylist: "TAKBONGKABAYO PARTYLIST",
    position: "CCIS VP CANDIDATE",
    image: "/path/to/candidate-image.jpg",
    bio: "Ako gawin niyong vice president, walang required bayaran at walang corruption",
    platform: [
      "MAGING POGI AT MAGANDA LAHAT",
      "PEDE KAHIT ANONG ASTETIK",
      "MAGANDANG DEPT SHIRT",
      "DI PAPANG LABAS ANG FUNDS"
    ]
  };

  const candidateData = candidate || defaultCandidate;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-56 bg-[#3F4B8C] overflow-hidden">
          <img 
            src="/path/to/partylist-banner.jpg" 
            alt="PARTYLIST BANNER PICTURE" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pb-4">
          {/* Profile Picture - Overlapping Banner */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              <img 
                src={candidateData.image} 
                alt={candidateData.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Details - Positioned next to profile picture */}
          <div className="ml-32 pt-2">
            <h1 className="text-[#3F4B8C] font-climate text-2xl">
              {candidateData.name}
            </h1>
            <div className="flex flex-row text-sm mt-1 gap-5">
              <span className="text-[#3F4B8C] font-bebas">
                {candidateData.position}
              </span>
              <span className="text-[#3F4B8C] font-bebas">
                {candidateData.partylist}
              </span>
            </div>
          </div>

          {/* Bio and Platform Boxes */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Bio Box */}
            <div className="border border-[#3F4B8C] border-dashed rounded-md p-4">
              <h3 className="text-[#3F4B8C] font-bebas">
                {candidateData.bio}
              </h3>
            </div>

            {/* Platform Box */}
            <div className="border border-[#3F4B8C] border-dashed rounded-md p-4">
              <h3 className="text-[#3F4B8C] font-bebas">
                {candidateData.platform.join(", ")}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileView; 