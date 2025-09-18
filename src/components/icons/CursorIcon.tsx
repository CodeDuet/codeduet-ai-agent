import React from "react";

interface CursorIconProps {
  size?: number;
  className?: string;
}

export const CursorIcon: React.FC<CursorIconProps> = ({ size = 16, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      {/* Modern cursor pointer design */}
      <path 
        d="M3 3L9 21L12 12L21 9L3 3Z" 
        fill="currentColor"
        stroke="currentColor" 
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};