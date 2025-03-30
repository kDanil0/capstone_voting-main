// src/Pages/Elections/AllElectionsView.jsx
import React from "react";
import DashboardHeader from "../../components/admin/DashboardHeader";
import ElectionCard from "../../Components/admin/ElectionCard";

const ViewAllElections = () => {
  // Sample data based on the image
  const elections = [
    {
      id: 1,
      title: "Supreme Student Council Elections 2024",
      status: "ongoing",
      campaignStart: "10/15/2024, 7:30:00 AM",
      campaignEnd: "11/7/2024, 7:30:00 AM",
      electionStart: "11/8/2024, 7:30:00 AM",
      electionEnd: "11/10/2024, 7:30:00 AM"
    },
    {
      id: 2,
      title: "CCIS Student Council Elections 2024",
      status: "upcoming",
      campaignStart: "10/12/2024, 7:30:00 AM",
      campaignEnd: "11/1/2024, 7:30:00 AM",
      electionStart: "11/6/2024, 7:30:00 AM",
      electionEnd: "11/9/2024, 7:30:00 AM"
    },
  ];

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <DashboardHeader title="All Elections" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map(election => (
          <ElectionCard key={election.id} election={election} />
        ))}
      </div>
    </div>
  );
};

export default ViewAllElections;