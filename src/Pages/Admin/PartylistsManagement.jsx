import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Typography,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Popover,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../utils/AuthContext";
import {
  getAllPartylists,
  createPartylist,
  updatePartylist,
  deletePartylist,
} from "../../utils/api";
import DashboardHeader from "../../Components/admin/DashboardHeader";

const { Title, Text } = Typography;
const { confirm } = Modal;

// Helper function to extract candidate name from different formats
const getCandidateName = (candidate, shortened = false) => {
  // Check all possible name properties
  if (candidate.user?.name) {
    // If user object has name
    return shortened && candidate.user.name.length > 15
      ? `${candidate.user.name.substring(0, 12)}...`
      : candidate.user.name;
  }

  if (candidate.name) {
    // If candidate has direct name property
    return shortened && candidate.name.length > 15
      ? `${candidate.name.substring(0, 12)}...`
      : candidate.name;
  }

  if (candidate.first_name) {
    // If has first_name (and maybe last_name)
    const fullName = `${candidate.first_name} ${
      candidate.last_name || ""
    }`.trim();
    return shortened && fullName.length > 15
      ? `${fullName.substring(0, 12)}...`
      : fullName;
  }

  // If candidate has student_id
  if (candidate.student_id) {
    return shortened
      ? `#${candidate.student_id}`
      : `Student #${candidate.student_id}`;
  }

  // Fallback to ID or "Unknown"
  return shortened
    ? `#${candidate.id || "?"}`
    : `Candidate #${candidate.id || "Unknown"}`;
};

const PartylistsManagement = () => {
  const { token } = useAuthContext();
  const [partylists, setPartylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPartylist, setCurrentPartylist] = useState(null);
  const [form] = Form.useForm();

  // Fetch partylists on component mount
  useEffect(() => {
    fetchPartylists();
  }, [token]);

  const fetchPartylists = async () => {
    try {
      setLoading(true);
      console.log("Fetching partylists...");
      const response = await getAllPartylists(token);
      console.log("Response from getAllPartylists:", response);

      // Check if the response indicates a failure
      if (response && response.success === false) {
        message.error(response.message || "Failed to load partylists data");
        setPartylists([]);
        return;
      }

      let partylistsData = [];

      // Handle different response structures
      if (response && response.party_lists) {
        console.log(
          "Partylists found in response.party_lists:",
          response.party_lists
        );
        partylistsData = response.party_lists;
      } else if (response && response.partylists) {
        console.log(
          "Partylists found in response.partylists:",
          response.partylists
        );
        partylistsData = response.partylists;
      } else if (Array.isArray(response)) {
        console.log("Response is an array:", response);
        partylistsData = response;
      } else if (response && Array.isArray(response.data)) {
        console.log("Partylists found in response.data:", response.data);
        partylistsData = response.data;
      } else {
        console.error("Unexpected response structure:", response);
        message.error(
          "Failed to load partylists data: Unexpected response format"
        );
        setPartylists([]);
        return;
      }

      // Log candidates data for debugging
      partylistsData.forEach((partylist, index) => {
        console.log(
          `Partylist ${index + 1} (${partylist.name}) candidates:`,
          partylist.candidates
            ? Array.isArray(partylist.candidates)
              ? partylist.candidates
              : "Not an array"
            : "No candidates property"
        );
      });

      setPartylists(partylistsData);
    } catch (error) {
      console.error("Error in fetchPartylists:", error);
      message.error(
        "Error fetching partylists: " + (error.message || "Unknown error")
      );
      setPartylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const getFilteredPartylists = () => {
    if (!searchText) return partylists;

    return partylists.filter((partylist) =>
      partylist.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const showAddModal = () => {
    setCurrentPartylist(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setCurrentPartylist(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description || "",
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let response;

      if (currentPartylist) {
        // Update existing partylist
        console.log(
          `Updating partylist ID ${currentPartylist.id} with:`,
          values
        );
        response = await updatePartylist(token, currentPartylist.id, values);
      } else {
        // Create new partylist
        console.log("Creating new partylist with:", values);
        response = await createPartylist(token, values);
      }

      console.log("API response:", response);

      if (response.success) {
        message.success(
          response.message ||
            `Partylist ${currentPartylist ? "updated" : "created"} successfully`
        );
        setIsModalVisible(false);
        form.resetFields();

        // Refresh the list
        fetchPartylists();
      } else {
        message.error(
          response.message ||
            `Failed to ${currentPartylist ? "update" : "create"} partylist`
        );
      }
    } catch (error) {
      console.error(
        `Error ${currentPartylist ? "updating" : "creating"} partylist:`,
        error
      );
      message.error("An error occurred: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (partylistId) => {
    confirm({
      title: "Are you sure you want to delete this partylist?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action cannot be undone. Partylists with associated candidates cannot be deleted.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          console.log(`Deleting partylist ID: ${partylistId}`);
          const response = await deletePartylist(token, partylistId);

          console.log("Delete response:", response);

          if (response.success) {
            message.success(
              response.message || "Partylist deleted successfully"
            );
            // Refresh the list
            fetchPartylists();
          } else {
            // Special handling for partylists with candidates
            if (response.hasAssociatedCandidates) {
              message.error(
                "Cannot delete partylist that has associated candidates"
              );
              Modal.warning({
                title: "Cannot Delete Partylist",
                content:
                  "This partylist has candidates associated with it. You must remove all candidates from this partylist before deleting it.",
                okText: "I Understand",
              });
            } else {
              message.error(response.message || "Failed to delete partylist");
            }
          }
        } catch (error) {
          console.error("Error deleting partylist:", error);
          message.error(
            "An error occurred while deleting: " +
              (error.message || "Unknown error")
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-base font-semibold">NAME</span>,
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <FlagOutlined style={{ color: "#38438c" }} />
          <Text style={{ fontSize: "15px" }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: <span className="text-base font-semibold">DESCRIPTION</span>,
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text style={{ fontSize: "15px" }}>{text || "No description"}</Text>
      ),
    },
    {
      title: <span className="text-base font-semibold">CANDIDATES</span>,
      key: "candidates",
      render: (_, record) => {
        // Get candidates from the record
        const candidates =
          record.candidates && Array.isArray(record.candidates)
            ? record.candidates
            : [];

        const candidateCount = candidates.length;

        // Set color based on count
        const color = candidateCount > 0 ? "blue" : "orange";

        // Create popover content if candidates exist
        let popoverContent = null;
        if (candidateCount > 0) {
          popoverContent = (
            <div style={{ maxWidth: "300px" }}>
              <p className="font-bold text-lg mb-2">
                Candidates in this partylist:
              </p>
              <ul className="list-disc pl-4">
                {candidates.map((candidate, index) => (
                  <li key={index} className="mb-2">
                    <Space>
                      <UserOutlined style={{ color: "#38438c" }} />
                      <span className="font-medium">
                        {getCandidateName(candidate)}
                      </span>
                    </Space>
                    {candidate.position?.name && (
                      <div className="text-gray-500 ml-5">
                        {candidate.position.name}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // If no candidates, show a simple tag
        if (candidateCount === 0) {
          return <Tag color={color}>No Candidates</Tag>;
        }

        // If candidates exist, show a popover with the list
        return (
          <Popover
            content={popoverContent}
            title={`${record.name} - Candidates`}
            placement="right"
            trigger="hover"
            overlayStyle={{ maxWidth: "400px" }}
          >
            <Tag color={color} style={{ cursor: "pointer" }}>
              {candidateCount === 1
                ? "1 Candidate"
                : `${candidateCount} Candidates`}
            </Tag>
          </Popover>
        );
      },
    },
    {
      title: <span className="text-base font-semibold">ACTIONS</span>,
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
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
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DashboardHeader title="Partylists Management" />

      <div className="mb-6">
        <Text className="text-lg text-gray-600">
          Manage partylists that candidates can join during elections.
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search partylists..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            className="w-full md:w-1/3"
            size="large"
          />
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPartylists}
              size="large"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
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
            >
              Add Partylist
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={getFilteredPartylists()}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            position: ["bottomCenter"],
          }}
          bordered
        />
      </div>

      <Modal
        title={
          <div className="bg-[#38438c] text-white py-3 px-6 -mt-6 -mx-6 mb-6 text-xl font-climate tracking-widest uppercase">
            {currentPartylist ? "EDIT PARTYLIST" : "ADD PARTYLIST"}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
        style={{ top: 20 }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label={
              <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                NAME
              </span>
            }
            rules={[
              { required: true, message: "Please enter the partylist name" },
            ]}
          >
            <Input placeholder="Enter partylist name" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                DESCRIPTION
              </span>
            }
          >
            <Input.TextArea
              placeholder="Enter partylist description"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: "#38438c",
                  transition: "background-color 0.3s ease",
                  height: "auto",
                  padding: "8px 20px",
                }}
              >
                {currentPartylist ? "Update Partylist" : "Add Partylist"}
              </Button>
              <Button
                onClick={handleCancel}
                size="large"
                style={{
                  height: "auto",
                  padding: "8px 20px",
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartylistsManagement;
