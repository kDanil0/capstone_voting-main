import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Tooltip,
  Modal,
  message,
} from "antd";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { confirm } = Modal;

const StudentTable = ({
  students,
  loading,
  pagination,
  onTableChange,
  onSearch,
  onGenerateToken,
  onDelete,
  departments,
}) => {
  const [searchText, setSearchText] = useState("");
  const [generatingTokenFor, setGeneratingTokenFor] = useState(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch && onSearch(value);
  };

  const handleGenerateToken = async (studentId) => {
    setGeneratingTokenFor(studentId);
    try {
      const response = await onGenerateToken(studentId);

      // Check if there's an error in the results for this student
      const studentResult = response?.results?.[studentId];

      if (!studentResult) {
        message.error({
          content: "Failed to generate token: No response from server",
          duration: 4,
        });
        return;
      }

      if (studentResult.status === "error") {
        // Show error message with timeout information if available
        message.error({
          content: studentResult.error || "Failed to generate token",
          duration: 6,
        });
        return;
      }

      // If we reach here, it's a success case
      if (studentResult.status === "success") {
        let successMessage = `Token generated successfully`;

        if (studentResult.attempts_remaining !== undefined) {
          successMessage += `. ${studentResult.attempts_remaining} attempts remaining`;
        }

        if (!studentResult.email_sent && studentResult.email_error) {
          // Email failure case
          message.warning({
            content: `${successMessage}, but email could not be sent. Please try again or contact support.`,
            duration: 6,
          });
        } else {
          // Complete success case
          message.success({
            content: `${successMessage} and sent to user's email.`,
            duration: 4,
          });
        }
      } else {
        // Handle any other cases
        message.info({
          content: response.message || "Operation completed",
          duration: 4,
        });
      }
    } catch (error) {
      message.error({
        content: error.message || "Failed to generate token",
        duration: 4,
      });
    } finally {
      setGeneratingTokenFor(null);
    }
  };

  const showDeleteConfirm = (studentId) => {
    confirm({
      title: "Are you sure you want to delete this student?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        onDelete(studentId);
      },
    });
  };

  // Function to get department name from department ID
  const getDepartmentName = (departmentId) => {
    if (!departments || !departments.length) {
      return departmentId;
    }

    // Try finding by id property
    let department = departments.find((dept) => dept.id === departmentId);

    // If not found, try with department_id
    if (!department) {
      department = departments.find(
        (dept) => dept.department_id === departmentId
      );
    }

    // If not found but departmentId is a number, try string comparison
    if (!department && typeof departmentId === "number") {
      department = departments.find(
        (dept) =>
          dept.id === departmentId.toString() ||
          parseInt(dept.id) === departmentId
      );
    }

    return department ? department.name : departmentId;
  };

  const columns = [
    {
      title: <span className="text-base font-semibold">STUDENT NUMBER</span>,
      dataIndex: "studentNumber",
      key: "studentNumber",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">STUDENT NAME</span>,
      key: "name",
      dataIndex: "name",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">DEPARTMENT</span>,
      dataIndex: "department",
      key: "department",
      render: (departmentId) => (
        <Text style={{ fontSize: "15px" }}>
          {getDepartmentName(departmentId)}
        </Text>
      ),
    },
    {
      title: <span className="text-base font-semibold">STATUS</span>,
      key: "status",
      render: (_, record) => (
        <Tag color={record.isRegistered ? "green" : "orange"}>
          {record.isRegistered ? "Registered" : "Unregistered"}
        </Tag>
      ),
    },
    {
      title: <span className="text-base font-semibold">TOKEN</span>,
      key: "token",
      render: (_, record) => {
        const tokenStatus = record.tokenUsed
          ? "Used"
          : record.tokenExpiry && new Date(record.tokenExpiry) < new Date()
          ? "Expired"
          : record.token !== "No Token"
          ? "Valid"
          : "None";

        const tokenColor = {
          Used: "gray",
          Expired: "red",
          Valid: "green",
          None: "orange",
        };

        return (
          <Tooltip
            title={
              record.tokenExpiry
                ? `Expires: ${new Date(record.tokenExpiry).toLocaleString()}`
                : "No expiration"
            }
            placement="top"
          >
            <Space>
              <Text style={{ fontSize: "15px" }}>{record.token}</Text>
              {record.token !== "No Token" && (
                <Tag color={tokenColor[tokenStatus]}>{tokenStatus}</Tag>
              )}
            </Space>
          </Tooltip>
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
            size="middle"
            style={{
              backgroundColor: "#38438c",
              transition: "background-color 0.3s ease",
              padding: "0 16px",
              height: "36px",
              fontSize: "14px",
            }}
            onClick={() => handleGenerateToken(record.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2c3470";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#38438c";
            }}
            loading={generatingTokenFor === record.id}
            disabled={loading}
          >
            {generatingTokenFor === record.id
              ? "Generating..."
              : "Generate Token"}
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
            onClick={() => showDeleteConfirm(record.id)}
            disabled={loading}
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
        <div className="mb-6">
          <Input
            placeholder="Search students..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            className="w-full md:w-1/3 mb-4"
            size="large"
          />
        </div>
        <Table
          loading={loading}
          dataSource={students}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: pagination?.pageSize || 8,
            current: pagination?.current || 1,
            total: pagination?.total || 0,
            showSizeChanger: false,
            position: ["bottomCenter"],
            onChange: (page, pageSize) => {
              onTableChange && onTableChange({ current: page, pageSize });
            },
          }}
          onChange={(pagination) => {
            onTableChange && onTableChange(pagination);
          }}
          bordered
          size="large"
          rowClassName="text-base"
        />
      </div>
    </div>
  );
};

export default StudentTable;
