// src/Components/admin/CandidateTable.jsx
import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
} from "antd";

const { Text } = Typography;
const { Option } = Select;

const CandidateTable = ({ candidates }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [form] = Form.useForm();

  // Show modal and set the candidate data for editing
  const showEditModal = (record) => {
    setEditingCandidate(record);
    form.setFieldsValue({
      username: record.username,
      firstName: record.firstName,
      lastName: record.lastName,
      department: record.department,
      position: record.position,
      partyList: record.partyList,
      election: record.election || "USG2023", // Default value in case record doesn't have election
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = (values) => {
    console.log("Updated candidate values:", values);
    // Here you would typically update the candidate in your data source

    setIsModalVisible(false);
    form.resetFields();
  };

  // Define columns for Ant Design Table
  const columns = [
    {
      title: <span className="text-base font-semibold">USERNAME</span>,
      dataIndex: "username",
      key: "username",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">FIRST NAME</span>,
      dataIndex: "firstName",
      key: "firstName",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">LAST NAME</span>,
      dataIndex: "lastName",
      key: "lastName",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">PARTY LIST</span>,
      dataIndex: "partyList",
      key: "partyList",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">DEPARTMENT</span>,
      dataIndex: "department",
      key: "department",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">POSITION</span>,
      dataIndex: "position",
      key: "position",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
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
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="border border-gray-300 rounded">
      <Table
        columns={columns}
        dataSource={candidates}
        rowKey="username"
        pagination={{
          pageSize: 8,
          showSizeChanger: false,
          position: ["bottomCenter"],
        }}
        bordered
        size="large"
        rowClassName="text-base"
      />

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
        bodyStyle={{ padding: "24px" }}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              name="username"
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
              name="firstName"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  FIRST NAME
                </span>
              }
              rules={[{ required: true, message: "Please input first name!" }]}
            >
              <Input className="py-2" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  LAST NAME
                </span>
              }
              rules={[{ required: true, message: "Please input last name!" }]}
            >
              <Input className="py-2" />
            </Form.Item>

            <Form.Item
              name="election"
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
                <Option value="USG2023">USG Election 2023</Option>
                <Option value="COLLEGE2023">College Election 2023</Option>
                <Option value="DEPARTMENT2023">Department Election 2023</Option>
                <Option value="USG2024">USG Election 2024</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="department"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  DEPARTMENT
                </span>
              }
              rules={[{ required: true, message: "Please select department!" }]}
            >
              <Select
                placeholder="Select Department"
                dropdownStyle={{ fontSize: "16px" }}
                size="large"
              >
                <Option value="CCIS">CCIS</Option>
                <Option value="COE">COE</Option>
                <Option value="CON">CON</Option>
                <Option value="COC">COC</Option>
                <Option value="CHTM">CHTM</Option>
                <Option value="COB">COB</Option>
                <Option value="CAS">CAS</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="position"
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
                <Option value="PRESIDENT">President</Option>
                <Option value="VICE_PRESIDENT">Vice President</Option>
                <Option value="SECRETARY">Secretary</Option>
                <Option value="TREASURER">Treasurer</Option>
                <Option value="PIO">PIO</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="partyList"
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
                <Option value="takbong bayan">Takbong Bayan</Option>
                <Option value="balik alindog">Balik Alindog</Option>
                <Option value="independent">Independent</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
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
