import React, { useState, useEffect } from "react";
import {
  TrophyFilled,
  CrownOutlined,
  LoadingOutlined,
  PieChartOutlined,
  BarsOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  Spin,
  Select,
  Tabs,
  Button,
  Avatar,
  Badge,
  Empty,
  Statistic,
  Card,
  Progress,
  Radio,
  Skeleton,
  Alert,
  Tag,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels // Register the datalabels plugin
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [error, setError] = useState(null);

  // For multiple elections
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [loadingElections, setLoadingElections] = useState(false);

  // For direct API URL
  const [directApiUrl, setDirectApiUrl] = useState("");
  const [showApiUrlInput, setShowApiUrlInput] = useState(false);

  // Constants for consistent colors
  const PRIMARY_COLOR = "#4B3B7C"; // Main purple color
  const SECONDARY_COLOR = "#6A5AEB"; // Secondary purple color
  const WINNER_COLOR = "#5F7AD9"; // Light blue/purple for winners
  const NON_WINNER_COLOR = "#8F9BBA"; // Grayish purple for non-winners

  // Function to fetch available elections
  const fetchElections = async () => {
    try {
      setLoadingElections(true);
      // Try different common API endpoint structures
      let response;
      const endpoints = [
        "/api/elections",
        "/api/active-elections",
        "/api/election/list",
        "/api/election-list",
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch elections from: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (response.data) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          }
        } catch (endpointError) {
          console.log(
            `Failed with endpoint: ${endpoint}`,
            endpointError.message
          );
        }
      }

      if (!response || !response.data) {
        throw new Error("Could not fetch elections from any endpoint");
      }

      console.log("Elections API response:", response.data);

      // Handle the actual API response format based on the screenshot
      if (response.data) {
        let electionsArray = [];

        // Try different possible paths in the response
        if (response.data.elections && Array.isArray(response.data.elections)) {
          electionsArray = response.data.elections;
        } else if (
          response.data.active_elections &&
          Array.isArray(response.data.active_elections)
        ) {
          electionsArray = response.data.active_elections;
        } else if (Array.isArray(response.data)) {
          electionsArray = response.data;
        }

        console.log("Extracted elections array:", electionsArray);

        if (electionsArray.length > 0) {
          // Map to a consistent format
          const formattedElections = electionsArray.map((election) => ({
            id: election.id,
            name: election.election_name || "Unnamed Election",
            status: election.status || "active",
            election_type_id: election.election_type_id,
            department_id: election.department_id,
          }));

          console.log("Formatted elections:", formattedElections);
          setElections(formattedElections);

          // Set the first election as default if available
          if (formattedElections.length > 0 && !selectedElectionId) {
            setSelectedElectionId(formattedElections[0].id);
          }
        } else {
          console.log("No elections found in response");
        }
      } else {
        console.error("Invalid elections response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setLoadingElections(false);
    }
  };

  // Function to fetch election results
  const fetchElectionResults = async () => {
    if (!selectedElectionId) return;

    try {
      setLoading(true);
      console.log(`Fetching results for election ID: ${selectedElectionId}`);

      // Try different endpoint formats
      let response;
      const endpoints = [
        `/api/election/${selectedElectionId}/results`,
        `/api/elections/${selectedElectionId}/results`,
        `/api/election-results/${selectedElectionId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch results from: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (response.data) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          }
        } catch (endpointError) {
          console.log(
            `Failed with endpoint: ${endpoint}`,
            endpointError.message
          );
        }
      }

      if (!response || !response.data) {
        throw new Error("Could not fetch election results from any endpoint");
      }

      // Log the raw response for debugging
      console.log("Raw API response:", response);

      // Validate that the response has the expected structure
      if (response.data && response.data.results) {
        console.log("Successfully fetched election data:", response.data);
        setElectionData(response.data);
        setError(null);
      } else {
        console.error("Invalid API response format:", response.data);
        setError(
          "The server returned an unexpected response format. Please try again."
        );
      }
    } catch (err) {
      console.error("Error fetching election results:", err);

      if (err.response) {
        console.error("Response status:", err.response.status);

        // Handle specific error cases
        if (err.response.status === 404) {
          setError(
            `Election results not found. The election may not have any results yet.`
          );
        } else {
          setError(
            `Server error: ${err.response.status}. ${
              err.response.data?.message || ""
            }`
          );
        }
      } else if (err.request) {
        setError(
          "No response received from the server. Please check your network connection."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get consistent color for party
  const getPartyColor = (partylist, isWinner = false) => {
    return isWinner ? WINNER_COLOR : NON_WINNER_COLOR;
  };

  // Effect to fetch elections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchElections();
      } catch (err) {
        console.error("Could not fetch elections:", err);
      }
    };

    fetchData();
  }, []);

  // Effect to fetch election results when election changes
  useEffect(() => {
    if (selectedElectionId) {
      fetchElectionResults();

      // Set up polling for live updates - every 30 seconds
      const interval = setInterval(fetchElectionResults, 30000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedElectionId]);

  // Function to filter positions
  const getFilteredPositions = () => {
    if (!electionData || !electionData.results) return [];

    if (selectedPosition === "all") {
      return electionData.results;
    }

    return electionData.results.filter(
      (position) => position.position_id.toString() === selectedPosition
    );
  };

  // Function to check if a candidate is a winner
  const isWinner = (candidate, position) => {
    if (!position || !position.winners || !candidate) return false;
    return position.winners.some(
      (winner) => winner.candidate_id === candidate.candidate_id
    );
  };

  // Chart data preparation
  const prepareChartData = (position) => {
    if (!position || !position.candidates) {
      return {
        labels: [],
        datasets: [
          {
            label: "Votes",
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    // Create a consistent color scheme for the chart
    const chartColors = position.candidates.map((c, index) =>
      isWinner(c, position) ? WINNER_COLOR : NON_WINNER_COLOR
    );

    return {
      labels: position.candidates.map((c) => c.name),
      datasets: [
        {
          label: "Votes",
          data: position.candidates.map((c) => c.votes),
          backgroundColor: chartColors.map((color) => `${color}CC`), // Add transparency
          borderColor: chartColors,
          borderWidth: 1,
        },
      ],
    };
  };

  // Function to calculate percentage
  const calculatePercentage = (votes, position) => {
    if (!position || !position.candidates) return 0;
    const totalVotes = position.candidates.reduce(
      (sum, candidate) => sum + (candidate.votes || 0),
      0
    );
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  // Result Card Component
  const ResultCard = ({ position }) => {
    const [localViewMode, setLocalViewMode] = useState(viewMode);

    // Guard against invalid position data
    if (!position || !position.candidates) {
      return (
        <div className="bg-white p-6 rounded-xl shadow-sm h-full border border-gray-100">
          <h2 className="text-[#4B3B7C] text-xl font-climate">
            {position?.position_name || "Unknown Position"}
          </h2>
          <Empty description="No candidate data available" />
        </div>
      );
    }

    // Sort candidates by votes in descending order
    const sortedCandidates = [...position.candidates].sort(
      (a, b) => (b.votes || 0) - (a.votes || 0)
    );

    // Calculate total votes for this position
    const totalVotes = sortedCandidates.reduce(
      (sum, candidate) => sum + (candidate.votes || 0),
      0
    );

    return (
      <div className="bg-white p-5 rounded-lg shadow-sm h-full border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#4B3B7C] text-lg font-climate">
            {position.position_name}
          </h2>
          <Radio.Group
            value={localViewMode}
            onChange={(e) => setLocalViewMode(e.target.value)}
            size="small"
          >
            <Radio.Button value="list">
              <BarsOutlined />
            </Radio.Button>
            <Radio.Button value="chart">
              <PieChartOutlined />
            </Radio.Button>
          </Radio.Group>
        </div>

        {localViewMode === "chart" ? (
          <div className="h-60 flex items-center justify-center">
            {totalVotes > 0 ? (
              <Pie
                data={prepareChartData(position)}
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: {
                          size: 11,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || "";
                          const value = context.raw || 0;
                          const percentage =
                            totalVotes > 0
                              ? ((value / totalVotes) * 100).toFixed(1)
                              : 0;
                          return `${label}: ${value} votes (${percentage}%)`;
                        },
                      },
                    },
                    // Add datalabels plugin configuration
                    datalabels: {
                      formatter: (value, ctx) => {
                        const percentage =
                          totalVotes > 0
                            ? Math.round((value / totalVotes) * 100)
                            : 0;
                        return percentage > 5 ? `${percentage}%` : "";
                      },
                      color: "#fff",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                      textAlign: "center",
                      textStrokeColor: "rgba(0,0,0,0.2)",
                      textStrokeWidth: 1,
                      // Only show labels for segments that are large enough
                      display: function (context) {
                        const value = context.dataset.data[context.dataIndex];
                        return value > 5 && (value / totalVotes) * 100 > 5;
                      },
                    },
                  },
                }}
              />
            ) : (
              <Empty description="No votes recorded" />
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {sortedCandidates.map((candidate, index) => {
              if (!candidate) return null;
              const isWinnerCandidate = isWinner(candidate, position);
              const percentage = calculatePercentage(
                candidate.votes || 0,
                position
              );

              return (
                <div key={candidate.candidate_id} className="w-full">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar
                      src={
                        candidate.profile_photo
                          ? `http://localhost:8000/${candidate.profile_photo}`
                          : null
                      }
                      size="small"
                      style={{
                        backgroundColor: isWinnerCandidate
                          ? WINNER_COLOR
                          : NON_WINNER_COLOR,
                        border: isWinnerCandidate
                          ? `2px solid ${PRIMARY_COLOR}`
                          : "none",
                      }}
                    >
                      {candidate.name.charAt(0)}
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                        <div>
                          <span
                            className={`font-medium ${
                              isWinnerCandidate
                                ? "text-[#4B3B7C]"
                                : "text-gray-700"
                            }`}
                          >
                            {candidate.name}
                            {isWinnerCandidate && (
                              <TrophyFilled className="ml-1.5 text-amber-500 text-xs" />
                            )}
                          </span>
                          <Tag
                            color={
                              isWinnerCandidate
                                ? WINNER_COLOR
                                : NON_WINNER_COLOR
                            }
                            className="ml-1.5 text-xs"
                            style={{ padding: "0 4px", lineHeight: "16px" }}
                          >
                            {candidate.partylist}
                          </Tag>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {candidate.votes}{" "}
                          <span className="text-xs">
                            {candidate.votes === 1 ? "vote" : "votes"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-in-out flex items-center pl-2"
                      style={{
                        width: `${Math.max(percentage, 5)}%`, // Ensure there's always something visible
                        backgroundColor: isWinnerCandidate
                          ? WINNER_COLOR
                          : NON_WINNER_COLOR,
                        transition: "width 1s ease-in-out",
                      }}
                    >
                      {percentage > 15 && (
                        <span className="text-white text-xs font-medium">
                          {Math.round(percentage)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {isWinnerCandidate && (
                    <div className="mt-0.5">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {position.winners.length > 1
                          ? "Tied for Lead"
                          : "Leading"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loadingElections && !elections.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <p className="mt-4">Loading elections...</p>
      </div>
    );
  }

  if (!selectedElectionId && elections.length === 0) {
    return (
      <div className="flex flex-col w-full">
        <div className="bg-gray-100 px-8 py-8 -mx-8 -mt-8 mb-8">
          <h1 className="text-[#4B3B7C] text-4xl font-climate text-center">
            ELECTION RESULTS
          </h1>
        </div>

        <Alert
          message="No Elections Available"
          description={
            <div>
              <p>There are currently no elections in the system.</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={fetchElections} loading={loadingElections}>
                  Reload Elections
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    );
  }

  if (loading && !electionData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <p className="mt-4">Loading election results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full">
        <div className="bg-gray-100 px-8 py-8 -mx-8 -mt-8 mb-8">
          <h1 className="text-[#4B3B7C] text-4xl font-climate text-center">
            ELECTION RESULTS
          </h1>

          {elections.length > 0 && (
            <div className="flex justify-center mt-4">
              <Select
                style={{ width: 300 }}
                placeholder="Select an election"
                value={selectedElectionId}
                onChange={setSelectedElectionId}
                loading={loadingElections}
                options={elections.map((election) => ({
                  value: election.id,
                  label: election.name,
                }))}
              />
            </div>
          )}
        </div>

        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchElectionResults}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const filteredPositions = getFilteredPositions();

  return (
    <div className="flex flex-col w-full">
      <div className="bg-gray-100 px-8 py-8 -mx-8 -mt-8 mb-8">
        <h1 className="text-[#4B3B7C] text-4xl font-climate text-center">
          ELECTION RESULTS
        </h1>

        {/* Election selector */}
        <div className="flex justify-center mt-4">
          <Select
            style={{ width: 300 }}
            placeholder="Select an election"
            value={selectedElectionId}
            onChange={setSelectedElectionId}
            loading={loadingElections}
            options={elections.map((election) => ({
              value: election.id,
              label: `${election.name} ${
                election.status ? `(${election.status})` : ""
              }`,
            }))}
          />
        </div>

        {electionData && electionData.election && (
          <div className="text-center mt-4 mb-6">
            <h2 className="text-xl text-gray-700">
              {electionData.election.name}
            </h2>
            <Tag
              color={
                electionData.election.status === "active" ||
                electionData.election.status === "ongoing"
                  ? "green"
                  : "red"
              }
            >
              {electionData.election.status.toUpperCase()}
            </Tag>
          </div>
        )}

        <Row gutter={16} className="mt-6 mb-4">
          <Col span={24} md={8}>
            <Card styles={{ body: { padding: "16px" } }}>
              <Statistic
                title="Total Positions"
                value={electionData?.results?.length || 0}
                valueStyle={{ color: PRIMARY_COLOR }}
                prefix={<CrownOutlined />}
              />
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card styles={{ body: { padding: "16px" } }}>
              <Statistic
                title="Total Candidates"
                value={
                  electionData?.results?.reduce(
                    (sum, pos) => sum + pos.candidates.length,
                    0
                  ) || 0
                }
                valueStyle={{ color: PRIMARY_COLOR }}
                prefix={
                  <Avatar.Group max={{ count: 2 }} size="small">
                    <Avatar
                      size="small"
                      style={{ backgroundColor: WINNER_COLOR }}
                    >
                      C
                    </Avatar>
                    <Avatar
                      size="small"
                      style={{ backgroundColor: NON_WINNER_COLOR }}
                    >
                      P
                    </Avatar>
                  </Avatar.Group>
                }
              />
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card styles={{ body: { padding: "16px" } }}>
              <Statistic
                title="Total Votes Cast"
                value={
                  electionData?.results?.reduce(
                    (sum, pos) =>
                      sum +
                      pos.candidates.reduce(
                        (voteSum, c) => voteSum + (c.votes || 0),
                        0
                      ),
                    0
                  ) || 0
                }
                valueStyle={{ color: PRIMARY_COLOR }}
              />
            </Card>
          </Col>
        </Row>

        <div className="flex flex-wrap items-center justify-between mt-6 gap-2">
          <div className="flex items-center gap-2">
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Position"
              value={selectedPosition}
              onChange={setSelectedPosition}
              options={[
                { value: "all", label: "All Positions" },
                ...(electionData?.results?.map((position) => ({
                  value: position.position_id.toString(),
                  label: position.position_name,
                })) || []),
              ]}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchElectionResults}
              loading={loading}
              type="default"
            >
              Refresh
            </Button>
          </div>

          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <Radio.Button value="list">
              <BarsOutlined />
            </Radio.Button>
            <Radio.Button value="chart">
              <PieChartOutlined />
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      {loading && electionData && (
        <div className="mb-4">
          <Alert message="Refreshing data..." type="info" showIcon />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position) => (
            <ResultCard key={position.position_id} position={position} />
          ))
        ) : (
          <div className="col-span-3 flex justify-center py-12">
            <Empty description="No positions found" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
