import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminElectionDetails,
  editElection,
  deleteElection,
  BASE_URL,
} from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";
import DashboardHeader from "../../components/admin/DashboardHeader";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Descriptions,
  Spin,
  Alert,
  Button,
  Space,
  Avatar,
  Badge,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Admin component for viewing and editing election details
 */
const ElectionDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [electionData, setElectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    election_id: "",
    election_name: "",
    status: "",
    campaign_start_date: "",
    campaign_end_date: "",
    election_start_date: "",
    election_end_date: "",
  });

  // Fetch election details on component load
  useEffect(() => {
    fetchElectionDetails();
  }, [id]);

  // Fetch election details from API
  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdminElectionDetails(id);

      if (data && data.election) {
        setElectionData(data);
      } else {
        setError(data.message || "Failed to fetch election details");
      }
    } catch (err) {
      console.error("Error fetching election details:", err);
      setError("An error occurred while fetching election details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display in the UI
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Format date for datetime-local input
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string for input
   */
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    } catch (error) {
      return "";
    }
  };

  /**
   * Format date for MySQL database
   * @param {string} dateString - Date string to format
   * @returns {string} MySQL formatted date string
   */
  const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace("T", " "); // Format as YYYY-MM-DD HH:MM:SS
    } catch (error) {
      console.error("Date formatting error:", error);
      return null;
    }
  };

  /**
   * Determine election status based on dates
   * @returns {Object} Status object with text and color
   */
  const getElectionStatus = () => {
    if (!electionData?.election) return { text: "Unknown", color: "default" };

    const election = electionData.election;
    const now = new Date();
    const startDate = new Date(election.election_start_date);
    const endDate = new Date(election.election_end_date);
    const campaignStartDate = new Date(election.campaign_start_date);
    const campaignEndDate = new Date(election.campaign_end_date);

    if (now < campaignStartDate) {
      return { text: "Scheduled", color: "blue" };
    } else if (now >= campaignStartDate && now <= campaignEndDate) {
      return { text: "Campaign Period", color: "purple" };
    } else if (now >= startDate && now <= endDate) {
      return { text: "Voting Open", color: "green" };
    } else if (now > endDate) {
      return { text: "Completed", color: "volcano" };
    } else {
      return { text: election.status || "Unknown", color: "default" };
    }
  };

  /**
   * Open the edit modal and initialize form data
   */
  const showEditModal = () => {
    if (electionData && electionData.election) {
      const election = electionData.election;

      setFormData({
        election_id: election.id,
        election_name: election.election_name,
        status: election.status,
        campaign_start_date: formatDateForInput(election.campaign_start_date),
        campaign_end_date: formatDateForInput(election.campaign_end_date),
        election_start_date: formatDateForInput(election.election_start_date),
        election_end_date: formatDateForInput(election.election_end_date),
      });

      setIsEditModalVisible(true);
    }
  };

  /**
   * Show delete confirmation dialog
   */
  const showDeleteConfirm = () => {
    setIsDeleteConfirmVisible(true);
  };

  /**
   * Handle election deletion
   */
  const handleDeleteElection = async () => {
    setDeleting(true);
    try {
      const result = await deleteElection(token, id);

      if (result.success) {
        message.success("Election deleted successfully");
        // Navigate back to the elections list after successful deletion
        navigate("/admin/elections/view");
      } else {
        message.error(result.message || "Failed to delete election");
        setIsDeleteConfirmVisible(false);
      }
    } catch (err) {
      console.error("Error deleting election:", err);
      message.error("An error occurred while deleting the election");
      setIsDeleteConfirmVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handle select input changes
   * @param {string} value - Selected value
   */
  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  /**
   * Submit the edit form to update election details
   * @param {Event} e - Form submit event
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data with MySQL-compatible date formats
      const apiData = {
        election_id: parseInt(formData.election_id),
        election_name: formData.election_name.trim(),
        status: formData.status,
        campaign_start_date: formatDateForMySQL(formData.campaign_start_date),
        campaign_end_date: formatDateForMySQL(formData.campaign_end_date),
        election_start_date: formatDateForMySQL(formData.election_start_date),
        election_end_date: formatDateForMySQL(formData.election_end_date),
      };

      // Call API to update election
      const result = await editElection(token, apiData);

      if (result.success) {
        message.success("Election updated successfully");
        setIsEditModalVisible(false);
        window.location.reload(); // Refresh data
      } else {
        message.error(result.message || "Failed to update election");
      }
    } catch (err) {
      console.error("Error updating election:", err);
      message.error("An error occurred while updating the election");
    } finally {
      setSubmitting(false);
    }
  };

  // Candidate table columns
  const candidateColumns = [
    {
      title: "Candidate",
      dataIndex: "user",
      key: "name",
      render: (user) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {user?.name || "Unknown"}
        </Space>
      ),
    },
    {
      title: "Position",
      dataIndex: "position_id",
      key: "position",
      render: (positionId) => {
        const position = electionData?.positions?.find(
          (p) => p.id === positionId
        );
        return position ? (
          <Tag color="blue">{position.name}</Tag>
        ) : (
          <Text type="secondary">Not assigned</Text>
        );
      },
    },
    {
      title: "Party List",
      dataIndex: "partyList",
      key: "partyList",
      render: (partyList) =>
        partyList ? (
          <Tag color="purple">
            <FlagOutlined /> {partyList.name}
          </Tag>
        ) : (
          <Text type="secondary">Independent</Text>
        ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) =>
        department ? (
          <Tag color="cyan">
            <ApartmentOutlined /> {department.name}
          </Tag>
        ) : (
          <Text type="secondary">Not specified</Text>
        ),
    },
  ];

  // Position table columns
  const positionColumns = [
    {
      title: "Position Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Candidates",
      key: "candidates",
      render: (_, record) => {
        const count =
          electionData?.candidates?.filter((c) => c.position_id === record.id)
            .length || 0;
        return (
          <Tag color={count > 0 ? "green" : "orange"}>
            {count} candidate{count !== 1 ? "s" : ""}
          </Tag>
        );
      },
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <div className="text-center py-10">
          <Spin size="large" />
          <div className="mt-4">Loading election details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <Alert
          message="Error Loading Election"
          description={error}
          type="error"
          showIcon
        />
        <div className="mt-4">
          <Button
            type="primary"
            onClick={() => navigate("/admin/elections/view")}
          >
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!electionData || !electionData.election) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <Alert
          message="Election Not Found"
          description="The requested election could not be found."
          type="warning"
          showIcon
        />
        <div className="mt-4">
          <Button
            type="primary"
            onClick={() => navigate("/admin/elections/view")}
          >
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  const election = electionData.election;
  const status = getElectionStatus();

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <DashboardHeader title="Election Details" />

      {/* Election Header */}
      <Card className="mb-4 shadow-sm">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={3} style={{ color: "#38438c", marginBottom: 4 }}>
              {election.election_name}
            </Title>
            <Space size="middle">
              <Tag color={status.color}>{status.text}</Tag>
              <Text type="secondary">
                <CalendarOutlined /> Voting Period:{" "}
                {formatDate(election.election_start_date)} to{" "}
                {formatDate(election.election_end_date)}
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8} className="text-right">
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showEditModal}
                style={{ backgroundColor: "#38438c" }}
              >
                Edit Election
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={showDeleteConfirm}
              >
                Delete
              </Button>
              <Button onClick={() => navigate("/admin/elections/view")}>
                Back
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        {/* Election Info and Positions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Election Information" bordered={false} size="small">
              <Descriptions column={1} size="small" variant="bordered">
                <Descriptions.Item label="Name">
                  {election.election_name}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={status.color}>{status.text}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {election.department_id || "All Departments"}
                </Descriptions.Item>
                <Descriptions.Item label="Campaign Period">
                  {formatDate(election.campaign_start_date)} to{" "}
                  {formatDate(election.campaign_end_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Voting Period">
                  {formatDate(election.election_start_date)} to{" "}
                  {formatDate(election.election_end_date)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Positions" bordered={false} size="small">
              <Table
                dataSource={electionData.positions}
                columns={positionColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {/* Candidates Section */}
        <Card
          title={
            <Title level={5}>
              <TeamOutlined /> Candidates (
              {electionData.candidates?.length || 0})
            </Title>
          }
          className="mt-4"
          bordered={false}
        >
          <Table
            dataSource={electionData.candidates}
            columns={candidateColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Edit Election Modal */}
      <Modal
        title="Edit Election"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input
            type="hidden"
            name="election_id"
            value={formData.election_id}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Election Name
            </label>
            <Input
              name="election_name"
              value={formData.election_name}
              onChange={handleInputChange}
              placeholder="Election Name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              placeholder="Select Status"
              style={{ width: "100%" }}
            >
              <Option value="upcoming">Upcoming</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Campaign Start Date
                </label>
                <input
                  type="datetime-local"
                  name="campaign_start_date"
                  value={formData.campaign_start_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Campaign End Date
                </label>
                <input
                  type="datetime-local"
                  name="campaign_end_date"
                  value={formData.campaign_end_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Election Start Date
                </label>
                <input
                  type="datetime-local"
                  name="election_start_date"
                  value={formData.election_start_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Election End Date
                </label>
                <input
                  type="datetime-local"
                  name="election_end_date"
                  value={formData.election_end_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </Col>
          </Row>

          <div className="flex justify-end space-x-3 mt-4">
            <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: "#38438c" }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined
              style={{ color: "#ff4d4f", marginRight: "8px" }}
            />
            Delete Election
          </span>
        }
        open={isDeleteConfirmVisible}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteConfirmVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleting}
            onClick={handleDeleteElection}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this election?</p>
        <p>
          <strong>This action cannot be undone.</strong>
        </p>
        <p>
          All data associated with this election, including positions and
          candidate applications, will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default ElectionDetailsAdmin;
