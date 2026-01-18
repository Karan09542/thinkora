import { cn } from "@/lib/utils";
import React from "react";
import { RxCross2 } from "react-icons/rx";

interface CloseBtnProps {
  onClick?: () => void;
  className?: string;
}
const CloseBtn: React.FC<CloseBtnProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn("press bg-white p-1.5 rounded-full", className)}
    >
      <RxCross2 />
    </button>
  );
};

export default CloseBtn;
