import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../CommonComponents/StatusBadge";

const ElectionCard = ({ election }) => {
  return (
    <div className="bg-white p-5 rounded shadow-xl border border-gray-100">
      <h2 className="text-xl font-assistant font-bold text-[#38438c] mb-1">{election.title}</h2>
      
      <div className="mb-3 text-sm">
        <span className="text-gray-600">Status: </span>
        <StatusBadge status={election.status} />
      </div>
      
      <div className="text-sm space-y-1 text-gray-600 mb-4">
        <p>Campaign Start: {election.campaignStart}</p>
        <p>Campaign End: {election.campaignEnd}</p>
        <p>Election Start: {election.electionStart}</p>
        <p>Election End: {election.electionEnd}</p>
      </div>
      
      <Link 
        to={`/elections/${election.id}`} 
        className="inline-block bg-[#38438c] text-white px-3 py-1 rounded text-sm hover:bg-[#2d3470] transition-colors"
      >
        View Election Details
      </Link>
    </div>
  );
};

export default ElectionCard;