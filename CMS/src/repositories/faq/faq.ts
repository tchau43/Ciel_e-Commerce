import Base from "../base";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  displayOrder: number;
  viewCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface FAQResponse {
  success: boolean;
  faqs: FAQItem[];
  totalFaqs: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface RateHelpfulnessResponse {
  success: boolean;
  data: {
    helpfulCount: number;
    unhelpfulCount: number;
  };
}

class FAQ extends Base {
  getAllFaqs = async (url: string) => {
    return this.http<FAQResponse>(url, "get");
  };
  getFaqById = async (url: string) => {
    return this.http<{ success: boolean; data: FAQItem }>(url, "get");
  };
  getFaqsByCategory = async (url: string) => {
    return this.http<FAQResponse>(url, "get");
  };
  searchFaqs = async (url: string) => {
    return this.http<FAQResponse>(url, "get");
  };
  getPopularFaqs = async (url: string) => {
    return this.http<FAQResponse>(url, "get");
  };
  rateFaqHelpfulness = async (url: string, isHelpful: boolean) => {
    return this.http<RateHelpfulnessResponse>(url, "post", { isHelpful });
  };
}

export default new FAQ();
