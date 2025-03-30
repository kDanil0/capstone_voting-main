import React from 'react';
import Post from '../Components/Post';

const Posts = () => {
  return (
    <div className="container mx-auto py-8">
      <Post readOnly={true} />
    </div>
  );
};

export default Posts; 