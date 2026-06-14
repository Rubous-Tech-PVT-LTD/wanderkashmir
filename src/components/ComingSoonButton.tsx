"use client";

import toast from "react-hot-toast";

interface ComingSoonButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function ComingSoonButton({ children, className }: ComingSoonButtonProps) {
  return (
    <button 
      onClick={() => toast("🚧 This feature will be coming soon", { duration: 3000 })}
      className={className}
    >
      {children}
    </button>
  );
}
