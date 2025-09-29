import React from "react";
import profilePic from "../assets/profile.jpg";

export default function ProfileAvatar({ name, avatarUrl }) {
  const src = avatarUrl || profilePic;
  
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}
