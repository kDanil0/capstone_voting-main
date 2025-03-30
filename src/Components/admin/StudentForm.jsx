import React, { useRef } from "react";
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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentForm = ({ onAddStudent, onBatchUpload }) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);

  const handleSubmit = (values) => {
    // Generate a random token or this could come from your backend
    const generatedToken = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    onAddStudent({
      ...values,
      token: generatedToken,
    });

    // Reset form
    form.resetFields();
  };

  const handleFileUpload = (info) => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }

    if (info.file.status === "done") {
      const file = info.file.originFileObj;
      if (file && file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csvData = event.target.result;
          // Process CSV data and pass to parent component
          onBatchUpload(csvData);
          message.success(`${info.file.name} file uploaded successfully`);
        };
        reader.readAsText(file);
      } else {
        message.error("Please upload a valid CSV file");
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
    if (!isCsv) {
      message.error("You can only upload CSV files!");
    }
    return isCsv || Upload.LIST_IGNORE;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Form.Item
              name="studentNumber"
              label={
                <span className="text-[#38438c] font-bold font-assistant text-base uppercase mb-2">
                  STUDENT NUMBER
                </span>
              }
              rules={[
                { required: true, message: "Please input student number!" },
              ]}
            >
              <Input className="py-2" />
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
                <Option value="CCIS">CCIS</Option>
                <Option value="COE">COE</Option>
                <Option value="CON">CON</Option>
                <Option value="COC">COC</Option>
                <Option value="CHTM">CHTM</Option>
                <Option value="COB">COB</Option>
                <Option value="CAS">CAS</Option>
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
              Add Student
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-8" />

        <Title level={4} className="text-[#38438c] font-bold mb-4">
          BATCH UPLOAD STUDENTS
        </Title>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Text className="text-base">Upload CSV File: (CSV files only)</Text>

          <Upload
            accept=".csv"
            beforeUpload={beforeUpload}
            customRequest={customUploadRequest}
            onChange={handleFileUpload}
            maxCount={1}
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
            >
              Click to Upload
            </Button>
          </Upload>

          <Text type="secondary" style={{ fontSize: "14px" }}>
            CSV format: student_number,first_name,last_name,department
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default StudentForm;
