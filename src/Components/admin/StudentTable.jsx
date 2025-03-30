import React, { useState } from "react";
import { Table, Button, Input, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

const StudentTable = ({ students, onDelete }) => {
  const [searchText, setSearchText] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.studentNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.department.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchText(e.target.value);
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
      key: "fullName",
      render: (_, record) => (
        <Text style={{ fontSize: "15px" }}>
          {`${record.lastName}, ${record.firstName}`}
        </Text>
      ),
    },
    {
      title: <span className="text-base font-semibold">DEPARTMENT</span>,
      dataIndex: "department",
      key: "department",
      render: (text) => <Text style={{ fontSize: "15px" }}>{text}</Text>,
    },
    {
      title: <span className="text-base font-semibold">TOKEN</span>,
      dataIndex: "token",
      key: "token",
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
          >
            Generate Token
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
            onClick={() => onDelete(record.id)}
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
          dataSource={filteredStudents}
          columns={columns}
          rowKey="studentNumber"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            position: ["bottomCenter"],
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
