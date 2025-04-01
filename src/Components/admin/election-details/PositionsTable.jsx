import React from "react";
import { Card, Table, Tag, Typography } from "antd";

const { Text } = Typography;

/**
 * Component for displaying positions in an election
 */
const PositionsTable = ({ positions, candidates }) => {
  // Position table columns
  const columns = [
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
          candidates?.filter((c) => c.position_id === record.id).length || 0;
        return (
          <Tag color={count > 0 ? "green" : "orange"}>
            {count} candidate{count !== 1 ? "s" : ""}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card title="Positions" bordered={false} size="small">
      <Table
        dataSource={positions}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default PositionsTable;
