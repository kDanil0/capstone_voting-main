// src/Components/admin/CandidateForm.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  message as antMessage,
  Alert,
  Spin,
  Tag,
  Avatar,
  Pagination,
  Space,
  Table,
  Modal,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  verifyAndMakeCandidate,
  getAllPositions,
  getAllPartylists,
  getAllElections,
  getStudentUsers,
  getAllCandidates,
} from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";

const { Title } = Typography;
const { Option } = Select;

// Create a custom component for the student dropdown
const StudentSelect = ({ value, onChange, loading, onSearch, students }) => {
  // Find the selected student
  const selectedStudent = value
    ? students.find((s) => s.student_id === value)
    : null;

  return (
    <Select
      placeholder="Search by student ID, name, or email"
      showSearch
      loading={loading}
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      filterOption={false}
      size="large"
      className="w-full"
      notFoundContent={loading ? <Spin size="small" /> : "No students found"}
      suffixIcon={loading ? <Spin size="small" /> : null}
      dropdownMatchSelectWidth={false}
      style={{ width: "100%" }}
    >
      {students.map((student) => {
        const displayName =
          student.name ||
          `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
          student.student_id;
        const departmentName = student.department?.name || "No Department";

        return (
          <Select.Option key={student.student_id} value={student.student_id}>
            <div className="flex items-center py-1">
              <Avatar
                icon={<UserOutlined />}
                className="mr-3 flex-shrink-0"
                style={{ backgroundColor: "#1890ff" }}
                size="small"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{displayName}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="whitespace-nowrap">
                    ID: {student.student_id}
                  </span>
                  <Tag color="blue" className="ml-2 flex-shrink-0" size="small">
                    {departmentName}
                  </Tag>
                </div>
                {student.email && (
                  <div className="text-xs text-gray-500 truncate">
                    {student.email}
                  </div>
                )}
              </div>
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );
};

const CandidateForm = () => {
  const { token } = useAuthContext();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [partyLists, setPartyLists] = useState([]);
  const [elections, setElections] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingCandidates, setExistingCandidates] = useState([]);
  const [formMessage, setFormMessage] = useState({ type: "", content: "" });
  const [dataLoading, setDataLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);

  // Fetch positions, party lists, elections, and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        await Promise.all([
          fetchPositions(),
          fetchPartyLists(),
          fetchElections(),
          fetchExistingCandidates(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        antMessage.error("Failed to load form data. Please refresh the page.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Fetch students whenever pagination or search changes
  useEffect(() => {
    fetchStudents(searchQuery, pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize, searchQuery]);

  // Function to fetch positions from API
  const fetchPositions = async () => {
    try {
      const response = await getAllPositions();
      if (response && response.positions) {
        setPositions(response.positions);
      } else if (Array.isArray(response)) {
        setPositions(response);
      }
      return response;
    } catch (error) {
      console.error("Error fetching positions:", error);
      antMessage.error("Failed to load positions");
      throw error;
    }
  };

  // Function to fetch party lists from API
  const fetchPartyLists = async () => {
    try {
      const response = await getAllPartylists(token);
      if (response && response.party_lists) {
        setPartyLists(response.party_lists);
      } else if (Array.isArray(response)) {
        setPartyLists(response);
      }
      return response;
    } catch (error) {
      console.error("Error fetching party lists:", error);
      antMessage.error("Failed to load party lists");
      throw error;
    }
  };

  // Function to fetch elections from API
  const fetchElections = async () => {
    try {
      const response = await getAllElections(token);
      if (response && response.elections) {
        setElections(response.elections);
      } else if (Array.isArray(response)) {
        setElections(response);
      }
      return response;
    } catch (error) {
      console.error("Error fetching elections:", error);
      antMessage.error("Failed to load elections");
      throw error;
    }
  };

  // Function to fetch existing candidates
  const fetchExistingCandidates = async () => {
    try {
      const response = await getAllCandidates();
      if (response && response.candidates) {
        setExistingCandidates(response.candidates);
      } else if (Array.isArray(response)) {
        setExistingCandidates(response);
      }
      return response;
    } catch (error) {
      console.error("Error fetching existing candidates:", error);
      antMessage.error("Failed to load existing candidates");
      throw error;
    }
  };

  // Function to fetch student users
  const fetchStudents = async (search = "", page = 1, pageSize = 10) => {
    setStudentsLoading(true);
    try {
      const response = await getStudentUsers(token, search, page, pageSize);

      if (response.success) {
        // Filter out students who are already candidates
        const candidateStudentIds = existingCandidates.map(
          (candidate) => candidate.student_id || candidate.user?.student_id
        );

        const filteredStudents = response.students.filter(
          (student) => !candidateStudentIds.includes(student.student_id)
        );

        setStudents(filteredStudents);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: response.pagination?.total || filteredStudents.length,
        });
      } else {
        antMessage.error(response.message || "Failed to load students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      antMessage.error("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Handle pagination change
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  // Handle search input
  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination({
      ...pagination,
      current: 1, // Reset to first page on new search
    });
  };

  // Function to validate election and position selection
  const validateElectionAndPosition = () => {
    const electionId = form.getFieldValue("election_id");
    const positionId = form.getFieldValue("position_id");

    if (
      !selectedStudent ||
      !selectedStudent.department ||
      !electionId ||
      !positionId
    ) {
      setValidationMessage(null);
      return;
    }

    const election = elections.find((e) => e.id === electionId);
    const position = positions.find((p) => p.id === positionId);
    const studentDepartmentId = selectedStudent.department?.id;
    const studentDepartmentName = selectedStudent.department?.name || "Unknown";

    // Check position compatibility
    if (
      position &&
      !position.is_general &&
      position.department_id !== studentDepartmentId
    ) {
      setValidationMessage({
        type: "error",
        content: `Warning: Position "${position.name}" is specific to ${
          position.department?.name || "another"
        } department, but the student is from ${studentDepartmentName}.`,
      });
      return;
    }

    // Check election compatibility
    if (
      election &&
      election.department_id &&
      election.department_id !== studentDepartmentId
    ) {
      setValidationMessage({
        type: "error",
        content: `Warning: Election "${
          election.election_name
        }" is specific to ${
          election.department?.name || "another"
        } department, but the student is from ${studentDepartmentName}.`,
      });
      return;
    }

    // If everything is compatible
    setValidationMessage({
      type: "success",
      content: "Student is eligible for the selected position and election.",
    });
  };

  // Update validation when form values change
  const handleFormValuesChange = () => {
    validateElectionAndPosition();
  };

  // Open modal to make a student a candidate
  const showMakeCandidateModal = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
    form.resetFields();
    setValidationMessage(null);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    setFormMessage({ type: "", content: "" });

    try {
      // Additional client-side validation
      const election = elections.find((e) => e.id === values.election_id);
      const position = positions.find((p) => p.id === values.position_id);
      const studentDepartmentId = selectedStudent.department?.id;

      // Check if position is not general and student department doesn't match position department
      if (
        position &&
        !position.is_general &&
        position.department_id !== studentDepartmentId
      ) {
        setFormMessage({
          type: "error",
          content: `This student cannot be a candidate for this position. The position is for ${
            position.department?.name || "another"
          } department.`,
        });
        antMessage.error(
          `Student from ${
            selectedStudent.department?.name || "one department"
          } cannot run for a position in ${
            position.department?.name || "another"
          } department.`
        );
        setSubmitLoading(false);
        return;
      }

      // Check if election has department and student department doesn't match election department
      if (
        election &&
        election.department_id &&
        election.department_id !== studentDepartmentId
      ) {
        setFormMessage({
          type: "error",
          content: `This student cannot be a candidate in this election. The election is for ${
            election.department?.name || "another"
          } department.`,
        });
        antMessage.error(
          `Student from ${
            selectedStudent.department?.name || "one department"
          } cannot participate in an election for ${
            election.department?.name || "another"
          } department.`
        );
        setSubmitLoading(false);
        return;
      }

      const candidateData = {
        ...values,
        student_id: selectedStudent.student_id,
      };

      const response = await verifyAndMakeCandidate(token, candidateData);

      if (
        response.message === "Candidacy successfully filed." ||
        response.candidate
      ) {
        setFormMessage({
          type: "success",
          content: "Candidate created successfully!",
        });
        antMessage.success("Candidate created successfully");
        form.resetFields();
        setIsModalVisible(false);

        // Refresh the candidate list and students
        await fetchExistingCandidates();
        await fetchStudents(
          searchQuery,
          pagination.current,
          pagination.pageSize
        );
      } else {
        setFormMessage({
          type: "error",
          content: response.message || "Failed to create candidate",
        });
        antMessage.error(response.message || "Failed to create candidate");
      }
    } catch (error) {
      console.error("Error creating candidate:", error);
      setFormMessage({
        type: "error",
        content:
          "Error creating candidate: " + (error.message || "Unknown error"),
      });
      antMessage.error(
        "Error creating candidate: " + (error.message || "Unknown error")
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
      sorter: (a, b) => a.student_id.localeCompare(b.student_id),
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => {
        const displayName =
          record.name ||
          `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
          record.student_id;
        return (
          <div className="flex items-center">
            <Avatar
              icon={<UserOutlined />}
              className="mr-3"
              style={{ backgroundColor: "#1890ff" }}
              size="small"
            />
            <span>{displayName}</span>
          </div>
        );
      },
      sorter: (a, b) => {
        const nameA =
          a.name || `${a.first_name || ""} ${a.last_name || ""}`.trim();
        const nameB =
          b.name || `${b.first_name || ""} ${b.last_name || ""}`.trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Department",
      key: "department",
      render: (_, record) => {
        const departmentName = record.department?.name || "No Department";
        return <Tag color="blue">{departmentName}</Tag>;
      },
      filters: [
        ...new Set(
          students
            .filter((s) => s.department?.name)
            .map((s) => s.department.name)
        ),
      ].map((dept) => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department?.name === value,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => showMakeCandidateModal(record)}
        >
          Make Candidate
        </Button>
      ),
    },
  ];

  if (dataLoading) {
    return (
      <div className="border border-gray-300 rounded p-8 flex justify-center items-center h-64">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded">
      <div className="bg-[#38438c] text-white py-4 px-6 text-xl font-climate tracking-widest uppercase">
        MANAGE CANDIDATES
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="mb-0">
            Students Available to Make Candidates
          </Title>
          <Input
            placeholder="Search by ID, name, or email"
            prefix={<SearchOutlined />}
            className="w-80"
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>

        {formMessage.content && (
          <Alert
            message={formMessage.content}
            type={formMessage.type}
            showIcon
            className="mb-6"
          />
        )}

        <Table
          dataSource={students}
          columns={columns}
          loading={studentsLoading}
          rowKey="student_id"
          pagination={pagination}
          onChange={handleTableChange}
          size="middle"
          bordered
          className="shadow-sm"
        />

        <Modal
          title="Make Student a Candidate"
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          destroyOnClose
          width={600}
        >
          {selectedStudent && (
            <div>
              <div className="mb-4 bg-blue-50 p-4 rounded-md">
                <div className="flex items-center">
                  <Avatar
                    icon={<UserOutlined />}
                    className="mr-4"
                    style={{ backgroundColor: "#1890ff" }}
                    size="large"
                  />
                  <div>
                    <div className="text-lg font-medium">
                      {selectedStudent.name ||
                        `${selectedStudent.first_name || ""} ${
                          selectedStudent.last_name || ""
                        }`.trim() ||
                        selectedStudent.student_id}
                    </div>
                    <div className="text-gray-600">
                      ID: {selectedStudent.student_id}
                      {selectedStudent.department?.name && (
                        <Tag color="blue" className="ml-2">
                          {selectedStudent.department.name}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                name="candidateModal"
                requiredMark={false}
                onValuesChange={handleFormValuesChange}
              >
                <Form.Item
                  name="election_id"
                  label="Election"
                  rules={[
                    { required: true, message: "Please select election!" },
                  ]}
                >
                  <Select
                    placeholder="Select Election"
                    size="large"
                    className="w-full"
                  >
                    {elections.map((election) => (
                      <Option key={election.id} value={election.id}>
                        {election.election_name}
                        {election.department?.name
                          ? ` (${election.department.name})`
                          : election.election_type_id === 1
                          ? " (General)"
                          : ""}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="position_id"
                  label="Position"
                  rules={[
                    { required: true, message: "Please select position!" },
                  ]}
                >
                  <Select
                    placeholder="Select Position"
                    size="large"
                    className="w-full"
                  >
                    {positions.map((position) => (
                      <Option key={position.id} value={position.id}>
                        {position.name}
                        {position.is_general
                          ? " (General)"
                          : position.department?.name
                          ? ` (${position.department.name})`
                          : ""}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="party_list_id"
                  label="Party List"
                  rules={[
                    { required: true, message: "Please select party list!" },
                  ]}
                >
                  <Select
                    placeholder="Select Party List"
                    size="large"
                    className="w-full"
                  >
                    {partyLists.map((partyList) => (
                      <Option key={partyList.id} value={partyList.id}>
                        {partyList.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {validationMessage && (
                  <Alert
                    message={validationMessage.content}
                    type={validationMessage.type}
                    showIcon
                    className="my-4"
                  />
                )}

                <Alert
                  message="The system will validate that students can only be assigned to positions that match their department or are general positions."
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  className="my-4 bg-blue-50 border-blue-200"
                />

                <div className="flex justify-end mt-4">
                  <Button onClick={handleModalCancel} className="mr-2">
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitLoading}
                    style={{
                      backgroundColor: "#38438c",
                    }}
                  >
                    Create Candidate
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CandidateForm;
