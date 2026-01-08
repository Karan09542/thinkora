import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { TbFileTextSpark, TbHome } from "react-icons/tb";
import { RiImageAiLine } from "react-icons/ri";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "@/util/apiFetch";
import { useAuthContext } from "@/context/AuthProvider";
import { CgSpinner } from "react-icons/cg";
import { userSidebarContext } from "@/context/SidebarProvider";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";

interface SidebarProps {
  className?: string;
  style?: React.CSSProperties;
}

type ChatSession = {
  _id: string;
  title: string;
};
const isRewrite = (pathname: string) =>
  /^\/(rewrite|rewrite\/w+)/.test(pathname);
const Sidebar: React.FC<SidebarProps> = ({ className, style }) => {
  const { user, setUser, logout } = useAuthContext();
  const { expandSidebar, setExpandSidebar } = userSidebarContext();
  const navigate = useNavigate();
  const NavItems = [
    {
      name: "homepage",
      link: "/",
      Icon: TbHome,
    },
    {
      name: "rewrite",
      link: "/rewrite",
      Icon: TbFileTextSpark,
    },
    {
      name: "image",
      link: "/image/generate",
      Icon: RiImageAiLine,
    },
  ];

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingChatSession, setIsLoadingChatSession] = useState(false);
  const [page, setPage] = useState(1);
  const { pathname } = useLocation();

  useEffect(() => {
    async function fetchChatSession() {
      setIsLoadingChatSession(true);
      try {
        const res = await apiFetch({
          url: `/v1/content/chat-sessions/?page=${page}&limit={10}`,
          options: {
            headers: {
              authorization: `Bearer ${user?.token}`,
            },
          },
          setState: setUser,
        });

        if (!res.ok) return;
        const { chatSessions } = await res.json();
        if (!chatSessions || !Array.isArray(chatSessions)) return;
        setChatSessions((prev) =>
          page === 1 ? chatSessions : [...prev, ...chatSessions]
        );
      } catch (error) {
        console.log(`Error in fetching chat session, error is ${error}`);
      } finally {
        setIsLoadingChatSession(false);
      }
    }
    if (isRewrite(pathname)) {
      fetchChatSession();
    }
  }, [pathname, page]);

  async function handleDeleteChatSession(id: string) {
    try {
      const res = await apiFetch({
        url: `/v1/content/chat-sessions/${id}`,
        options: {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${user?.token}`,
          },
        },
        setState: setUser,
      });
      if (!res.ok || res.status !== 204) {
        toast.error("Session deletion is unsuccessful");
        return;
      }
      toast.success("Deletion successful");
      navigate("/rewrite");
    } catch (error) {
      toast.error(`Error on deleting chat session`);
    }
  }
  return (
    <aside
      style={style}
      className={cn(
        "flex flex-col bg-white border-r h-full shadow-sm not-[seperator]:*:px-4 py-4 transition-all border-2 border-white z-10 bg-linear-to-b from-sky-100 to-pink-50",
        expandSidebar ? "min-w-64 max-w-64" : "min-w-20 max-w-20",
        className
      )}
    >
      {/* logo */}
      <div className="relative py-2 mb-10">
        <div className="text-xl font-semibold ">
          <Link to="/" className="flex items-center gap-2">
            <img src="/app1.png" className="w-12" />
            {expandSidebar && <p>Thinkora</p>}
          </Link>
        </div>
        <button
          onClick={() => setExpandSidebar((prev) => !prev)}
          className="absolute press top-4 -right-3.5 border border-gray-300 bg-white p-2 rounded-full "
        >
          {expandSidebar ? (
            <SlArrowLeft size={10} />
          ) : (
            <SlArrowRight size={10} />
          )}
        </button>
      </div>
      <div className="space-y-8">
        {/* section */}
        <section
          className={cn(
            "flex flex-col space-y-6",
            !expandSidebar && "items-center"
          )}
        >
          <p className={cn("font-semibold")}>General</p>
          <div className="flex flex-col gap-y-7 *:text-gray-800/80">
            {NavItems.map(({ link, name, Icon }) => (
              <NavLink
                key={link}
                to={link}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-full",
                    expandSidebar && "py-2 px-3",
                    isActive && "gradient-primary"
                  )
                }
              >
                <Icon size={24} />
                {expandSidebar && <p>{name}</p>}
              </NavLink>
            ))}
          </div>
        </section>
        {/* chat - section */}
        {expandSidebar && (
          <section
            className={cn(
              "flex flex-col space-y-6 overflow-y-auto",
              !expandSidebar && "items-center"
            )}
          >
            {isRewrite(pathname) && (
              <p className={cn("font-semibold")}>Your Chat</p>
            )}
            {expandSidebar && (
              <div
                style={{ scrollbarWidth: "none" }}
                className="text-sm space-y-3  overflow-y-auto"
              >
                {isRewrite("rewrite") && (
                  <button
                    onClick={() => navigate("/rewrite")}
                    className="press hover:border-b-2 border-sky-400"
                  >
                    New Chat
                  </button>
                )}
                {chatSessions.map(({ _id, title }) => (
                  <div
                    className={cn(
                      "cursor-pointer flex items-center justify-between gap-4 w-full bg-sky-950 px-2 py-2 truncate rounded-xl text-white",
                      _id === pathname.split("/").at(-1) && "bg-black"
                    )}
                    onClick={() => navigate(`/rewrite/${_id}`)}
                    key={_id}
                  >
                    <p className="max-w-[80%] truncate">{title}</p>
                    <button
                      onClick={() => {
                        handleDeleteChatSession(_id);
                      }}
                      className="press hover:bg-sky-100 p-1 rounded-full"
                    >
                      <MdDelete className="text-rose-500 pointer-events-none" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isRewrite(pathname) && (
              <div>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="mb-5 hover:scale-105 flex items-center gap-1 gradient-primary text-white mx-auto px-2 py-1 rounded-full text-xs press"
                >
                  {isLoadingChatSession && (
                    <CgSpinner className="animate-spin" />
                  )}{" "}
                  load more
                </button>
              </div>
            )}
          </section>
        )}
      </div>
      <div className="seperator border-2 border-white mt-auto"></div>
      <div
        className={cn(
          "mt-auto flex items-center gap-2",
          !expandSidebar && " justify-center"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="">
              <button className="bg-sky-500 w-8 h-8 mt-1 aspect-square text-md rounded-full uppercase font-bold text-white">
                {user?.username[0]}
              </button>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="text-white bg-black mx-3 px-2 py-2 rounded-lg"
            align="end"
          >
            <DropdownMenuItem onClick={logout}>logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {expandSidebar && (
          <p className="capitalize text-gray-900 font-bold truncate">
            {user?.username}
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
