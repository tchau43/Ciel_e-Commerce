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
  /**
   * Get all FAQs with optional filtering
   * @param url API endpoint for getting all FAQs
   * @returns List of FAQs
   */
  getAllFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  /**
   * Get a single FAQ by ID
   * @param url API endpoint for getting a FAQ by ID
   * @returns FAQ object
   */
  getFaqById = async (
    url: string
  ): Promise<{ success: boolean; data: FAQItem }> => {
    return this.http(url, "get");
  };

  /**
   * Get FAQs by category
   * @param url API endpoint for getting FAQs by category
   * @returns List of FAQs in the category
   */
  getFaqsByCategory = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  /**
   * Search FAQs by query
   * @param url API endpoint for searching FAQs
   * @returns List of matching FAQs
   */
  searchFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  /**
   * Get popular FAQs
   * @param url API endpoint for getting popular FAQs
   * @returns List of popular FAQs
   */
  getPopularFaqs = async (url: string): Promise<FAQResponse> => {
    return this.http(url, "get");
  };

  /**
   * Rate FAQ helpfulness
   * @param url API endpoint for rating helpfulness
   * @param isHelpful Whether the FAQ was helpful
   * @returns Updated helpfulness counts
   */
  rateFaqHelpfulness = async (
    url: string,
    isHelpful: boolean
  ): Promise<RateHelpfulnessResponse> => {
    return this.http(url, "post", { isHelpful });
  };
}

export default new FAQ();
