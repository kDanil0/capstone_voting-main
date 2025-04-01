// src/Components/admin/CandidateTable.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Input as AntInput,
  message,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FlagOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {
  getAllCandidates,
  getAllPositions,
  getAllPartylists,
  getAllElections,
  updateCandidate,
  removeCandidateStatus,
} from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CandidateTable = () => {
  const { token } = useAuthContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [partyLists, setPartyLists] = useState([]);
  const [elections, setElections] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch all candidates, positions, party lists, and elections on component mount
  useEffect(() => {
    fetchCandidates();
    fetchPositions();
    fetchPartyLists();
    fetchElections();
  }, [token]);

  // Function to fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getAllCandidates();

      // Check if response is an array (direct candidates array) or has a candidates property
      const candidatesData = Array.isArray(response)
        ? response
        : response.candidates;

      if (candidatesData) {
        // Transform API data to match table structure
        const formattedCandidates = candidatesData.map((candidate) => ({
          key: candidate.id,
          username:
            candidate.user?.student_id || candidate.student_id || candidate.id,
          firstName:
            candidate.user?.first_name ||
            candidate.user?.name?.split(" ")[0] ||
            candidate.first_name ||
            "",
          lastName:
            candidate.user?.last_name ||
            candidate.user?.name?.split(" ").slice(1).join(" ") ||
            candidate.last_name ||
            "",
          partyList:
            candidate.partylist?.name ||
            candidate.partylist_name ||
            "Independent",
          department:
            candidate.department?.name || candidate.department_name || "",
          position: candidate.position?.name || candidate.position_name || "",
          status: candidate.status || "Pending",
          image: candidate.image || candidate.profile_photo,
          // Original IDs for form submission
          partyListId: candidate.partylist?.id || candidate.partylist_id,
          positionId: candidate.position?.id || candidate.position_id,
          electionId: candidate.election_id,
          candidateId: candidate.id,
          departmentId: candidate.department?.id || candidate.department_id,
          userId: candidate.user?.id || candidate.user_id,
          electionName: candidate.election?.election_name || "",
        }));

        setCandidates(formattedCandidates);
      } else {
        console.error("No candidates data in response:", response);
        message.error("Failed to load candidates data");
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      message.error(
        "Failed to load candidates: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch positions
  const fetchPositions = async () => {
    try {
      const response = await getAllPositions();
      if (response && response.positions) {
        setPositions(response.positions);
      } else if (Array.isArray(response)) {
        setPositions(response);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      message.error("Failed to load positions");
    }
  };

  // Function to fetch party lists
  const fetchPartyLists = async () => {
    try {
      const response = await getAllPartylists(token);
      if (response && response.party_lists) {
        setPartyLists(response.party_lists);
      } else if (Array.isArray(response)) {
        setPartyLists(response);
      }
    } catch (error) {
      console.error("Error fetching party lists:", error);
      message.error("Failed to load party lists");
    }
  };

  // Function to fetch elections
  const fetchElections = async () => {
    try {
      const response = await getAllElections(token);
      if (response && response.elections) {
        setElections(response.elections);
      } else if (Array.isArray(response)) {
        setElections(response);
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
      message.error("Failed to load elections");
    }
  };

  // Search function for filtering candidates
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
  };

  // Get filtered candidates based on search text
  const getFilteredCandidates = () => {
    if (!searchText) return candidates;

    return candidates.filter((candidate) => {
      const searchLower = searchText.toLowerCase();
      return (
        (candidate.username?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (candidate.firstName?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (candidate.lastName?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (candidate.position?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (candidate.partyList?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (candidate.department?.toString() || "")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  };

  // Show modal and set the candidate data for editing
  const showEditModal = (record) => {
    setEditingCandidate(record);
    form.setFieldsValue({
      student_id: record.username,
      position_id: record.positionId,
      election_id: record.electionId,
      party_list_id: record.partyListId,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      console.log("Submitting update with values:", values);

      const response = await updateCandidate(token, values);
      console.log("Update response:", response);

      if (
        response.message === "Candidate updated successfully!" ||
        response.candidate
      ) {
        message.success("Candidate updated successfully!");
        setIsModalVisible(false);
        form.resetFields();

        // Refresh the candidates list
        fetchCandidates();
      } else {
        // Show error message
        message.error(response.message || "Failed to update candidate");
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
      message.error(
        "Error updating candidate: " + (error.message || "Unknown error")
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirm = (record) => {
    confirm({
      title: "Are you sure you want to delete this candidate?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action cannot be undone. The candidate status will be removed, and all associated data including profile photo and posts will be deleted.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await removeCandidateStatus(
            token,
            record.candidateId
          );

          if (response.success) {
            message.success(
              response.message || "Candidate status successfully removed"
            );
            // Refresh candidates list after deletion
            fetchCandidates();
          } else {
            message.error(
              response.message || "Failed to remove candidate status"
            );
          }
        } catch (error) {
          console.error("Error removing candidate:", error);
          message.error("An error occurred while removing candidate status");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Define columns for Ant Design Table
  const columns = [
    {
      title: <span className="text-base font-semibold">STUDENT ID</span>,
      dataIndex: "username",
      key: "username",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">NAME</span>,
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text style={{ fontSize: "15px" }}>
            {`${record.firstName || ""} ${record.lastName || ""}`.trim() ||
              "Unknown"}
          </Text>
        </Space>
      ),
    },
    {
      title: <span className="text-base font-semibold">ELECTION</span>,
      dataIndex: "electionName",
      key: "electionName",
      render: (text) => (
        <Text style={{ fontSize: "15px" }}>{text || "Unassigned"}</Text>
      ),
    },
    {
      title: <span className="text-base font-semibold">PARTY LIST</span>,
      dataIndex: "partyList",
      key: "partyList",
      render: (text) => (
        <Tag color="purple">
          <FlagOutlined /> {text || "Independent"}
        </Tag>
      ),
    },
    {
      title: <span className="text-base font-semibold">DEPARTMENT</span>,
      dataIndex: "department",
      key: "department",
      render: (text) => (
        <Tag color="cyan">
          <ApartmentOutlined /> {text || "Not specified"}
        </Tag>
      ),
    },
    {
      title: <span className="text-base font-semibold">POSITION</span>,
      dataIndex: "position",
      key: "position",
      render: (text) => <Tag color="blue">{text || "Not assigned"}</Tag>,
    },
    {
      title: <span className="text-base font-semibold">ACTIONS</span>,
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="middle"
            style={{
              backgroundColor: "#38438c",
              transition: "background-color 0.3s ease",
              padding: "0 16px",
              height: "36px",
              fontSize: "14px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2c3470";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#38438c";
            }}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            size="middle"
            style={{
              padding: "0 16px",
              height: "36px",
              fontSize: "14px",
            }}
            onClick={() => showDeleteConfirm(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="border border-gray-300 rounded">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <AntInput
            placeholder="Search candidates..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            className="w-full md:w-1/3"
            size="large"
          />
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: "#38438c",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2c3470";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#38438c";
            }}
            onClick={fetchCandidates}
          >
            Refresh
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={getFilteredCandidates()}
          rowKey="candidateId"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
          bordered
          size="large"
          rowClassName="text-base"
          loading={loading}
        />
      </div>

      {/* Edit Candidate Modal */}
      <Modal
        title={
          <div className="bg-[#38438c] text-white py-4 px-6 text-xl font-climate tracking-widest uppercase -mt-5 -mx-6 mb-5">
            EDIT CANDIDATE
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        styles={{ body: { padding: "24px" } }}
        style={{ top: 20 }}
        className="candidate-edit-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          name="editCandidateForm"
          className="space-y-6"
          size="large"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="student_id"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  STUDENT ID
                </span>
              }
              rules={[{ required: true, message: "Please input student ID!" }]}
            >
              <Input disabled className="py-2" />
            </Form.Item>

            <Form.Item
              name="election_id"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  ELECTION
                </span>
              }
              rules={[{ required: true, message: "Please select election!" }]}
            >
              <Select
                placeholder="Select Election"
                dropdownStyle={{ fontSize: "16px" }}
                size="large"
              >
                {elections.map((election) => (
                  <Option key={election.id} value={election.id}>
                    {election.election_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="position_id"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  POSITION
                </span>
              }
              rules={[{ required: true, message: "Please select position!" }]}
            >
              <Select
                placeholder="Select Position"
                dropdownStyle={{ fontSize: "16px" }}
                size="large"
              >
                {positions.map((position) => (
                  <Option key={position.id} value={position.id}>
                    {position.name}
                    {position.is_general ? " (General)" : ""}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="party_list_id"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  PARTY LIST
                </span>
              }
              rules={[{ required: true, message: "Please select party list!" }]}
            >
              <Select
                placeholder="Select Party List"
                dropdownStyle={{ fontSize: "16px" }}
                size="large"
              >
                {partyLists.map((partyList) => (
                  <Option key={partyList.id} value={partyList.id}>
                    {partyList.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{
                backgroundColor: "#38438c",
                height: "auto",
                padding: "10px 24px",
                fontSize: "16px",
              }}
            >
              Update Candidate
            </Button>
            <Button
              onClick={handleCancel}
              style={{
                marginLeft: "12px",
                padding: "10px 20px",
                height: "auto",
                fontSize: "16px",
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CandidateTable;
