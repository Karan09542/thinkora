import { useAuthContext } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/util/apiFetch";
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { FcDownload } from "react-icons/fc";

type ImageHistory = {
  _id: string;
  urls: string[];
  createdAt: string;
  prompt: string;
};

const HistoryCard: React.FC<ImageHistory> = ({
  _id,
  prompt,
  urls,
  createdAt,
}) => {
  const [index, setIndex] = useState(0);
  const [more, setMore] = useState(false);
  const prev = () => setIndex((prev) => (urls.length - prev) % urls.length);
  const next = () => setIndex((prev) => (prev + 1) % urls.length);

  async function downloadImage() {
    const url = urls[index];
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${crypto.randomUUID()}.${blob?.type.split("/").at(-1)}`;
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }
  return (
    <div
      className={cn(
        "bg-white border border-gray-100 shadow-xl rounded-xl w-70 hover:scale-105 hover:translate-y-2 transition-all flex flex-col"
      )}
    >
      <div className="group relative">
        <img
          className="rounded-t-xl hover:brightness-50 group-hover:blur-in duration-300 p-1 select-none"
          src={urls[index]}
          onContextMenu={(e) => e.preventDefault()}
        />
        {urls.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 gradient-primary border-2 border-white p-2 rounded-full press group-hover:opacity-100 opacity-0 duration-300 transition-opacity"
          >
            <FaArrowLeft />
          </button>
        )}
        {urls.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 top-1/2  gradient-primary border-2 border-white p-2 rounded-full press group-hover:opacity-100 opacity-0 duration-300 transition-opacity"
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
            onClick={downloadImage}
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
  const { user, setUser } = useAuthContext()!;
  const [history, setHistory] = useState<Record<string, ImageHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchGeneratedImages() {
      try {
        const res = await apiFetch({
          url: `/v1/image/history?page=${1}&limit=${20}`,
          options: {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
            signal,
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
          {}
        );

        setHistory(imagesGroupByDate);
      } catch (error) {
        console.log(`Error in fetching Image History, error is ${error}`);
      } finally {
        setLoading(false);
      }
    }
    fetchGeneratedImages();
    () => controller.abort();
  }, []);
  if (loading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="flex flex-col flex-wrap gap-5 justify-center px-10 pt-3 pb-6">
      <h1 className="text-3xl font-sans gradient-primary text-transparent bg-clip-text font-bold">
        Image History
      </h1>
      <hr className="border-2 border-white" />
      {Object.keys(history).map((date) => (
        <div>
          <h1 className="mb-2 px-1 text-xl">
            {date === new Date().toISOString().split("T")[0] ? "Recent" : date}
          </h1>
          <div className="flex flex-wrap gap-4">
            {history[date].map((item) => (
              <HistoryCard key={item._id} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageHistory;
