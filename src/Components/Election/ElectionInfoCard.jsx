import React from 'react';

const ElectionInfoCard = ({ electionData }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-[#3F4B8C] font-climate text-xl mb-4">ELECTION INFORMATION</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Department:</span>
          <span className="text-gray-900 font-medium">{electionData.department}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Status:</span>
          <span className="bg-[#3F4B8C] text-white px-4 py-1 rounded-full text-sm">
            {electionData.status}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Campaign Period:</span>
          <span className="text-gray-900">
            {electionData.campaignPeriod.start} - {electionData.campaignPeriod.end}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Voting Period:</span>
          <span className="text-gray-900">
            {electionData.votingPeriod.start} - {electionData.votingPeriod.end}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ElectionInfoCard; 