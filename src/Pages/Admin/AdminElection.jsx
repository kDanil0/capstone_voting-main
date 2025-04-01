import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/admin/DashboardHeader";
import DashboardCard from "../../components/admin/DashboardCard";
import {
  FormatListBulleted,
  AddCircleOutlineOutlined,
  GridViewOutlined,
  FlagOutlined,
} from "@mui/icons-material";

const AdminElection = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: 1,
      icon: <FormatListBulleted className="text-indigo-600" />,
      title: "View All Elections",
      description:
        "Browse through the list of all elections. You can view election details and results.",
      onClick: () => navigate("/admin/elections/view"),
    },
    {
      id: 2,
      icon: <AddCircleOutlineOutlined className="text-green-500" />,
      title: "Create New Election",
      description:
        "Start a new election by setting up election parameters and candidates.",
      onClick: () => navigate("/admin/elections/create"),
    },
    {
      id: 3,
      icon: <FlagOutlined className="text-orange-500" />,
      title: "Partylists",
      description:
        "Manage partylists for elections. Create, update, or delete partylists for candidates.",
      onClick: () => navigate("/admin/elections/partylists"),
    },
  ];

  return (
    <div className="p-6">
      <DashboardHeader title="Elections Management" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            description={card.description}
            onClick={card.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminElection;
