import React from "react";
import { Card, Table, Tag, Space, Avatar, Typography } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  FlagOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

/**
 * Component for displaying candidates in an election
 */
const CandidatesTable = ({ candidates, positions }) => {
  // Candidate table columns
  const columns = [
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
        const position = positions?.find((p) => p.id === positionId);
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

  return (
    <Card
      title={
        <Title level={5}>
          <TeamOutlined /> Candidates ({candidates?.length || 0})
        </Title>
      }
      className="mt-4"
      bordered={false}
    >
      <Table
        dataSource={candidates}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="middle"
      />
    </Card>
  );
};

export default CandidatesTable;
