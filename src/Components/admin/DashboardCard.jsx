import React from "react";

const DashboardCard = ({ icon, title, description, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-xl p-6 cursor-pointer hover:bg-[#38738c50] hover:scale-105 transition-all duration-200 ease-in-out"
      onClick={onClick}
    >
      <div className="flex items-start mb-4">
        <div className="text-2xl text-primary mr-3">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default DashboardCard; 