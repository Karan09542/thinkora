import { useAuthContext } from "@/context/AuthProvider";
import { useSidebarContext } from "@/context/SidebarProvider";
import { useTitle } from "@/hooks/useTitle";
import { cn } from "@/lib/utils";
import { downloadImage } from "@/util";
import { apiFetch } from "@/util/apiFetch";
import React, { useEffect, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { FcDownload } from "react-icons/fc";
import { toast } from "react-toastify";

type ImageHistory = {
  _id: string;
  urls: string[];
  createdAt: string;
  prompt: string;
};

const HistoryCard: React.FC<Omit<ImageHistory, "_id">> = ({
  prompt,
  urls,
  createdAt,
}) => {
  const [index, setIndex] = useState(0);
  const [more, setMore] = useState(false);
  const prev = () => setIndex((prev) => (urls.length - prev) % urls.length);
  const next = () => setIndex((prev) => (prev + 1) % urls.length);

  return (
    <div
      className={cn(
        "bg-white border border-gray-100 shadow-xl w-70 max-[480px]:w-[90%] rounded-xl hover:scale-105 hover:translate-y-2 transition-all flex flex-col",
      )}
    >
      <div className="group relative">
        <img
          className="rounded-t-xl hover:brightness-50 group-hover:blur-in duration-300 p-1 select-none w-full"
          src={urls[index]}
          onContextMenu={(e) => e.preventDefault()}
        />
        {urls.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 gradient-primary border-2 border-white p-2 rounded-full press group-hover:opacity-100 max-sm:opacity-100 opacity-0 duration-300 transition-opacity"
          >
            <FaArrowLeft />
          </button>
        )}
        {urls.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2  gradient-primary border-2 border-white p-2 rounded-full press group-hover:opacity-100 max-sm:opacity-100 opacity-0 duration-300 transition-opacity"
          >
            <FaArrowRight />
          </button>
        )}
      </div>
      <div className="text-sm p-3 rounded-b-5xl">
        <div className="flex justify-between">
          <p>
            {new Date(createdAt).toLocaleString(["en-US"], {
              dateStyle: "medium",
            })}
          </p>
          <button
            onClick={() => downloadImage(urls[index])}
            className="hover:scale-105 press border border-gray-200 py-1.5 px-2.5 rounded-full active:scale-90"
          >
            <FcDownload />
          </button>
        </div>
        <p className={cn(!more && prompt.length > 40 && "truncate")}>
          {prompt.substring(0, 50)}
        </p>
      </div>
      {prompt.length > 40 && (
        <button
          onClick={() => setMore((prev) => !prev)}
          className="mt-auto w-fit mx-3 mb-2 bg-black text-white text-xs py-1 px-3 rounded-full"
        >
          {more ? "less" : "more"}
        </button>
      )}
    </div>
  );
};
const ImageHistory: React.FC = () => {
  const { user, setUser } = useAuthContext();
  const { isSmallView } = useSidebarContext();
  const [history, setHistory] = useState<Record<string, ImageHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);

  async function fetchGeneratedImages({
    setLoading,
  }: {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  }) {
    setLoading(true);
    try {
      const res = await apiFetch({
        url: `/v1/image/history?page=${page}&limit=${20}`,
        options: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
        setState: setUser,
      });
      if (!res.ok) return;
      const { images } = await res.json();
      if (!images || !Array.isArray(images) || images.length === 0) return;

      const imagesGroupByDate = images.reduce(
        (acc: Record<string, ImageHistory[]>, item: ImageHistory) => {
          const date = item.createdAt.split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(item);
          return acc;
        },
        {},
      );

      setHistory(imagesGroupByDate);
    } catch (error) {
      console.log(`Error in fetching Image History, error is ${error}`);
      toast.error(`Error in fetching Image History`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGeneratedImages({
      setLoading: page > 1 ? setIsFetchingMore : setLoading,
    });
  }, [page]);
  useTitle("Image History");
  if (loading) {
    return <div className="h-screen p-2 text-lg">Loading...</div>;
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col flex-wrap gap-5 justify-center px-10 max-[480px]:px-2 pt-3 pb-6 h-screen",
        isSmallView && "pt-14",
        Object.keys(history).length === 0 && "justify-normal",
      )}
    >
      <h1 className="text-3xl font-sans gradient-primary text-transparent bg-clip-text font-bold">
        Image History
      </h1>
      <hr className="border-2 border-white" />
      {Object.keys(history).length === 0 && (
        <div className="text-center">
          <h1 className="text-2xl">No History Found</h1>
        </div>
      )}
      {Object.keys(history).map((date) => (
        <div key={date}>
          <h1 className="mb-2 px-1 text-xl">
            {date === new Date().toISOString().split("T")[0] ? "Recent" : date}
          </h1>
          <div
            className={cn(
              "flex flex-wrap gap-4",
              isSmallView && "justify-center",
            )}
          >
            {history[date].map((item) => (
              <HistoryCard key={item._id} {...item} />
            ))}
          </div>
        </div>
      ))}
      {/* load more */}
      {Object.keys(history).length > 0 && (
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="mb-5 hover:scale-105 flex items-center gap-1 gradient-primary text-white mx-auto px-2 py-1 rounded-full text-xs press"
        >
          {isFetchingMore && <CgSpinner className="animate-spin" />} load more
        </button>
      )}
    </div>
  );
};

export default ImageHistory;
