import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from  "@/lib/utils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
interface TextInputProps {
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  type?: string;
}
const TextInput: React.FC<TextInputProps> = ({
  register,
  error,
  placeholder = "",
  type = "text",
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <div className="relative">
        <input
          {...register}
          className={cn(
            "w-full bg-white border-2 border-blue-100 p-2 rounded-xl placeholder:text-black/50 focus:border-transparent focus:ring-4 focus:ring-violet-500 focus:outline-none transition-all duration-300",
            error && "ring-4 ring-red-500 focus:ring-red-500"
          )}
          placeholder={placeholder}
          type={type === "password" ? (show ? "text" : "password") : type}
        />
        {type === "password" && (
          <button
            onClick={() => setShow(!show)}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {show ? <FaEye /> : <FaEyeSlash />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm my-1 px-1">{error}</p>}
    </div>
  );
};

export default TextInput;
