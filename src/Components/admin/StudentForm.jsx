import React, { useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Typography,
  Space,
  message,
  Divider,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { addStudent, batchUploadStudents } from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentForm = ({
  token,
  onAddStudent,
  onBatchUpload,
  departments = [],
}) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Combine firstName and lastName into a single name field
      // in the format "LastName, FirstName" as shown in the table
      const studentData = {
        id: parseInt(values.studentNumber, 10),
        name: `${values.lastName}, ${values.firstName}`,
        department_id: parseInt(values.department, 10),
        email: values.email,
      };

      console.log("Sending student data with numeric values:", studentData);

      // Call the API function to add a student
      const response = await addStudent(token, studentData);

      if (response.success) {
        message.success(response.message || "Student added successfully");

        // Call the parent component's function to refresh the list
        onAddStudent(studentData);

        // Reset form
        form.resetFields();
      } else {
        // Display a more specific error message if available
        const errorMsg =
          response.error?.message ||
          response.message ||
          "Failed to add student";

        if (errorMsg.includes("Integrity constraint violation")) {
          message.error(
            "Student ID already exists or department ID is invalid. Please check your inputs."
          );
        } else {
          message.error(errorMsg);
        }
      }
    } catch (error) {
      console.error("Error adding student:", error);
      message.error(
        "Failed to add student: " + (error.message || "Unknown error")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (info) => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }

    if (info.file.status === "done") {
      setSubmitting(true);
      try {
        const file = info.file.originFileObj;
        if (
          file &&
          (file.name.endsWith(".csv") || file.name.endsWith(".txt"))
        ) {
          // Call the API function to upload the CSV
          const response = await batchUploadStudents(token, file);

          if (response.success) {
            // Show success message with details
            message.success(
              `${response.message} Processed ${
                response.data.students_processed || 0
              } students, created ${response.data.users_created || 0} users.`
            );

            // If there are any errors in the import, display them
            if (response.errors && response.errors.length > 0) {
              // Create a modal or notification with the errors
              Modal.warning({
                title: "Import completed with warnings",
                content: (
                  <div style={{ maxHeight: "300px", overflow: "auto" }}>
                    <p>The following issues were found during import:</p>
                    <ul>
                      {response.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ),
                width: 600,
              });
            }

            // Read the file content for the parent component's callback
            const reader = new FileReader();
            reader.onload = (event) => {
              const csvData = event.target.result;
              onBatchUpload(csvData);
            };
            reader.readAsText(file);
          } else {
            // Display error details if available
            if (response.errors && response.errors.length > 0) {
              Modal.error({
                title: response.message || "Failed to process CSV file",
                content: (
                  <div style={{ maxHeight: "300px", overflow: "auto" }}>
                    <p>The following errors occurred:</p>
                    <ul>
                      {response.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ),
                width: 600,
              });
            } else {
              message.error(response.message || "Failed to process CSV file");
            }
          }
        } else {
          message.error("Please upload a valid CSV or TXT file");
        }
      } catch (error) {
        console.error("Error processing CSV:", error);
        message.error(
          `Failed to process CSV: ${error.message || "Unknown error"}`
        );
      } finally {
        setSubmitting(false);
      }
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // Custom file upload button
  const customUploadRequest = ({ file, onSuccess }) => {
    // Simulate successful upload after a short delay
    setTimeout(() => {
      onSuccess("ok");
    }, 100);
  };

  const beforeUpload = (file) => {
    const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");
    const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
    const isValidFile = isCsv || isTxt;

    if (!isValidFile) {
      message.error("You can only upload CSV or TXT files!");
    }
    return isValidFile || Upload.LIST_IGNORE;
  };

  return (
    <div className="border border-gray-300 rounded">
      <div className="bg-[#38438c] text-white py-4 px-6 text-xl font-climate tracking-widest uppercase">
        ADD STUDENT
      </div>

      <div className="p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          name="studentForm"
          className="space-y-6"
          size="large"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="studentNumber"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  STUDENT NUMBER
                </span>
              }
              rules={[
                { required: true, message: "Please input student number!" },
                {
                  pattern: /^\d+$/,
                  message: "Student number must contain only digits!",
                },
              ]}
            >
              <Input className="py-2" placeholder="Enter numeric student ID" />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  EMAIL
                </span>
              }
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input className="py-2" placeholder="student@example.com" />
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
                {departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <Option key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </Option>
                  ))
                ) : (
                  <>
                    <Option value="1">CCIS</Option>
                    <Option value="2">COE</Option>
                    <Option value="3">CON</Option>
                    <Option value="4">COC</Option>
                    <Option value="5">CHTM</Option>
                    <Option value="6">COB</Option>
                    <Option value="7">CAS</Option>
                  </>
                )}
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
              loading={submitting}
              disabled={submitting}
            >
              Add Student
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-8" />

        <Title level={4} className="text-[#38438c] font-bold mb-4">
          BATCH UPLOAD STUDENTS
        </Title>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Text className="text-base">
            Upload CSV/TXT File: (CSV or TXT files only)
          </Text>

          <Upload
            accept=".csv,.txt"
            beforeUpload={beforeUpload}
            customRequest={customUploadRequest}
            onChange={handleFileUpload}
            maxCount={1}
            disabled={submitting}
          >
            <Button
              icon={<UploadOutlined />}
              style={{
                backgroundColor: "#38438c",
                color: "white",
                height: "auto",
                padding: "10px 16px",
                fontSize: "15px",
              }}
              size="large"
              loading={submitting}
              disabled={submitting}
            >
              Click to Upload
            </Button>
          </Upload>

          <Text type="secondary" style={{ fontSize: "14px" }}>
            CSV format: student_number,name,department_id,email
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default StudentForm;
