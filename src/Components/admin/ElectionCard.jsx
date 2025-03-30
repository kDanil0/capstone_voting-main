import React from "react";
import StatusBadge from "../CommonComponents/StatusBadge";

const ElectionCard = ({ election }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
      <h2 className="text-xl font-assistant font-bold text-[#38438c] mb-1">
        {election.title}
      </h2>

      <div className="mb-3 text-sm">
        <span className="text-gray-600">Status: </span>
        <StatusBadge status={election.status} />
      </div>

      <div className="text-sm space-y-1 text-gray-600">
        <p>Campaign Start: {election.campaignStart}</p>
        <p>Campaign End: {election.campaignEnd}</p>
        <p>Election Start: {election.electionStart}</p>
        <p>Election End: {election.electionEnd}</p>
      </div>
    </div>
  );
};

export default ElectionCard;
