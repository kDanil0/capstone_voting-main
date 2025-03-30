import React from "react";
import { TrophyFilled, CrownOutlined } from "@ant-design/icons";

const Dashboard = () => {
  // Sort the candidates by votes in descending order for each position
  const positions = [
    {
      title: "PRESIDENT",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 350 },
        { name: "William Troy", votes: 100 },
      ].sort((a, b) => b.votes - a.votes), // Sort in descending order
    },
    {
      title: "VICE PRESIDENT",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 150 },
        { name: "William Troy", votes: 100 },
      ].sort((a, b) => b.votes - a.votes), // Sort in descending order
    },
    {
      title: "SECRETARY",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 150 },
        { name: "William Troy", votes: 100 },
      ].sort((a, b) => b.votes - a.votes), // Sort in descending order
    },
    // Add more positions if needed to fill the space
  ];

  // Get the maximum votes for percentage calculation
  const maxVotes = Math.max(
    ...positions.flatMap((p) => p.candidates.map((c) => c.votes))
  );

  // Function to generate a gradient color based on position
  const getPositionColor = (index) => {
    const colors = ["#4B3B7C", "#2F6B7E", "#6A5AEB", "#5F7AD9"];
    return colors[index % colors.length];
  };

  // Function to get rank label with appropriate styling
  const getRankLabel = (index) => {
    if (index === 0) return "1st";
    if (index === 1) return "2nd";
    if (index === 2) return "3rd";
    return `${index + 1}th`;
  };

  const ResultCard = ({ title, candidates, colorIndex }) => {
    const mainColor = getPositionColor(colorIndex);

    return (
      <div className="bg-white p-6 rounded-xl shadow-md h-full border border-gray-100">
        <h2 className="text-[#4B3B7C] text-2xl font-climate mb-6">{title}</h2>
        <div className="space-y-8">
          {candidates.map((candidate, index) => {
            const percentage = (candidate.votes / maxVotes) * 100;

            return (
              <div key={index} className="w-full">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-white font-bold ${
                      index === 0 ? "bg-[#4B3B7C]" : "bg-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                      <span
                        className={`font-bold ${
                          index === 0
                            ? "text-[#4B3B7C] text-lg"
                            : "text-gray-700 text-base"
                        }`}
                      >
                        {candidate.name}
                        {index === 0 && (
                          <span className="inline-block ml-2 text-amber-500">
                            •
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {candidate.votes} votes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-in-out flex items-center pl-3"
                    style={{
                      width: `${Math.max(percentage, 15)}%`, // Ensure there's always space for text
                      backgroundColor:
                        index === 0
                          ? mainColor
                          : `${mainColor}${Math.round(80 - index * 20).toString(
                              16
                            )}`,
                      transition: "width 1s ease-in-out",
                    }}
                  >
                    {percentage > 20 && (
                      <span className="text-white text-xs font-medium">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
                {index === 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Leading
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="bg-gray-100 px-8 py-8 -mx-8 -mt-8 mb-8">
        <h1 className="text-[#4B3B7C] text-5xl font-climate text-center tracking-widest">
          RESULTS
        </h1>

        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {["SSC", "COC", "CON", "COB", "CCIS", "CHTM", "CASSED", "COE"].map(
            (college, index) => (
              <button
                key={college}
                className={`text-[#4B3B7C] font-climate text-sm tracking-wider px-3 py-1.5 rounded-md 
                  ${
                    index === 0
                      ? "bg-[#4B3B7C] text-white"
                      : "hover:bg-[#f8f5ff]"
                  } 
                  transition-all duration-300`}
              >
                {college}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((position, index) => (
          <ResultCard
            key={index}
            title={position.title}
            candidates={position.candidates}
            colorIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
