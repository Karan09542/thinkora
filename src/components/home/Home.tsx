import { useSidebarContext } from "@/context/SidebarProvider";
import { useTitle } from "@/hooks/useTitle";
import { cn } from "@/lib/utils";
import React from "react";
import { MdOutlineEditNote, MdOutlineImage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
  const { isSmallView } = useSidebarContext();
  useTitle("Thinkora");
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6  max-sm:mb-20">
      {/* Hero */}
      <h1 className={cn("text-4xl md:text-5xl font-semibold text-gray-800 mb-4", isSmallView && "pt-20 text-center")}>
        Generate Content with <span className="text-sky-500">Thinkora</span>
      </h1>

      <p className="text-gray-500 text-center max-w-xl mb-12">
        Create high-quality written content or generate stunning AI images — all
        from one place.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Content Generation */}
        <div
          onClick={() => navigate("/rewrite")}
          className="cursor-pointer group rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
              <MdOutlineEditNote size={28} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Content & Rewrite
            </h2>
          </div>

          <p className="text-gray-500 mb-6">
            Rewrite text, generate explanations, ideas, answers, and more using
            AI.
          </p>

          <button className="text-sky-600 font-medium group-hover:underline">
            Start Writing →
          </button>
        </div>

        {/* Image Generation */}
        <div
          onClick={() => navigate("/image/generate")}
          className="cursor-pointer group rounded-2xl p-6 bg-white shadow-md hover:shadow-xl transition-all border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <MdOutlineImage size={26} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Image Generation
            </h2>
          </div>

          <p className="text-gray-500 mb-6">
            Turn your imagination into images with AI-powered image generation.
          </p>

          <button className="text-purple-600 font-medium group-hover:underline">
            Generate Image →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
