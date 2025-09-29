import React from "react";

export default function ProfileAvatar({ name, avatarUrl, size = "w-10 h-10" }) {
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBgColor = (name) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-pink-500", "bg-indigo-500", "bg-red-500"
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name || "User"} avatar`}
        className={`${size} rounded-full object-cover border-2 border-white shadow-sm`}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full ${getBgColor(name)} flex items-center justify-center text-white font-semibold shadow-sm border-2 border-white`}
      title={name || "User"}
    >
      <span className="text-sm">{getInitials(name)}</span>
    </div>
  );
}
