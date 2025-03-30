import React from 'react';

const PositionCard = ({ position }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-[#3F4B8C] text-lg font-bold mb-2">{position.title}</h3>
      <p className="text-gray-600 text-sm mb-3">
        {position.candidates.length} candidates
      </p>
      
      <div className="space-y-2">
        {position.candidates.map(candidate => (
          <div key={candidate.id} className="flex items-center">
            <div className="w-8 h-8 bg-[#3F4B8C] rounded-full flex items-center justify-center text-white mr-3">
              {candidate.profile_photo ? (
                <img 
                  src={candidate.profile_photo} 
                  alt={candidate.name}
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-gray-800 font-assistant">{candidate.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionCard; 