import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FaqSearchProps {
  onSearch: (query: string) => void;
}

const FaqSearch = ({ onSearch }: FaqSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        onSearch(searchQuery.trim());
      } else if (searchQuery.trim() === "") {
        onSearch(""); 
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchQuery, onSearch]);

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Tìm kiếm câu hỏi thường gặp..."
        className="pl-10 py-3"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default FaqSearch;
