import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// Create tab context
const TabContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
}>({
  activeTab: "",
  setActiveTab: () => {},
});

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const [activeTab, setInternalActiveTab] = useState(defaultValue || "");

  // Use either controlled or uncontrolled state
  const currentTab = value !== undefined ? value : activeTab;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalActiveTab(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabContext.Provider value={{ activeTab: currentTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TabsTrigger = ({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useContext(TabContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { activeTab } = useContext(TabContext);
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
