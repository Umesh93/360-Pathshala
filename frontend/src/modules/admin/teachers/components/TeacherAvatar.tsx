import React from "react";

interface TeacherAvatarProps {
  firstName: string;
  lastName: string;
  photo?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
};

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  firstName,
  lastName,
  photo,
  size = "md",
}) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#234A91] text-white flex items-center justify-center font-medium`}
    >
      {initials}
    </div>
  );
};

export default TeacherAvatar;
