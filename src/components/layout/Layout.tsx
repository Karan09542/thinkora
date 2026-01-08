import { TbLayoutSidebarRightFilled } from "react-icons/tb";
import Footer from "../footer/Footer";
import Sidebar from "../sidebar/Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  isFooter?: boolean;
}
const Layout: React.FC<LayoutProps> = ({ children, isFooter = true }) => {
  return (
    <div className="flex">
      <Sidebar
        className={cn(
          "sticky top-0 min-h-screen border-white z-10 bg-linear-to-b from-sky-100 to-pink-50",
        )}
      />
      {/* <button
        onClick={() => setOpenSidebar((prev) => !prev)}
        className="sm:hidden press z-10 text-sky-500 absolute left-3 top-3"
      >
        <TbLayoutSidebarRightFilled size={28} />
      </button> */}
      <div className="flex-1">
        <main className="bg-linear-45 from-teal-50 to-pink-50 w-full">
          {children}
        </main>
        {isFooter && <Footer className="relative bg-black text-white" />}
      </div>
    </div>
  );
};

export default Layout;
