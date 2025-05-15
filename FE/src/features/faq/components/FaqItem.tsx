import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { useRateFaqMutation } from "@/services/faq/rateFaqMutation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  _id: string;
  question: string;
  answer: string;
  category: string;
  helpfulCount: number;
  unhelpfulCount: number;
}

const FaqItem = ({
  _id,
  question,
  answer,
  category,
  helpfulCount,
  unhelpfulCount,
}: FaqItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const { mutate: rateFaq } = useRateFaqMutation(_id, {
    onSuccess: () => {
      setHasRated(true);
    },
  });

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleHelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasRated) {
      rateFaq(true);
    }
  };

  const handleUnhelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasRated) {
      rateFaq(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
      <div
        className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 cursor-pointer"
        onClick={handleToggle}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <div className="flex items-center">
          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-3">
            {category}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="prose max-w-none text-gray-700">{answer}</div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Thông tin này có hữu ích cho bạn không?
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHelpful}
                disabled={hasRated}
                className={cn(
                  "flex items-center gap-1",
                  hasRated && "opacity-50 cursor-not-allowed"
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{helpfulCount}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnhelpful}
                disabled={hasRated}
                className={cn(
                  "flex items-center gap-1",
                  hasRated && "opacity-50 cursor-not-allowed"
                )}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{unhelpfulCount}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqItem;
