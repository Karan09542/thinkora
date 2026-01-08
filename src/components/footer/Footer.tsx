import { cn } from "@/lib/utils";
import React from "react";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  className?: string;
  style?: React.CSSProperties;
}
const Footer: React.FC<FooterProps> = ({ className, style }) => {
  const navigate = useNavigate();
  return (
    <div
      style={style}
      className={cn(
        "bg-black mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4",
        className
      )}
    >
      {/* Left */}
      <div className="text-sm">
        <span className="font-medium text-ray-700">Thinkora</span> — AI for
        content & images
      </div>

      {/* Center Links */}
      <div className="flex items-center gap-6 text-sm">
        <button
          onClick={() => navigate("/rewrite")}
          className="hover:text-gray-500 transition"
        >
          Rewrite
        </button>
        <button
          onClick={() => navigate("/image/generate")}
          className="hover:text-gray-500 transition"
        >
          Image
        </button>
        <button
          onClick={() => navigate("/")}
          className="hover:text-gray-500 transition"
        >
          Home
        </button>
      </div>

      {/* Right */}
      <div className="text-sm">
        © {new Date().getFullYear()} Thinkora
      </div>
    </div>
  );
};

export default Footer;
