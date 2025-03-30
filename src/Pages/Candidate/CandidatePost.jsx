import React from 'react';
import Post from '../../Components/Post';

const CandidatePost = () => {
  return (
    <div className="container mx-auto py-8">
      <Post readOnly={false} />
    </div>
  );
};

export default CandidatePost; 