import { useState, useEffect } from "react";
import { useGetUserDeliveredProductsQuery } from "@/services/user/getUserDeliveredProductsQuery";
import { useAuth } from "@/auth/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DeliveredProduct from "../components/DeliveredProduct";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewForm from "../components/ReviewForm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

// Define the expected type for delivered products
interface DeliveredProductItem {
  invoice: {
    _id: string;
    createdAt: string;
    orderStatus: string;
  };
  product: {
    _id: string;
    name: string;
    images?: string[];
    description?: string;
  };
  variant: {
    _id: string;
    types: string;
    price: number;
  };
  quantity: number;
  priceAtPurchase: number;
  reviewStatus?: {
    isReviewed: boolean;
    reviewId: string | null;
    rating: number | null;
    comment?: string | null;
  };
}

const CustomerReviewPage = () => {
  const { user } = useAuth();
  const userId = user?._id || "";
  const [activeTab, setActiveTab] = useState("all");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    variantType: string;
    invoiceId: string;
  } | null>(null);
  const [selectedReview, setSelectedReview] = useState<{
    reviewId: string;
    rating: number | null;
    productName: string;
    variantType: string;
    comment: string | null;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    data: deliveredProducts,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserDeliveredProductsQuery(userId);

  useEffect(() => {
    if (deliveredProducts?.length > 0) {
      // Log all products with their review status for debugging
      console.log(
        "All delivered products with review status:",
        deliveredProducts.map((p: DeliveredProductItem) => ({
          id: p.product._id,
          name: p.product.name,
          reviewStatus: p.reviewStatus,
        }))
      );
    }
  }, [deliveredProducts]);

  const handleWriteReview = (
    productId: string,
    variantId: string,
    invoiceId: string
  ) => {
    // Find the product to get its name for the modal
    const product = deliveredProducts?.find(
      (p: DeliveredProductItem) =>
        p.product._id === productId &&
        p.variant._id === variantId &&
        p.invoice._id === invoiceId
    );

    if (product) {
      setSelectedProduct({
        productId,
        productName: product.product.name,
        variantId,
        variantType: product.variant.types,
        invoiceId,
      });
      setReviewModalOpen(true);
    }
  };

  const handleReviewSuccess = () => {
    setReviewModalOpen(false);
    setSelectedProduct(null);
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({
      queryKey: ["userDeliveredProducts", userId],
    });
    refetch();
  };

  const handleViewReview = (reviewId: string) => {
    // Find the product with this review
    const productWithReview = deliveredProducts?.find(
      (p: DeliveredProductItem) => p.reviewStatus?.reviewId === reviewId
    );

    // Log for debugging
    console.log("Selected review:", reviewId);
    console.log("Product with review:", productWithReview);
    console.log("Review status:", productWithReview?.reviewStatus);

    if (productWithReview) {
      setSelectedReview({
        reviewId,
        rating: productWithReview.reviewStatus?.rating || null,
        productName: productWithReview.product.name,
        variantType: productWithReview.variant.types,
        comment: productWithReview.reviewStatus?.comment || null,
      });
      setViewReviewModalOpen(true);

      // Log the selected review data being set
      console.log("Setting selected review:", {
        reviewId,
        rating: productWithReview.reviewStatus?.rating,
        comment: productWithReview.reviewStatus?.comment,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Sản phẩm cần đánh giá</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video relative">
                <Skeleton className="h-full w-full absolute" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Sản phẩm cần đánh giá</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Lỗi tải dữ liệu: {error?.message || "Lỗi không xác định"}</p>
        </div>
      </div>
    );
  }

  // Filter products based on review status
  const allProducts = deliveredProducts || [];
  const pendingReviews = allProducts.filter(
    (p: DeliveredProductItem) => !p.reviewStatus?.isReviewed
  );
  const completedReviews = allProducts.filter(
    (p: DeliveredProductItem) => p.reviewStatus?.isReviewed
  );

  // Get the appropriate products list based on the active tab
  const productsToDisplay =
    activeTab === "pending"
      ? pendingReviews
      : activeTab === "completed"
      ? completedReviews
      : allProducts;

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h1>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="all">Tất cả ({allProducts.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Chưa đánh giá ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Đã đánh giá ({completedReviews.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsToDisplay.map(
              (product: DeliveredProductItem, index: number) => (
                <DeliveredProduct
                  key={`${product.product._id}-${
                    product.variant?._id || "no-variant"
                  }-${product.invoice._id}-${index}`}
                  product={product}
                  onWriteReview={handleWriteReview}
                  onViewReview={handleViewReview}
                />
              )
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">
              {activeTab === "pending"
                ? "Tất cả sản phẩm đã được đánh giá"
                : activeTab === "completed"
                ? "Chưa có sản phẩm nào được đánh giá"
                : "Không có sản phẩm nào được giao"}
            </h3>
            <p className="text-gray-500">
              {activeTab === "pending"
                ? "Bạn đã đánh giá tất cả các sản phẩm đã mua."
                : activeTab === "completed"
                ? "Bạn chưa đánh giá sản phẩm nào."
                : "Bạn chưa có sản phẩm nào đã nhận hàng để đánh giá."}
            </p>
          </div>
        )}
      </div>

      {/* Write Review Form Dialog */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Đánh giá sản phẩm
              {selectedProduct && (
                <div className="text-sm font-normal mt-1 text-gray-500">
                  {selectedProduct.productName} - {selectedProduct.variantType}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ReviewForm
              productId={selectedProduct.productId}
              variantId={selectedProduct.variantId}
              invoiceId={selectedProduct.invoiceId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setReviewModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Review Dialog */}
      <Dialog open={viewReviewModalOpen} onOpenChange={setViewReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Chi tiết đánh giá
              {selectedReview && (
                <div className="text-sm font-normal mt-1 text-gray-500">
                  {selectedReview.productName} - {selectedReview.variantType}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* Rating display */}
              <div>
                <p className="font-medium mb-2">Đánh giá của bạn</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < (selectedReview.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({selectedReview.rating} sao)
                  </span>
                </div>
              </div>

              {/* Comment display */}
              {selectedReview.comment && (
                <div>
                  <p className="font-medium mb-2">Nhận xét của bạn</p>
                  <div className="p-4 bg-gray-50 rounded-md">
                    {selectedReview.comment}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerReviewPage;
