import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  Typography,
  Table,
  Tag,
  Spin,
  Alert,
  Empty,
  Select,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getElectionResults, getElectionTurnout } from "../../../utils/api";
import { useAuthContext } from "../../../utils/AuthContext";

const { Title, Text } = Typography;

// Define colors for pie chart segments
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

// Colors for abstention pie chart
const ABSTENTION_COLORS = ["#52c41a", "#ff4d4f"];

/**
 * Component for displaying election results with charts
 */
const ResultsTab = ({ electionData }) => {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [turnout, setTurnout] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    if (electionData?.election?.id) {
      fetchResultsData();
    }
  }, [electionData?.election?.id]);

  const fetchResultsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resultsResponse, turnoutResponse] = await Promise.all([
        getElectionResults(token, electionData.election.id),
        getElectionTurnout(token, electionData.election.id),
      ]);

      console.log("Results Response:", resultsResponse);
      console.log("Turnout Response:", turnoutResponse);

      // Process results data
      let processedResults = null;
      if (resultsResponse && typeof resultsResponse === "object") {
        const positions = resultsResponse.results || [];
        processedResults = {
          positions: positions.map((pos) => ({
            position_id: pos.position_id,
            position_name: pos.position_name,
            candidates: (pos.candidates || []).map((candidate) => ({
              candidate_id: candidate.candidate_id,
              name: candidate.name,
              votes: candidate.votes || 0,
              partylist: candidate.partylist,
            })),
            winners: pos.winners || [],
          })),
        };
      }

      // Process turnout data - using the exact structure from the API
      let processedTurnout = null;
      if (turnoutResponse?.election) {
        processedTurnout = {
          election: turnoutResponse.election,
        };
      }

      // Validate processed data
      if (!processedResults || !processedResults.positions) {
        throw new Error("No position data available in the response");
      }

      if (!processedTurnout?.election?.total_voters) {
        throw new Error("No turnout data available in the response");
      }

      console.log("Processed turnout:", processedTurnout);
      setResults(processedResults);
      setTurnout(processedTurnout);

      // Set initial selected position if positions exist
      if (processedResults.positions.length > 0) {
        setSelectedPosition(processedResults.positions[0].position_id);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(err.message || "Failed to fetch election results");
    } finally {
      setLoading(false);
    }
  };

  // If still loading, show spinner
  if (loading) {
    return (
      <div className="text-center py-10">
        <Spin size="large" />
        <div className="mt-4">Loading election results...</div>
      </div>
    );
  }

  // If there was an error, show alert
  if (error) {
    return (
      <Alert
        message="Error Loading Results"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // If no results data, show empty state
  if (!results?.positions || !turnout?.election) {
    return (
      <Empty
        description="No results data available"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Get data from API responses
  const totalVoters = turnout.election.total_voters || 0;
  const votesCast = turnout.election.votes_cast || 0;
  const turnoutPercentage = Math.round(
    turnout.election.turnout_percentage || 0
  );
  const abstainedCount = totalVoters - votesCast;
  const abstainedPercentage =
    totalVoters > 0 ? Math.round((abstainedCount / totalVoters) * 100) : 0;

  // Filter positions if a specific one is selected
  const positionsToShow = results.positions.filter(
    (position) =>
      selectedPosition === null ||
      position.position_id.toString() === selectedPosition
  );

  // Calculate abstain count for a specific position
  const getAbstainedForPosition = (position) => {
    if (!position?.candidates) return 0;
    const votedForPosition = position.candidates.reduce(
      (sum, c) => sum + (c.votes || 0),
      0
    );
    return votesCast - votedForPosition;
  };

  return (
    <div className="results-dashboard">
      <Title level={3} style={{ marginBottom: 24 }}>
        Election Results Dashboard
      </Title>

      {/* Overview statistics */}
      <Card className="mb-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Students"
              value={totalVoters}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Voters"
              value={votesCast}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix={<Text type="secondary">{`(${turnoutPercentage}%)`}</Text>}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Not yet voted"
              value={abstainedCount}
              prefix={<StopOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
              suffix={
                <Text type="secondary">{`(${abstainedPercentage}%)`}</Text>
              }
            />
          </Col>
        </Row>

        {/* Voter turnout progress */}
        <div className="mt-4">
          <Title level={5}>Voter Turnout</Title>
          <Progress
            percent={turnoutPercentage}
            status="active"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#52c41a",
            }}
            format={(percent) => `${Math.round(percent)}%`}
          />
        </div>
      </Card>

      <Divider orientation="left">Results by Position</Divider>

      {/* Position filter */}
      {results.positions?.length > 1 && (
        <div className="mb-4">
          <Select
            value={selectedPosition}
            onChange={(value) => setSelectedPosition(value)}
            style={{ width: 200 }}
          >
            <Select.Option value={null}>All Positions</Select.Option>
            {results.positions.map((position) => (
              <Select.Option
                key={position.position_id}
                value={position.position_id.toString()}
              >
                {position.position_name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {/* Position results with charts */}
      {positionsToShow.length === 0 ? (
        <Empty description="No positions to display" />
      ) : (
        positionsToShow.map((position) => {
          // Calculate abstained votes for this position
          const abstainedVotes = getAbstainedForPosition(position);
          const totalVotesForPosition = position.candidates.reduce(
            (sum, c) => sum + c.votes,
            0
          );
          const totalWithAbstained = totalVotesForPosition + abstainedVotes;
          const abstainPercentage =
            totalWithAbstained > 0
              ? Math.round((abstainedVotes / totalWithAbstained) * 100)
              : 0;

          // Data for the abstention pie chart
          const abstentionData = [
            { name: "Voted", value: totalVotesForPosition },
            { name: "Abstained", value: abstainedVotes },
          ];

          return (
            <Card
              key={position.position_id}
              title={position.position_name}
              className="mb-4"
            >
              {position.candidates.length === 0 ? (
                <Empty description="No candidates for this position" />
              ) : (
                <>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                      <div style={{ height: "300px" }}>
                        <Title level={5}>Vote Distribution (Bar Chart)</Title>
                        <BarChart
                          width={300}
                          height={300}
                          data={position.candidates}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tickFormatter={(str) => {
                              return str.length > 15
                                ? `${str.slice(0, 15)}...`
                                : str;
                            }}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} votes`,
                              "Votes",
                            ]}
                          />
                          <Legend />
                          <Bar
                            dataKey="votes"
                            fill="#8884d8"
                            name="Votes"
                            label={{
                              position: "top",
                              formatter: (value) => `${value}`,
                            }}
                          />
                        </BarChart>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div style={{ height: "300px" }}>
                        <Title level={5}>Vote Distribution (Pie Chart)</Title>
                        <PieChart width={300} height={300}>
                          <Pie
                            data={position.candidates}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="votes"
                            nameKey="name"
                            label={({
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                              value,
                              percent,
                            }) => {
                              const radius =
                                innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x =
                                cx +
                                radius * Math.cos(-midAngle * (Math.PI / 180));
                              const y =
                                cy +
                                radius * Math.sin(-midAngle * (Math.PI / 180));
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="white"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                >
                                  {`${Math.round(percent * 100)}%`}
                                </text>
                              );
                            }}
                          >
                            {position.candidates.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} votes`,
                              name,
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div style={{ height: "300px" }}>
                        <Title level={5}>Abstained Votes</Title>
                        <PieChart width={300} height={300}>
                          <Pie
                            data={abstentionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                              value,
                              percent,
                              name,
                            }) => {
                              const radius =
                                innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x =
                                cx +
                                radius * Math.cos(-midAngle * (Math.PI / 180));
                              const y =
                                cy +
                                radius * Math.sin(-midAngle * (Math.PI / 180));
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="white"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                >
                                  {`${Math.round(percent * 100)}%`}
                                </text>
                              );
                            }}
                          >
                            {abstentionData.map((entry, index) => (
                              <Cell
                                key={`abstention-cell-${index}`}
                                fill={
                                  ABSTENTION_COLORS[
                                    index % ABSTENTION_COLORS.length
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} voters (${Math.round(
                                (value / votesCast) * 100
                              )}%)`,
                              name,
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </div>
                    </Col>
                  </Row>

                  {/* Tabular results */}
                  <div className="mt-4">
                    <Title level={5}>Detailed Results</Title>
                    <Table
                      dataSource={position.candidates}
                      rowKey="candidate_id"
                      pagination={false}
                      columns={[
                        {
                          title: "Candidate",
                          dataIndex: "name",
                          key: "name",
                        },
                        {
                          title: "Party List",
                          dataIndex: "partylist",
                          key: "partylist",
                          render: (partylist) =>
                            partylist ? (
                              <Tag color="purple">{partylist}</Tag>
                            ) : (
                              <Tag>Independent</Tag>
                            ),
                        },
                        {
                          title: "Votes",
                          dataIndex: "votes",
                          key: "votes",
                          sorter: (a, b) => a.votes - b.votes,
                          defaultSortOrder: "descend",
                        },
                        {
                          title: "Percentage",
                          key: "percentage",
                          render: (_, record) => {
                            const totalVotes =
                              position.candidates.reduce(
                                (sum, c) => sum + c.votes,
                                0
                              ) + abstainedVotes;
                            const percentage =
                              totalVotes > 0
                                ? Math.round((record.votes / totalVotes) * 100)
                                : 0;
                            return `${percentage}%`;
                          },
                        },
                        {
                          title: "Status",
                          key: "status",
                          render: (_, record) => {
                            const isWinner = position.winners.some(
                              (winner) =>
                                typeof winner === "object" &&
                                winner.candidate_id === record.candidate_id
                            );
                            return isWinner ? (
                              <Tag color="green" style={{ fontWeight: "bold" }}>
                                WINNER
                              </Tag>
                            ) : (
                              <Tag color="default"></Tag>
                            );
                          },
                        },
                      ]}
                      summary={() => (
                        <>
                          <Table.Summary.Row style={{ background: "#fff7e6" }}>
                            <Table.Summary.Cell index={0} colSpan={2}>
                              Abstained{" "}
                              <Tag color="warning">
                                Did not vote for this position
                              </Tag>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              {abstainedVotes}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                              {abstainPercentage}%
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3}></Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2}>
                              <strong>Total</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <strong>
                                {position.candidates.reduce(
                                  (sum, c) => sum + c.votes,
                                  0
                                ) + abstainedVotes}
                              </strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                              <strong>100%</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3}></Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      )}
                    />
                  </div>
                </>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ResultsTab;
