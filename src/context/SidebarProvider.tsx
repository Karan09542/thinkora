import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarProps {
  children: React.ReactNode;
}
type SidebarContextType = {
  expandSidebar: boolean;
  setExpandSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isSmallView: boolean;
  isOpenSmallView: boolean;
  setIsOpenSmallView: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
};
type ChatSession = {
  _id: string;
  title: string;
};
const SidebarContext = createContext<SidebarContextType | null>(null);
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used inside SidebarProvider");
  }
  return context;
};
const SidebarProvider: React.FC<SidebarProps> = ({ children }) => {
  const [expandSidebar, setExpandSidebar] = useState(false);
  const [isSmallView, setIsSmallView] = useState(false);
  const [isOpenSmallView, setIsOpenSmallView] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const toggleSidebar = () => {
    setIsOpenSmallView((prev) => !prev);
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setExpandSidebar(true);
        setIsSmallView(true);
      } else {
        setIsSmallView(false);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.addEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext
      value={{
        expandSidebar,
        setExpandSidebar,
        isSmallView,
        isOpenSmallView,
        setIsOpenSmallView,
        toggleSidebar,
        chatSessions,
        setChatSessions,
      }}
    >
      {children}
    </SidebarContext>
  );
};

export default SidebarProvider;
