import React from "react";
import { Card, Descriptions, Tag } from "antd";

/**
 * Component for displaying election information details
 */
const ElectionInformation = ({ election, status, formatDate }) => {
  return (
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
  );
};

export default ElectionInformation;
