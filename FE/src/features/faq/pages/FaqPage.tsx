import { useState, useEffect } from "react";
import { useGetAllFaqsQuery } from "@/services/faq/getAllFaqsQuery";
import { useGetFaqsByCategoryQuery } from "@/services/faq/getFaqsByCategoryQuery";
import { useGetPopularFaqsQuery } from "@/services/faq/getPopularFaqsQuery";
import { useSearchFaqsQuery } from "@/services/faq/searchFaqsQuery";
import FaqItem from "../components/FaqItem";
import FaqCategories from "../components/FaqCategories";
import FaqSearch from "../components/FaqSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Define Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  color?: string;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: Category | string; // Category can be an object or string ID
  isPublished: boolean;
  displayOrder: number;
  viewCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const FaqPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQ[]>([]);

  // Queries
  const { data: allFaqsResponse, isLoading: isLoadingAll } =
    useGetAllFaqsQuery();

  const { data: popularFaqsResponse, isLoading: isLoadingPopular } =
    useGetPopularFaqsQuery();

  const { data: categoryFaqsResponse, isLoading: isLoadingCategory } =
    useGetFaqsByCategoryQuery(activeCategory !== "all" ? activeCategory : "");

  const { data: searchResultsResponse, isLoading: isLoadingSearch } =
    useSearchFaqsQuery(searchQuery);

  // Extract unique categories from all FAQs
  useEffect(() => {
    if (allFaqsResponse?.faqs && allFaqsResponse.faqs.length > 0) {
      // Extract category IDs or slugs, handling both object and string formats
      const uniqueCategories = [
        ...new Set(
          allFaqsResponse.faqs.map((faq) => {
            // If category is an object, use its ID or slug
            if (typeof faq.category === "object" && faq.category !== null) {
              // Use type assertion to tell TypeScript this is a Category object
              const categoryObj = faq.category as Category;
              return categoryObj.slug || categoryObj._id;
            }
            // If it's a string (ID), use it directly
            return faq.category;
          })
        ),
      ];
      setCategories(uniqueCategories);
    }
  }, [allFaqsResponse]);

  // Set displayed FAQs based on active tab, category, and search
  useEffect(() => {
    if (searchQuery.length >= 2 && searchResultsResponse?.faqs) {
      // Search results take precedence
      setDisplayedFaqs(searchResultsResponse.faqs);
      return;
    }

    if (activeTab === "popular" && popularFaqsResponse?.faqs) {
      setDisplayedFaqs(popularFaqsResponse.faqs);
      return;
    }

    if (activeCategory !== "all" && categoryFaqsResponse?.faqs) {
      setDisplayedFaqs(categoryFaqsResponse.faqs);
      return;
    }

    if (allFaqsResponse?.faqs) {
      setDisplayedFaqs(allFaqsResponse.faqs);
    }
  }, [
    activeTab,
    activeCategory,
    searchQuery,
    allFaqsResponse,
    popularFaqsResponse,
    categoryFaqsResponse,
    searchResultsResponse,
  ]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Reset search when changing category
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to "all" tab when searching
    setActiveTab("all");
  };

  const isLoading =
    isLoadingAll ||
    (activeTab === "popular" && isLoadingPopular) ||
    (activeCategory !== "all" && isLoadingCategory) ||
    (searchQuery.length >= 2 && isLoadingSearch);

  // Helper function to get category name or slug
  const getCategoryName = (category: Category | string): string => {
    if (typeof category === "object" && category !== null) {
      return category.name || category.slug || "Unknown";
    }
    return category.toString();
  };

  // Render FAQ list based on loading state and data availability
  const renderFaqList = () => {
    if (isLoading) {
      return (
        // Loading skeleton
        <>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="mb-4">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </>
      );
    }

    if (displayedFaqs && displayedFaqs.length > 0) {
      return (
        // Display FAQs
        displayedFaqs.map((faq: FAQ) => (
          <FaqItem
            key={faq._id}
            _id={faq._id}
            question={faq.question}
            answer={faq.answer}
            category={getCategoryName(faq.category)}
            helpfulCount={faq.helpfulCount}
            unhelpfulCount={faq.unhelpfulCount}
          />
        ))
      );
    }

    if (searchQuery) {
      return (
        // No search results
        <div className="text-center py-8">
          <p className="text-gray-500">
            Không tìm thấy câu hỏi nào phù hợp với "{searchQuery}".
          </p>
          <p className="text-gray-500 mt-2">
            Vui lòng thử lại với từ khóa khác hoặc liên hệ với chúng tôi nếu bạn
            có câu hỏi mới.
          </p>
        </div>
      );
    }

    return (
      // No FAQs in selected category
      <div className="text-center py-8">
        <p className="text-gray-500">
          Không có câu hỏi nào trong danh mục này.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Câu hỏi thường gặp</h1>
      <p className="text-gray-600 mb-8">
        Tìm kiếm câu trả lời cho những câu hỏi thường gặp về sản phẩm, vận
        chuyển, và các dịch vụ khác.
      </p>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="all">Tất cả câu hỏi</TabsTrigger>
            <TabsTrigger value="popular">Phổ biến nhất</TabsTrigger>
          </TabsList>

          <FaqSearch onSearch={handleSearch} />

          {!searchQuery && (
            <FaqCategories
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}

          <TabsContent value="all" className="mt-0">
            {renderFaqList()}
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            {renderFaqList()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact information */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          Bạn không tìm thấy câu trả lời?
        </h2>
        <p className="mb-4">
          Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, vui lòng liên
          hệ với bộ phận hỗ trợ khách hàng của chúng tôi:
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>chaupt2823@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>0392031915</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
