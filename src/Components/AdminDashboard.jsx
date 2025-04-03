import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  FlagOutlined,
  LockOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getAllPartylists,
  getAllStudents,
  getAllElections,
  getAllCandidates,
  resetPassword,
} from "../utils/api";
import { useAuthContext } from "../utils/AuthContext";

const AdminDashboard = () => {
  const { user, token } = useAuthContext();
  const [stats, setStats] = useState({
    students: 0,
    elections: 0,
    partylists: 0,
    candidates: 0,
  });
  const [loading, setLoading] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resetLoading, setResetLoading] = useState(false);

  // Primary color from the app's palette
  const PRIMARY_COLOR = "#4B3B7C";

  // Helper function to handle API requests with timeout
  const fetchWithTimeout = async (promiseFn, timeoutMs = 10000) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    );
    return Promise.race([promiseFn(), timeoutPromise]);
  };

  // Get the auth token from context
  const getAuthToken = () => {
    return token || user?.token;
  };

  // Extract count from various response formats
  const extractCount = (data, countProperties) => {
    if (!data) return 0;

    // Handle array response
    if (Array.isArray(data)) return data.length;

    // Check for properties in order of preference
    for (const prop of countProperties) {
      if (data[prop] && Array.isArray(data[prop])) {
        return data[prop].length;
      }
    }

    // Check for pagination total
    if (data.pagination && typeof data.pagination.total === "number") {
      return data.pagination.total;
    }

    // Check for direct total property
    if (typeof data.total === "number") {
      return data.total;
    }

    return 0;
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoading(true);
    setStats({
      students: 0,
      elections: 0,
      partylists: 0,
      candidates: 0,
    });

    try {
      const authToken = getAuthToken();

      if (!authToken) {
        message.error("Authentication token is missing. Please log in again.");
        setLoading(false);
        return;
      }

      // Run all API requests in parallel
      const results = await Promise.allSettled([
        fetchWithTimeout(() => getAllStudents(authToken, 1, 100), 15000),
        fetchWithTimeout(() => getAllElections(authToken)),
        fetchWithTimeout(() => getAllPartylists(authToken)),
        fetchWithTimeout(() => getAllCandidates()),
      ]);

      // Extract results
      const [
        studentsResult,
        electionsResult,
        partylistsResult,
        candidatesResult,
      ] = results;

      // Process counts using the helper function
      const studentCount =
        studentsResult.status === "fulfilled"
          ? extractCount(studentsResult.value, ["students"])
          : 0;

      const electionCount =
        electionsResult.status === "fulfilled"
          ? extractCount(electionsResult.value, ["elections"])
          : 0;

      const partylistCount =
        partylistsResult.status === "fulfilled"
          ? extractCount(partylistsResult.value, ["party_lists", "partylists"])
          : 0;

      const candidateCount =
        candidatesResult.status === "fulfilled"
          ? extractCount(candidatesResult.value, ["candidates"])
          : 0;

      // Update stats with all the counts
      setStats({
        students: studentCount,
        elections: electionCount,
        partylists: partylistCount,
        candidates: candidateCount,
      });
    } catch (error) {
      message.error("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (values) => {
    setResetLoading(true);
    try {
      const response = await resetPassword(token, values.newPassword);

      if (response.success) {
        message.success(response.message);
        setResetPasswordModal(false);
        resetPasswordForm.resetFields();
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          message.error("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          message.error("You don't have permission to reset passwords.");
        } else {
          message.error(response.message || "Failed to reset password");
        }
      }
    } catch (error) {
      console.error("Error in password reset:", error);
      message.error("An unexpected error occurred while resetting password");
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    const authToken = getAuthToken();
    if (authToken) {
      fetchStats();

      // Set up an interval to refresh stats periodically
      const intervalId = setInterval(() => {
        if (getAuthToken()) {
          fetchStats();
        }
      }, 300000); // 5 minutes

      // Clear interval on component unmount
      return () => clearInterval(intervalId);
    } else {
      message.warning(
        "No authentication token available. Please log in again."
      );
    }
  }, [user, token]);

  // Stat Card component for consistent styling
  const StatCard = ({ icon, title, value, color }) => (
    <Card
      hoverable
      className="shadow-sm"
      bodyStyle={{ padding: "24px" }}
      style={{ height: "100%" }}
    >
      <Statistic
        title={
          <span style={{ fontSize: "16px", color: "rgba(0, 0, 0, 0.85)" }}>
            {title}
          </span>
        }
        value={value}
        valueStyle={{ color: PRIMARY_COLOR, fontWeight: 500 }}
        prefix={React.cloneElement(icon, {
          style: { color: PRIMARY_COLOR, marginRight: "8px" },
        })}
      />
    </Card>
  );

  return (
    <div className="admin-dashboard p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-climate text-[#4B3B7C] mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">Overview of your system statistics</p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<UserOutlined />}
            title="Total Students"
            value={loading ? <Spin size="small" /> : stats.students}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<CalendarOutlined />}
            title="Total Elections"
            value={loading ? <Spin size="small" /> : stats.elections}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<FlagOutlined />}
            title="Total Partylists"
            value={loading ? <Spin size="small" /> : stats.partylists}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<TeamOutlined />}
            title="Total Candidates"
            value={loading ? <Spin size="small" /> : stats.candidates}
          />
        </Col>

        {/* Reset Password Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="shadow-sm"
            bodyStyle={{ padding: "24px" }}
            style={{ height: "100%" }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <LockOutlined
                style={{
                  fontSize: "24px",
                  color: PRIMARY_COLOR,
                  marginBottom: "12px",
                }}
              />
              <h3 className="text-lg font-medium mb-4">Reset Password</h3>
              <Button
                type="primary"
                onClick={() => setResetPasswordModal(true)}
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Reset Password
              </Button>
            </div>
          </Card>
        </Col>

        {/* Refresh Stats Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="shadow-sm"
            bodyStyle={{ padding: "24px" }}
            style={{ height: "100%" }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <ReloadOutlined
                style={{
                  fontSize: "24px",
                  color: PRIMARY_COLOR,
                  marginBottom: "12px",
                }}
              />
              <h3 className="text-lg font-medium mb-4">Refresh Stats</h3>
              <Button type="default" onClick={fetchStats} loading={loading}>
                Refresh Data
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Admin Password"
        open={resetPasswordModal}
        onCancel={() => {
          setResetPasswordModal(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter the new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm the password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setResetPasswordModal(false);
                resetPasswordForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={resetLoading}
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Reset Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
