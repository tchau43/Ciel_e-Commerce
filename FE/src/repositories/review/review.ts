import Base from "../base";

interface CreateReviewRequest {
  productId: string;
  variantId: string;
  invoiceId: string;
  rating: number;
  comment?: string;
}

interface CreateReviewResponse {
  message: string;
  review: {
    _id: string;
    user: string;
    product: string;
    variant: string;
    invoice: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface GetReviewsResponse {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  product: string;
  variant?: {
    _id: string;
    types: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

class Review extends Base {
  /**
   * Creates a new review for a product
   * @param endpoint API endpoint for creating a review
   * @param reviewData Data for the review to be created
   * @returns The created review
   */
  createReview = async (
    url: string,
    reviewData: any
  ): Promise<CreateReviewResponse> => {
    return this.http(url, "post", reviewData);
  };

  /**
   * Gets all reviews for a product
   * @param endpoint API endpoint for getting reviews
   * @returns List of reviews for the product
   */
  getReviewsByProduct = async (url: string): Promise<GetReviewsResponse[]> => {
    return this.http(url, "get");
  };
}

export default new Review();
