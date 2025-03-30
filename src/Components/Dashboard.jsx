import React from "react";

const Dashboard = () => {
  const positions = [
    {
      title: "PRESIDENT",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 150 },
        { name: "William Troy", votes: 100 },
      ],
    },
    {
      title: "VICE PRESIDENT",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 150 },
        { name: "William Troy", votes: 100 },
      ],
    },
    {
      title: "SECRETARY",
      candidates: [
        { name: "John Doe", votes: 225 },
        { name: "Amy Withertaker", votes: 150 },
        { name: "William Troy", votes: 100 },
      ],
    },
    // Add more positions if needed to fill the space
  ];

  const ResultCard = ({ title, candidates }) => (
    <div className="bg-[#2F6B7E] p-5 rounded-xl h-full">
      <h2 className="text-white text-3xl font-climate mb-4">{title}</h2>
      {candidates.map((candidate, index) => (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-3">
            <span className="text-white text-lg w-6">{index + 1}</span>
            <div className="flex-1">
              <div
                className="bg-[#4B3B7C] text-white px-3 py-1.5 rounded-md flex justify-between items-center"
                style={{
                  width: `${(candidate.votes / 225) * 100}%`,
                  minWidth: "fit-content",
                  transition: "width 0.5s ease-in-out",
                }}
              >
                <span className="font-medium text-base">{candidate.name}</span>
                <span className="text-base ml-2">{candidate.votes} votes</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="bg-gray-200 px-8 pt-10 -mx-8 -mt-8">
        <h1 className="text-[#4B3B7C] text-5xl font-climate text-center tracking-widest">
          RESULTS
        </h1>
      </div>

      {/* Main content */}
      <div className="flex-grow">
        <div className="mb-6">
          <div className="flex justify-between w-full mb-4 px-4">
            {["SSC", "COC", "CON", "COB", "CCIS", "CHTM", "CASSED", "COE"].map(
              (college) => (
                <span
                  key={college}
                  className="text-[#4B3B7C] font-climate text-base tracking-wider px-3 py-1 border-2 border-transparent hover:border-[#4B3B7C] hover:bg-[#f8f5ff] hover:text-[#2F6B7E] cursor-pointer transition-all duration-300 rounded-md"
                >
                  {college}
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {positions.map((position, index) => (
            <ResultCard
              key={index}
              title={position.title}
              candidates={position.candidates}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
