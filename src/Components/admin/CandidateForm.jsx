// src/Components/admin/CreateCandidateForm.jsx
import React from "react";
import { Form, Input, Select, Button, Typography } from "antd";

const { Title } = Typography;
const { Option } = Select;

const CreateCandidateForm = ({ onAddCandidate }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onAddCandidate({
      ...values,
      // Add any additional processing here
    });

    // Reset form
    form.resetFields();
  };

  return (
    <div className="border border-gray-300 rounded">
      <div className="bg-[#38438c] text-white py-4 px-6 text-xl font-climate tracking-widest uppercase">
        CREATE CANDIDATE ACCOUNT
      </div>

      <div className="p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          name="candidateForm"
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
              Make a Candidate
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateCandidateForm;
