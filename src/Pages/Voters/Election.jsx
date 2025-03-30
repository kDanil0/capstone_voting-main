import React, { useState, useEffect } from "react";
import { getAllElections } from "../../utils/api";
import ElectionCard from "../../Components/ElectionCard";
// Import icons (if you're using React Icons)
// import { FaCalendarTimes, FaCalendarAlt } from "react-icons/fa";

const Election = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [electionsData, setElectionsData] = useState({
    ongoing: [],
    upcoming: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await getAllElections('');
      
      // Filter active elections
      const activeElections = response.active_elections || [];
      const ongoing = activeElections.filter(election => election.status === 'ongoing');
      const upcoming = activeElections.filter(election => election.status === 'upcoming');

      setElectionsData({
        ongoing,
        upcoming,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching elections:", error);
      setElectionsData(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch elections"
      }));
    }
  };

  if (electionsData.isLoading) {
    return <div className="w-full flex justify-center items-center h-64">Loading...</div>;
  }

  if (electionsData.error) {
    return <div className="w-full text-red-500 h-64 flex justify-center items-center">{electionsData.error}</div>;
  }

  // Get the active elections based on the selected tab
  const activeElections = activeTab === 'ongoing' ? electionsData.ongoing : electionsData.upcoming;

  // Empty state messages
  const emptyStateMessages = {
    ongoing: "There are currently no ongoing elections.",
    upcoming: "There are no upcoming elections scheduled at this time."
  };

  return (
    <div className="w-full">
      {/* Section Headers as Tabs */}
      <div className="grid grid-cols-2 gap-4 -mx-8 -mt-8 px-8 pt-10 bg-gray-200 mb-8">
        <div 
          className="col-span-1 cursor-pointer"
          onClick={() => setActiveTab('ongoing')}
        >
          <h2 className={`text-[#3F4B8C] font-climate text-3xl text-center tracking-wider border-b-4 ${activeTab === 'ongoing' ? 'border-[#3F4B8C]' : 'border-transparent'} pb-2 transition-colors duration-300`}>
            ONGOING ELECTION
          </h2>
        </div>
        <div 
          className="col-span-1 cursor-pointer"
          onClick={() => setActiveTab('upcoming')}
        >
          <h2 className={`text-[#3F4B8C] font-climate text-3xl text-center tracking-wider border-b-4 ${activeTab === 'upcoming' ? 'border-[#3F4B8C]' : 'border-transparent'} pb-2 transition-colors duration-300`}>
            UPCOMING ELECTION
          </h2>
        </div>
      </div>

      {/* Election Cards or Empty State */}
      {activeElections.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {activeElections.map((election) => (
            <ElectionCard 
              key={election.id}
              election={election}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <div className="mb-4">
            {/* If you're using React Icons, uncomment this */}
            {/* {activeTab === 'ongoing' ? 
              <FaCalendarTimes className="text-[#3F4B8C] text-5xl mx-auto" /> :
              <FaCalendarAlt className="text-[#3F4B8C] text-5xl mx-auto" />
            } */}
            
            {/* Or use this emoji version */}
            <span className="text-5xl">
              {activeTab === 'ongoing' ? '📅' : '🗓️'}
            </span>
          </div>
          <h3 className="text-[#3F4B8C] font-climate text-2xl mb-2">
            No {activeTab} elections
          </h3>
          <p className="text-gray-600">
            {emptyStateMessages[activeTab]}
          </p>
          <div className="mt-6">
            <button 
              onClick={() => setActiveTab(activeTab === 'ongoing' ? 'upcoming' : 'ongoing')}
              className="bg-[#3F4B8C] text-white py-2 px-6 rounded-md hover:bg-[#304080] transition-colors duration-300"
            >
              View {activeTab === 'ongoing' ? 'upcoming' : 'ongoing'} elections
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Election;
