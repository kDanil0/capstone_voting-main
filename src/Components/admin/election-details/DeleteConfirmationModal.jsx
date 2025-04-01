import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

/**
 * Component for confirming election deletion
 */
const DeleteConfirmationModal = ({ visible, onCancel, onDelete, deleting }) => {
  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", marginRight: "8px" }}
          />
          Delete Election
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={deleting}
          onClick={onDelete}
        >
          Delete
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete this election?</p>
      <p>
        <strong>This action cannot be undone.</strong>
      </p>
      <p>
        All data associated with this election, including positions and
        candidate applications, will be permanently removed.
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
