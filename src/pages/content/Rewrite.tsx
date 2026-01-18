import { useAuthContext } from "@/context/AuthProvider";
import { apiFetch } from "@/util/apiFetch";
import React, { useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "katex/dist/katex.min.css";
import { Textarea } from "@/components/ui/textarea";
import { SyncLoader } from "react-spinners";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroupButton } from "@/components/ui/input-group";
import { useNavigate } from "react-router-dom";
import { useTitle } from "@/hooks/useTitle";

const Categories = [
  "rewrite",
  "expand",
  "shorten",
  "article",
  "summary",
] as const;
type CategoryType = (typeof Categories)[number];
const Rewrite: React.FC = () => {
  const navigate = useNavigate();
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [category, setCategory] = useState<CategoryType>("rewrite");
  const { user, setUser } = useAuthContext();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useTitle("Thinkora | Rewrite");
  async function generateContent() {
    const value = textInputRef.current?.value.trim();
    if (!value) return;
    if (!value || isGeneratingContent) return;
    setIsGeneratingContent(true);
    try {
      const res = await apiFetch({
        url: "/v1/content/generate",
        options: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ prompt: value, category: "shorten" }),
        },
        setState: setUser!,
      });
      textInputRef.current && (textInputRef.current.value = "");
      if (!res.ok) return;
      const { chatId } = await res.json();
      navigate(`/rewrite/${chatId}`);
    } catch (error) {
      console.log(`Error in generating content, error is ${error}`);
      setError("Error on creating content");
    } finally {
      setIsGeneratingContent(false);
    }
  }

  return (
    <div className="relative overflow-y-hidden h-screen">
      <div className="absolute left-1/2 -translate-x-1/2 top-1/4 text-3xl font-bold bg-linear-45 from-teal-50 to-pink-50 text-gray-800">
        <span className="capitalize">{category}</span> Your <br />{" "}
        <span className="text-sky-500">Content</span> by ❤️
      </div>
      <div className="flex flex-col gap-4 justify-center max-w-4xl mx-auto w-full px-10 h-[90vh]">
        <div
          style={{ scrollbarWidth: "none" }}
          className="max-h-[70vh] min-h-[20vh] overflow-y-auto px-4 message-container flex flex-col gap-4 py-4"
          ref={contentRef}
        >
          {isGeneratingContent && (
            <p className="">
              <SyncLoader color="#00bedd" size={10} />
            </p>
          )}
          {error && (
            <p className="text-xl rounded-lg w-fit px-5 text-red-500 bg-red-100 border border-red-200 text-center py-2">
              ❌ {error}
            </p>
          )}
        </div>

        <div className="relative">
          <div
            style={{ scrollbarWidth: "none" }}
            className="relative max-h-40 min-h-40  w-full resize-none rounded-4xl outline-none border-4 px-2 py-2 shadow-none bg-linear-to-l from-sky-100 to-pink-50 focus:outline-none text-gray-800 placeholder:text-gray-800 overflow-y-auto"
          >
            <Textarea
              style={{ scrollbarWidth: "none" }}
              ref={textInputRef}
              onKeyDown={(e) => {
                if (e.shiftKey && e.code === "Enter") {
                  e.preventDefault();
                  const textArea = textInputRef.current;
                  if (!textArea) return;
                  const start = textArea.selectionStart;
                  const end = textArea.selectionEnd;
                  const value = textArea.value;
                  textArea.value =
                    value.slice(0, start) + "\n" + value.slice(end);
                  textArea.selectionStart = textArea.selectionEnd = start + 1;
                  requestAnimationFrame(() => {
                    textArea.scrollTo({
                      top: textArea.scrollHeight,
                      behavior: "smooth",
                    });
                  });
                } else if (e.code === "Enter" || e.keyCode === 13) {
                  e.preventDefault();
                  generateContent();
                }
              }}
              className="max-h-26 resize-none border-none focus-visible:ring-0 rounded-4xl focus:outline-none text-gray-800 placeholder:text-gray-800 shadow-none"
              placeholder="Ask, Search or Chat..."
              rows={1}
            />
          </div>
          <div className="absolute -bottom-5 rounded-b-4xl py-2 bg-linear-to-l from-sky-100 to-pink-50 left-1/2 -translate-1/2 max-sm:w-[88%] w-[95%] flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-lg bg-black text-white"
                asChild
              >
                <InputGroupButton className="press">
                  {category}
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="[--radius:0.95rem] bg-black text-white"
              >
                {Categories.map((category) => (
                  <DropdownMenuItem
                    onClick={() => setCategory(category)}
                    key={category}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={generateContent}
              className=" press p-2 rounded-full gradient-primary"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewrite;
