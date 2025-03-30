import React from "react";
import Post from "../../Components/Post";

function UserCandidates() {
  return (
    <div className="flex flex-col w-full">
      <Post readOnly={true} />
    </div>
  );
}

export default UserCandidates; 