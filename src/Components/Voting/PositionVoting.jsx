import React from 'react';

const PositionVoting = ({ position, selectedCandidateId, onSelectCandidate }) => {
  // Defensive check if position data is incomplete
  if (!position || !position.candidates) {
    return <div>Loading position information...</div>;
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-climate text-[#3F4B8C] mb-6 text-center">
        {position.position}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {position.candidates.map(candidate => (
          <div 
            key={candidate.id}
            onClick={() => onSelectCandidate(position.position_id, candidate.id)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCandidateId === candidate.id
                ? 'border-[#3F4B8C] bg-blue-50 shadow-md' 
                : 'hover:border-gray-400'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-[#3F4B8C] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                <svg className="h-8 w-8 text-[#3F4B8C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-sm text-gray-600">
                  {candidate.party_list || 'Independent'}
                </p>
                <p className="text-sm text-gray-600">
                  {candidate.department || 'General'}
                </p>
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedCandidateId === candidate.id && (
              <div className="mt-3 text-[#3F4B8C] font-semibold flex items-center">
                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Option to abstain */}
      <div className="mt-4">
        <button
          onClick={() => onSelectCandidate(position.position_id, 'abstain')}
          className={`w-full p-3 rounded-lg border ${
            selectedCandidateId === 'abstain' 
              ? 'bg-gray-200 border-gray-500' 
              : 'bg-white border-gray-300 hover:bg-gray-100'
          }`}
        >
          Abstain from voting for this position
        </button>
      </div>
    </div>
  );
};

export default PositionVoting;
