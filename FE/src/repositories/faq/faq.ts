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

export interface FAQResponse {
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
  
  getAllFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  getFaqById = async (
    url: string
  ): Promise<{ success: boolean; data: FAQItem }> => {
    return this.http(url, "get");
  };

  getFaqsByCategory = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  searchFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  getPopularFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  rateFaqHelpfulness = async (
    url: string,
    isHelpful: boolean
  ): Promise<RateHelpfulnessResponse> => {
    return this.http(url, "post", { isHelpful });
  };
}

export default new FAQ();
