import React from "react";
import { Modal, Button, Input, Select, Row, Col } from "antd";

const { Option } = Select;

/**
 * Component for editing election details in a modal
 */
const EditElectionModal = ({
  visible,
  onCancel,
  onSubmit,
  formData,
  handleInputChange,
  handleSelectChange,
  submitting,
}) => {
  return (
    <Modal
      title="Edit Election"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="election_id" value={formData.election_id} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Election Name
          </label>
          <Input
            name="election_name"
            value={formData.election_name}
            onChange={handleInputChange}
            placeholder="Election Name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <Select
            name="status"
            value={formData.status}
            onChange={handleSelectChange}
            placeholder="Select Status"
            style={{ width: "100%" }}
          >
            <Option value="upcoming">Upcoming</Option>
            <Option value="ongoing">Ongoing</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Campaign Start Date
              </label>
              <input
                type="datetime-local"
                name="campaign_start_date"
                value={formData.campaign_start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Campaign End Date
              </label>
              <input
                type="datetime-local"
                name="campaign_end_date"
                value={formData.campaign_end_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Election Start Date
              </label>
              <input
                type="datetime-local"
                name="election_start_date"
                value={formData.election_start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Election End Date
              </label>
              <input
                type="datetime-local"
                name="election_end_date"
                value={formData.election_end_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </Col>
        </Row>

        <div className="flex justify-end space-x-3 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ backgroundColor: "#38438c" }}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditElectionModal;
