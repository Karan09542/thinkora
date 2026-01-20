import React, { useEffect, useState } from "react";
import { FaCircleArrowRight } from "react-icons/fa6";
import { CgArrowTopRight, CgSpinner } from "react-icons/cg";
import { GoHistory } from "react-icons/go";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { apiFetch } from "@/util/apiFetch";
import { useAuthContext } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import { TextShimmer } from "@/motion-primitives/text-shimmer";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { useTitle } from "@/hooks/useTitle";
import { useSidebarContext } from "@/context/SidebarProvider";
import CloseBtn from "@/components/button/CloseBtn";
import { RiBarChartHorizontalLine } from "react-icons/ri";
import { FcDownload } from "react-icons/fc";
import { downloadImage } from "@/util";
import { FadeLoader } from "react-spinners";

const Image_Resolution = [
  {
    label: "1024x1024",
  },
  {
    label: "1024x768",
  },
  {
    label: "768x1024",
  },
  {
    label: "1280x720",
  },
];

const Tiles: React.FC<{
  link: string;
  text: string;
  onClick?: () => void;
  onDelete?: () => void;
  active: boolean;
}> = ({ link, text, onClick, active, onDelete }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative cursor-pointer transition-all duration-200 bg-gray-100 font-extralight py-2 px-3 rounded-xl",
      active && "bg-gray-800 text-white",
    )}
  >
    <div className="flex items-start gap-1">
      <img
        onContextMenu={(e) => e.preventDefault()}
        className="w-10 rounded-xl p-1 border-3 border-gray-200"
        src={link}
      />{" "}
      <p className="truncate">{text.substring(0, 100)}</p>
    </div>
    <button
      onClick={onDelete}
      className={cn(
        "absolute press -right-1.5 -top-1.5 bg-gray-200 border-3 text-gray-800 border-white press  p-1 rounded-xl",
        active && "bg-gray-800 text-white",
      )}
    >
      <MdDelete />
    </button>
  </div>
);

type History = {
  _id: string;
  prompt: string;
  urls: string[];
};

const ImageGenerate: React.FC = () => {
  const { user, setUser } = useAuthContext();
  const { isSmallView, toggleSidebar } = useSidebarContext();
  const [resolution, setResolution] = useState("1024x1024");
  const [text, setText] = useState("");

  const [isSubmiting, setIsSubmiting] = useState(false);
  const [historyFetching, setHistoryFetching] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  const [urls, setUrls] = useState<string[]>([]);
  const [imageRange, setImageRange] = useState(1);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<History[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [openRightPanel, setOpenRightPanel] = useState(false);

  useTitle("Thinkora | Image");
  async function fetchingImage(id: string) {
    if (isFetchingImage) return;
    setIsFetchingImage(true);
    try {
      const res = await apiFetch({
        url: `/v1/image/history/${id}`,
        options: {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
        setState: setUser,
      });

      if (!res.ok) {
        toast.error("Error in fetching images");
        return;
      }
      const data = await res.json();

      if (data.urls && Array.isArray(data.urls)) setUrls(data.urls);
    } catch (error) {
      console.log(`Error in fetching image history, error is ${error}`);
    } finally {
      setIsFetchingImage(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchHistory() {
      setHistoryFetching(true);
      try {
        const res = await apiFetch({
          url: `/v1/image/history?imageFreq=1&page=${page}&limit=8`,
          options: {
            headers: { Authorization: `Bearer ${user?.token}` },
            signal,
          },
          setState: setUser,
        });
        if (!res.ok) return;
        const { images } = await res.json();
        if (!Array.isArray(images) && images.length === 0) return;
        setHistory((prev) => (page === 1 ? images : [...prev, ...images]));
      } catch (error) {
        console.log(`Error in fetching image history, error is ${error}`);
      } finally {
        setHistoryFetching(false);
      }
    }
    fetchHistory();
    () => {
      controller.abort();
    };
  }, [page]);

  async function handleDeleteImage(id: string) {
    try {
      const res = await apiFetch({
        url: `/v1/image/${id}`,
        options: {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
        setState: setUser,
      });

      if (!res.ok || res.status !== 204) {
        toast.error("Error in fetching images");
        return;
      }
      setHistory(history.filter((item) => item._id !== id));
      toast.success("Image Deleted successfully");
    } catch (error) {
      toast.error("Image deletion is unsuccessful");
    }
  }
  const onSubmit = async () => {
    setUrls([]);
    if (isSubmiting) return;
    if (!text.trim()) return;
    setIsSubmiting(true);
    try {
      const res = await apiFetch({
        url: "/v1/image/generate",
        options: {
          headers: { Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({
            prompt: text,
            resolution,
            frequency: imageRange,
          }),
        },
        setState: setUser,
      });
      if (!res.ok) return;
      const data = await res.json();
      setUrls(data.urls);
      setHistory((prev) => [
        { urls: data.urls, prompt: text, _id: data._id },
        ...prev,
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmiting(false);
    }
  };
  const ZoomComponent: React.FC<{ url: string }> = ({ url }) => {
    const id = crypto.randomUUID();
    const [isZoomed, setIsZoomed] = useState(false);
    return (
      <>
        {isZoomed && (
          <div
            onClick={() => setIsZoomed(false)}
            className="fixed grid h-full top-0 left-0 right-0 bg-black/60 backdrop-blur-xs z-50"
          >
            <style>
              {`
                @starting-style {
                    #${id} {
                      opacity:0;
                    }
                }

              `}
            </style>
            <img
              id={id}
              style={{
                position: "relative",
                anchorName: `--image-${id + 1}`,
              }}
              className={cn(
                "m-auto  rounded-xl transition-all duration-300 ease-in-out h-[80vh]",
                isSmallView && "w-[90vw] h-auto",
              )}
              src={url}
              onContextMenu={(e) => e.preventDefault()}
            />
            <button
              onClick={() => downloadImage(url)}
              style={{
                positionAnchor: `--image-${id + 1}`,
                position: "absolute",
                right: "calc(anchor(right) + 10px)",
                top: "calc(anchor(top) + 20px)",
              }}
              className="press [&_g]:fill-white bg-pink-500  p-1.5 rounded-full"
            >
              <FcDownload size={21} />
            </button>
          </div>
        )}
        <img
          style={{
            position: isZoomed ? "fixed" : "relative",
            anchorName: `--image-${id}`,
          }}
          className={cn("object-contain h-full @max-[350px]:h-auto")}
          src={url}
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => setIsZoomed(true)}
        />
        <button
          onClick={() => downloadImage(url)}
          style={{
            positionAnchor: `--image-${id}`,
            position: "absolute",
            right: "calc(anchor(right) + 10px)",
            top: "calc(anchor(top) + 20px)",
          }}
          className="press [&_g]:fill-white bg-pink-500 p-1.5 rounded-full"
        >
          <FcDownload size={21} />
        </button>
      </>
    );
  };
  return (
    <div className="bg-linear-45 from-teal-50 to-pink-50">
      <section className="flex gap-2 h-screen">
        <Sidebar />
        <main
          className={cn(
            "flex-1 bg-white flex flex-col gap-0 min-h-0 shadow-xl m-5 rounded-xl",
            !isSmallView && "px-5 py-2",
            isSmallView && "m-0 rounded-none *:not-[nav]:px-5 *:not-[nav]:py-2",
          )}
        >
          {isSmallView && (
            <div className="backdrop-blur-2xl border-b-6 border-pink-300/30 px-2 py-5  w-full top-0 z-20 flex items-center justify-between shadow-2xl shadow-pink-500/10">
              <RiBarChartHorizontalLine
                onClick={toggleSidebar}
                className="press"
                size={24}
              />
              <button
                onClick={() => setOpenRightPanel((prev) => !prev)}
                className="press flex items-center gap-1 text-sm bg-pink-500 px-2 py-1 rounded-full font-medium text-white"
              >
                <GoHistory />
                <p>History</p>
              </button>
            </div>
          )}

          {/* head */}
          <div className="flex justify-between items-center">
            {!isSmallView && (
              <Link
                to="/image/history"
                className="font-semibold press text-sky-500 flex border-b-sky-500 hover:border-b-2"
              >
                History <CgArrowTopRight />
              </Link>
            )}
          </div>
          {/* middle */}
          <div
            className={cn(
              " bg-white shadow-xl p-4 rounded-xl flex-1 flex flex-col min-h-0 gap-y-2",
              isSmallView && "mx-4",
            )}
          >
            {/* generated images */}
            <div
              style={{ scrollbarWidth: "none" }}
              className={cn(
                "flex-1 bg-black/10 bg-linear-45 from-sky-100 to-pink-50 flex items-center [&>img]:rounded-xl px-3 gap-3 min-h-0 overflow-y-auto relative rounded-xl text-3xl text-gray-400 py-4 transition-all @container",
                urls.length <= 1 && "justify-center",
              )}
            >
              {urls.length > 0 &&
                !isSubmiting &&
                urls.map((url, i) => (
                  <ZoomComponent url={url} key={`image-${i}`} />
                ))}
              {urls.length === 0 && !isSubmiting && <p>Generate Image</p>}
              {isSubmiting && (
                <TextShimmer className="text-3xl" spread={4} duration={1}>
                  Generating code...
                </TextShimmer>
              )}
            </div>
          </div>
          {/* foot */}
          <div>
            {/* regenerate */}
            <div className="flex justify-between items-center gap-3 pb-2">
              <div className="flex items-center gap-5">
                <div>
                  <p className="my-2">Image Resolution</p>
                  <Select
                    value={resolution}
                    onValueChange={(value) => setResolution(value)}
                  >
                    <SelectTrigger className="rounded-xl border-3 border-sky-500 hover:**:bg-transparent  **:text-sky-500">
                      <SelectValue placeholder="Select Image Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-black text-white">
                      {Image_Resolution.map(({ label }) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={label}
                          value={label}
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="self-end flex flex-col">
                  <label>Number of images</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    className="image-range accent-sky-500"
                    value={imageRange}
                    onInput={(e: React.FormEvent<HTMLInputElement>) =>
                      setImageRange(Number(e.currentTarget.value))
                    }
                  />
                  <p className="image-range-label bg-blue-400 text-white px-3 py-1 rounded-xl border">
                    {imageRange}
                  </p>
                </div>
              </div>
              {/* <button className="press flex items-center justify-between gap-2 mb-4 text-sky-500 text-sm font-semibold mt-3">
                <ImLoop2 />
                <p>Regenerate response</p>
              </button> */}
            </div>
            {/* input box */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ scrollbarWidth: "none" }}
                placeholder="generate Image"
                className={cn(
                  "w-full bg-gray-200 rounded-4xl text-black placeholder:text-black/60 py-3.5 px-4 pr-12 h-14 min-h-14 outline-none focus:ring-sky-500 transition-all",
                  isSmallView && "h-20 focus:h-28",
                )}
                rows={40}
              />
              <button
                onClick={onSubmit}
                className="press absolute bg-white right-3 bottom-3 border-3 px-2.5 py-2 border-sky-500 rounded-full gradient-primary"
              >
                <FaCircleArrowRight />
              </button>
            </div>
          </div>
        </main>
        {/* right */}
        <div
          style={{ scrollbarWidth: "none" }}
          className={cn(
            "bg-white rounded-xl shadow-md *:px-4 w-full max-w-80 m-5 overflow-y-auto transition-all app-scroll",
            isSmallView && "fixed h-[90vh] z-20",
            openRightPanel ? "right-0" : "-right-100",
          )}
        >
          <div className="flex items-center justify-between text-xl sticky top-0 z-10 w-full bg-white py-2">
            <p className="flex gap-1 items-center">
              Content
              {isSmallView && (
                <Link
                  to="/image/history"
                  className="font-semibold press text-sky-500 flex"
                >
                  History <CgArrowTopRight />
                </Link>
              )}
            </p>
            {isSmallView && (
              <CloseBtn
                onClick={() => setOpenRightPanel(false)}
                className="bg-gray-800 text-white"
              />
            )}
          </div>
          {page === 1 && (
            <FadeLoader
              loading={historyFetching}
              radius={80}
              color="#38BDF8"
              className="mx-auto scale-75"
            />
          )}
          {!historyFetching && history.length === 0 && (
            <p className="text-center">No History</p>
          )}
          {
            <div className="flex flex-col gap-2 h-full">
              <div className="space-y-3 mt-3 mb-auto">
                {history.length > 0 &&
                  history.map((item, i) => (
                    <Tiles
                      key={item._id}
                      text={item.prompt}
                      link={item.urls[0]}
                      active={activeIndex === i}
                      onClick={() => {
                        fetchingImage(item._id);
                        if (activeIndex === i) {
                          setActiveIndex(null);
                        } else {
                          setActiveIndex(i);
                        }
                        if (isSmallView) {
                          setOpenRightPanel(false);
                        }
                      }}
                      onDelete={() => handleDeleteImage(item._id)}
                    />
                  ))}
              </div>

              {history.length > 0 && (
                <div>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="mb-5 hover:scale-105 flex items-center gap-1 gradient-primary text-white mx-auto px-2 py-1 rounded-full text-xs press"
                  >
                    {historyFetching && <CgSpinner className="animate-spin" />}{" "}
                    load more
                  </button>
                </div>
              )}
            </div>
          }
        </div>
      </section>
    </div>
  );
};

export default ImageGenerate;
