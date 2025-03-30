import React from 'react';
import DashboardHeader from '../../components/admin/DashboardHeader';
import ElectionForm from '../../Components/admin/ElectionForm';

const CreateElections = () => {
  return (
    <div className="p-6">
      <DashboardHeader title="Create New Election" />
      <ElectionForm />
    </div>
  );
};

export default CreateElections;
