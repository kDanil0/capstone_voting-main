import React from "react";

const DashboardHeader = ({ title }) => {
  return (
    <div className="mb-4 w-full">
      <h1 className="text-3xl tracking-widest font-climate font-bold text-[#38438c]">
        {title}
      </h1>
    </div>
  );
};

export default DashboardHeader;
