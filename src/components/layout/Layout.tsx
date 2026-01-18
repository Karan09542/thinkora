import { useSidebarContext } from "@/context/SidebarProvider";
import Footer from "../footer/Footer";
import Sidebar from "../sidebar/Sidebar";
import { cn } from "@/lib/utils";
import { RiBarChartHorizontalLine } from "react-icons/ri";

interface LayoutProps {
  children: React.ReactNode;
  isFooter?: boolean;
}
const Layout: React.FC<LayoutProps> = ({ children, isFooter = true }) => {
  const { toggleSidebar, isSmallView } = useSidebarContext();
  return (
    <div className={cn("flex", isSmallView && "flex-col")}>
      {isSmallView && (
        <>
        <div
          onClick={toggleSidebar}
          className="backdrop-blur-2xl border-b-6 border-pink-300/30 px-2 py-5 h-10 w-full fixed z-10 flex items-center shadow-2xl shadow-pink-500/20"
        >
          <RiBarChartHorizontalLine
            className="press"
            size={24}
          />
        </div>
        </>
      )}
      <Sidebar
        className={cn(
          "sticky top-0 max-h-screen min-h-screen border-white z-10 bg-linear-to-b from-sky-100 to-pink-50"
        )}
      />
      <div className={cn("flex-1")}>
        <main className="bg-linear-45 from-teal-50 to-pink-50 w-full">
          {children}
        </main>
        {isFooter && <Footer className="relative bg-black text-white" />}
      </div>
    </div>
  );
};

export default Layout;
