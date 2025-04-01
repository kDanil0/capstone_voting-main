import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Tag, Space, Button } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Component for displaying the election header with action buttons
 */
const ElectionHeader = ({
  election,
  status,
  formatDate,
  onEditClick,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  return (
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
              onClick={onEditClick}
              style={{ backgroundColor: "#38438c" }}
            >
              Edit Election
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={onDeleteClick}
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
  );
};

export default ElectionHeader;
