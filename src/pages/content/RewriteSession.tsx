import { useAuthContext } from "@/context/AuthProvider";
import { apiFetch } from "@/util/apiFetch";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
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
import { useParams } from "react-router-dom";

type Content = {
  role: "user" | "ai";
  text: string;
  _id: string;
};
const Categories = ["rewrite", "expand", "shorten", "article"];
type CategoryType = (typeof Categories)[number];

const RewriteSession: React.FC = () => {
  const params = useParams();
  const chatSessionId = params.chatSessionId;
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [category, setCategory] = useState<CategoryType>("rewrite");
  const {user, setUser} = useAuthContext();
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isScrollBtnVisible, setIsScrollBtnVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  function scrollToBotton() {
    const content = contentRef.current;
    if (!content) return;
    if (content.scrollTop + content.offsetHeight < content.scrollHeight) {
      content.scrollTo({
        top: content.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  async function generateContent() {
    const value = textInputRef.current?.value.trim();
    if (!value) return;
    if (!value || isGeneratingContent || !chatSessionId?.trim()) return;
    setIsGeneratingContent(true);
    scrollToBotton();
    setContents((prev) => [
      ...prev,
      { role: "user", text: value, _id: crypto.randomUUID() },
    ]);
    try {
      const res = await apiFetch({
        url: `/v1/content/generate/${chatSessionId}`,
        options: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ prompt: value, category }),
        },
        setState: setUser,
      });
      textInputRef.current && (textInputRef.current.value = "");
      if (!res.ok) return;
      const data = await res.json();
      const { content } = data;
      if (!content?.trim()) return;
      setContents((prev) => [
        ...prev,
        { role: "ai", text: content, _id: crypto.randomUUID() },
      ]);
    } catch (error) {
      console.log(`Error in generating content, error is ${error}`);
    } finally {
      setIsGeneratingContent(false);
    }
  }

  useEffect(() => {
    async function fetchChatSession() {
      try {
        const res = await apiFetch({
          url: `/v1/content/chat-sessions/${chatSessionId}`,
          options: {
            headers: {
              authorization: `Bearer ${user?.token}`,
            },
          },
          setState: setUser,
        });
        if (!res.ok) return;
        const { chatSession } = (await res.json()) as {
          chatSession: {
            content: string;
            prompt: string;
          }[];
        };
        const formatContent = chatSession.flatMap((item) => [
          {
            _id: crypto.randomUUID(),
            text: item.prompt,
            role: "user" as const,
          },
          { _id: crypto.randomUUID(), text: item.content, role: "ai" as const },
        ]);

        if (chatSession && Array.isArray(chatSession)) {
          setContents((prev) =>
            page === 1 ? formatContent : [...prev, ...formatContent]
          );
        }
      } catch (error) {
        console.log(`Error in fetching chat session`);
      }
    }
    fetchChatSession();
  }, [chatSessionId, page]);
  // initial scroll into view
  useEffect(() => {
    const content = contentRef.current;
    if (!content || !chatSessionId) return;
    function handleScroll(_e: Event) {
      if (!content) return;
      const isBottom =
        content.scrollTop + content.offsetHeight + 100 < content.scrollHeight;
      setIsScrollBtnVisible(isBottom);
    }
    content.addEventListener("scroll", handleScroll);
    return () => content.removeEventListener("scroll", handleScroll);
  }, []);
  // scroll into view when contents changes
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });
  }, [contents]);

  return (
    <div className="relative overflow-y-hidden">
      <h1 className="absolute indent-10 top-0 text-3xl font-bold bg-linear-45 from-teal-50 to-pink-50  ">
        Rewrite
      </h1>
      <div className="flex flex-col gap-4 justify-center max-w-4xl mx-auto w-full px-10 h-screen">
        {contents.length > 0 && (
          <div
            style={{ scrollbarWidth: "none" }}
            className="max-h-[70vh] min-h-[70vh] overflow-y-auto px-4 message-container flex flex-col gap-4 py-4"
            ref={contentRef}
          >
            {contents.map((content, i) => (
              <div
                key={`${content.role}-${i}`}
                className={cn(
                  `${content.role}`,

                  content.role === "user" &&
                    "self-end bg-sky-600 px-3 py-2 text-white rounded-lg max-w-[80%]",
                  content.role === "ai" &&
                    "self-start px-4 py-2 rounded-tl-2xl rounded-br-2xl"
                )}
              >
                {content.role === "ai" ? (
                  <Markdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {content.text}
                  </Markdown>
                ) : (
                  content.text
                )}
              </div>
            ))}
            {isGeneratingContent && (
              <p className="py-10">
                <SyncLoader color="#00bedd" size={10} />
              </p>
            )}
          </div>
        )}
        <div className="relative">
          {isScrollBtnVisible && (
            <button
              onClick={scrollToBotton}
              className="absolute press right-3 -top-16 bg-sky-400 p-2 rounded-lg text-white"
            >
              <FaArrowDown />
            </button>
          )}
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

export default RewriteSession;
