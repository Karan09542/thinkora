import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { TbFileTextSpark, TbHome } from "react-icons/tb";
import { RiImageAiLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const [expendSidebar, setExpendSidebar] = useState(false);
  const NavItems = [
    {
      name: "homepage",
      link: "/",
      Icon: TbHome,
    },
    {
      name: "rewrite",
      link: "/rewrite/generate",
      Icon: TbFileTextSpark,
    },
    {
      name: "image",
      link: "/image/generate",
      Icon: RiImageAiLine,
    },
  ];
  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-300 w-full h-full max-w-24 shadow-sm p-4 transition-all",
        expendSidebar ? "max-w-64" : "max-w-20"
      )}
    >
      {/* logo */}
      <div className="relative py-2 mb-10">
        <div className="flex items-center gap-2 text-xl font-semibold ">
          <img src="/app1.png" className="w-12" />
          {expendSidebar && <p>Thinkora</p>}
        </div>
        <button
          onClick={() => setExpendSidebar((prev) => !prev)}
          className="absolute press top-4 -right-8 border border-gray-300 bg-white p-2 rounded-full "
        >
          {expendSidebar ? (
            <SlArrowLeft size={12} />
          ) : (
            <SlArrowRight size={12} />
          )}
        </button>
      </div>
      {/* section */}
      <div
        className={cn(
          "flex flex-col space-y-6",
          !expendSidebar && "items-center"
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
                  expendSidebar && "py-2 px-3",
                  isActive && "gradient-primary"
                )
              }
            >
              <Icon size={24} />
              {expendSidebar && <p>{name}</p>}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Header;
