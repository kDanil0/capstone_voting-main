import React from 'react';

const VoteSummary = ({ positions, selections, onEdit }) => {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-[#3F4B8C] font-climate text-3xl mb-2">VOTE SUMMARY</h2>
        <p className="text-gray-600 font-assistant">Review your selections before submitting</p>
      </div>

      <div className="space-y-4 mb-8">
        {positions.map((position, index) => {
          const selection = selections[position.position_id];
          let selectionText = "No selection";
          
          if (selection === 'abstain') {
            selectionText = "Abstained";
          } else if (selection) {
            const candidate = position.candidates.find(c => c.id === selection);
            selectionText = candidate ? candidate.name : "Unknown candidate";
          }
          
          return (
            <div key={position.position_id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[#3F4B8C] font-assistant font-bold">{position.position}</h3>
                  <p className="text-gray-700 font-assistant">{selectionText}</p>
                </div>
                <button 
                  className="text-[#3F4B8C] hover:underline font-assistant"
                  onClick={() => onEdit(index)}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VoteSummary;
