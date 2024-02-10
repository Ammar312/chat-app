import React from "react";
import UserProfile from "../components/UserProfile";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div>
      <Link to={`/home`}>Home</Link>
      <UserProfile />
    </div>
  );
};

export default Profile;
