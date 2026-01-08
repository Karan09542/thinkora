import React, { createContext, useContext, useState } from "react";

interface SidebarProps {
  children: React.ReactNode;
}
type SidebarContextType = {
  expandSidebar: boolean;
  setExpandSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};
const SidebarContext = createContext<SidebarContextType | null>(null);
export const userSidebarContext = () => {
    const context = useContext(SidebarContext);
    if(!context){
        throw new Error("useSidebarContext must be used inside SidebarProvider")
    }
    return context;
};
const SidebarProvider: React.FC<SidebarProps> = ({ children }) => {
  const [expandSidebar, setExpandSidebar] = useState(false);

  return (
    <SidebarContext value={{ expandSidebar, setExpandSidebar }}>
      {children}
    </SidebarContext>
  );
};

export default SidebarProvider;
