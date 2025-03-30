import React from 'react';

const CandidateCard = ({ candidate, selected, onSelect }) => {
  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 h-80 ${selected ? 'border-2 border-[#3F4B8C]' : 'border border-gray-300'}`}
      onClick={() => onSelect(candidate.id)}
    >
      {/* Top section with avatar */}
      <div className="relative h-3/5 flex items-center justify-center bg-gray-100">
        <div className="absolute top-4 right-4">
          <div className={`w-6 h-6 rounded-full border ${selected ? 'bg-[#3F4B8C] border-[#3F4B8C]' : 'bg-white border-gray-400'}`}>
            {selected && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            )}
          </div>
        </div>
        <div className="w-28 h-28 bg-[#F0E6FF] rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#3F4B8C]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Bottom section with name and partylist */}
      <div className="h-2/5 p-4 flex flex-col justify-center border-t border-gray-200">
        <h3 className="text-[#3F4B8C] font-bebas text-2xl leading-tight mb-2">{candidate.name}</h3>
        <p className="text-[#3F4B8C] text-sm flex items-center">
          <span className="text-[#3F4B8C] mr-2">•</span>
          {candidate.partylist}
        </p>
      </div>
    </div>
  );
};

export default CandidateCard;
