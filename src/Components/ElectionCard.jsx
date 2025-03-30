import React from 'react';
import { useNavigate } from 'react-router-dom';

const ElectionCard = ({ election }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/election/${election.id}`);
  };

  return (
    <div 
      className="justify-right transform transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="bg-[#3F4B8C] rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 h-[100px] flex items-center">
          <h3 className="text-white font-climate text-2xl tracking-wider text-left">
            {election.election_name}
          </h3>
        </div>
        <div className="bg-[#FFCC00] py-1 text-center">
          <p className="font-bebas text-2xl tracking-wider">
            {election.status.toUpperCase()}
          </p>
        </div>
        <div className="bg-[#3F4B8C] h-10"></div>
      </div>
    </div>
  );
};

export default ElectionCard; 