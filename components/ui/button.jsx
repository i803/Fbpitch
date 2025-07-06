// components/ui/button.jsx
import React from "react";

export function Button({ children, onClick, className = "", type = "button", disabled = false, ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 bg-black text-white rounded 
        hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
