import Base from "../base";

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
  createReview = async (
    url: string,
    reviewData: any
  ): Promise<CreateReviewResponse> => {
    return this.http(url, "post", reviewData);
  };

  getReviewsByProduct = async (url: string): Promise<GetReviewsResponse[]> => {
    return this.http(url, "get");
  };
}

export default new Review();
