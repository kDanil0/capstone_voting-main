import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DashboardHeader from '../../components/admin/DashboardHeader';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

const ElectionResults = () => {
  // Sample department data
  const departments = [
    { id: 1, name: 'SSC', fullName: 'SSC STUDENT COUNCIL 2023', active: false },
    { id: 2, name: 'CSC', fullName: 'CSC STUDENT COUNCIL 2023', active: false },
    { id: 3, name: 'CCIS', fullName: 'CCIS STUDENT COUNCIL 2023', active: true },
    { id: 4, name: 'COE', fullName: 'COE STUDENT COUNCIL 2023', active: false },
    { id: 5, name: 'COC', fullName: 'COC STUDENT COUNCIL 2023', active: false },
    { id: 6, name: 'CON', fullName: 'CON STUDENT COUNCIL 2023', active: false },
    { id: 7, name: 'CHTM', fullName: 'CHTM STUDENT COUNCIL 2023', active: true },
    { id: 8, name: 'COB', fullName: 'COB STUDENT COUNCIL 2023', active: true },
  ];

  const [selectedDept, setSelectedDept] = useState(departments.find(d => d.active) || departments[0]);

  // Sample results data - replace with actual API call
  const getResultsData = (deptId) => {
    // This would be replaced with an API call in a real application
    const sampleData = {
      title: "Student Council Elections 2023",
      totalVotes: 423,
      positions: [
        {
          name: "President",
          candidates: [
            { name: "Jane Smith", votes: 245, percentage: 58 },
            { name: "John Doe", votes: 178, percentage: 42 },
          ]
        },
        {
          name: "Vice President",
          candidates: [
            { name: "Alex Johnson", votes: 310, percentage: 73 },
            { name: "Sam Wilson", votes: 113, percentage: 27 },
          ]
        }
      ]
    };
    
    return sampleData;
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
      },
    },
    indexAxis: 'y',
    maintainAspectRatio: false,
  };

  // Chart data for a position
  const getChartData = (candidates) => {
    return {
      labels: candidates.map(c => c.name),
      datasets: [
        {
          data: candidates.map(c => c.votes),
          backgroundColor: ['#4c63b6', '#7e8ce0'],
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };
  };

  // Get results for the selected department
  const results = getResultsData(selectedDept.id);

  return (
    <div className="p-6">
      <DashboardHeader title="Election Results" />
      
      {/* Department Navigation Bar */}
      <div className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden w-full">
        <div className="flex w-full">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept)}
              className={`flex-1 px-6 py-3 font-climate text-sm tracking-widest transition-colors whitespace-nowrap
                ${selectedDept.id === dept.id 
                  ? 'text-[#38438c] border-b-2 border-[#38438c]' 
                  : 'text-gray-600 hover:text-[#38438c] hover:border-b-2 hover:border-[#38438c]'
                }
              `}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mt-4">
        <h2 className="text-4xl font-bebas tracking-large text-[#38438c] mb-6">{selectedDept.fullName}</h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-2">
            <div className="text-gray-500 mb-1">Total Votes Cast</div>
            <div className="text-3xl font-bold">{results.totalVotes}</div>
          </div>
        </div>

        {results.positions.map((position, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">{position.name}</h3>
            
            <div className="h-[200px] mb-6">
              <Bar data={getChartData(position.candidates)} options={chartOptions} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {position.candidates.map((candidate, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.votes} votes</div>
                  </div>
                  <div className="text-2xl font-bold">{candidate.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionResults;
