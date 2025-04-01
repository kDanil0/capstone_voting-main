// src/Pages/Elections/AllElectionsView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/admin/DashboardHeader";
import ElectionCard from "../../Components/admin/ElectionCard";
import { getAllElections } from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";

const ViewAllElections = () => {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        if (!token) {
          setError("No authentication token available");
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await getAllElections(token);

        console.groupCollapsed("📊 Elections Data Fetched");
        console.log(
          `Total: ${data.elections_count}, Active: ${data.active_elections_count}`
        );
        if (data.elections?.length) {
          console.log("First election:", {
            id: data.elections[0].id,
            name: data.elections[0].election_name,
            // Log only key fields for quick reference
          });
        }
        console.groupEnd();

        // Map the API data to the format expected by ElectionCard
        // Adjust field names based on the actual Laravel model fields
        const formattedElections =
          data?.elections?.map((election) => ({
            id: election.id,
            title: election.election_name || `Election #${election.id}`,
            status: election.status || "upcoming",
            campaignStart: formatDate(election.campaign_start_date),
            campaignEnd: formatDate(election.campaign_end_date),
            electionStart: formatDate(election.election_start_date),
            electionEnd: formatDate(election.election_end_date),
          })) || [];

        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.groupCollapsed("🗃️ Formatted Elections");
          console.log(`Count: ${formattedElections.length}`);
          if (formattedElections.length > 0) {
            console.log("Sample:", {
              id: formattedElections[0].id,
              title: formattedElections[0].title,
              status: formattedElections[0].status,
            });
          }
          console.groupEnd();
        }

        setElections(formattedElections);
        setLoading(false);
      } catch (err) {
        console.error("❌ Elections fetch error:", err.message);
        setError("Failed to fetch elections. Please try again later.");
        setLoading(false);

        // Set some fallback data for testing
        setElections([
          {
            id: 1,
            title: "Supreme Student Council Elections 2024",
            status: "ongoing",
            campaignStart: "10/15/2024, 7:30:00 AM",
            campaignEnd: "11/7/2024, 7:30:00 AM",
            electionStart: "11/8/2024, 7:30:00 AM",
            electionEnd: "11/10/2024, 7:30:00 AM",
          },
          {
            id: 2,
            title: "CCIS Student Council Elections 2024",
            status: "upcoming",
            campaignStart: "10/12/2024, 7:30:00 AM",
            campaignEnd: "11/1/2024, 7:30:00 AM",
            electionStart: "11/6/2024, 7:30:00 AM",
            electionEnd: "11/9/2024, 7:30:00 AM",
          },
        ]);
      }
    };

    fetchElections();
  }, [token]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const handleElectionClick = (electionId) => {
    // Navigate to the election details page
    navigate(`/admin/elections/details/${electionId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="All Elections" />
        <div className="text-center py-10">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <DashboardHeader title="All Elections" />

      {elections.length === 0 ? (
        <div className="text-center py-10">No elections found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              onClick={() => handleElectionClick(election.id)}
              className="cursor-pointer shadow-md transition-all duration-300 transform hover:-translate-y-2 hover:bg-white rounded-lg overflow-hidden"
            >
              <ElectionCard election={election} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAllElections;
