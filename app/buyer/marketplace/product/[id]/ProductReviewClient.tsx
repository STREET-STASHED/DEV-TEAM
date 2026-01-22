"use client";

import EnhancedReviewSystem from "@/components/reviews/EnhancedReviewSystem";

type Props = {
  productId: string;
  productName: string;
  productImage: string;
};

export default function ProductReviewClient({
  productId,
  productName,
  productImage,
}: Props) {
  return (
    <EnhancedReviewSystem
      productId={productId}
      productName={productName}
      productImage={productImage}
      onReviewSubmit={(review) => {
        console.log("New review submitted:", review);
        // In real implementation, this would save to database
      }}
      onReviewUpdate={(reviewId, review) => {
        console.log("Review updated:", reviewId, review);
        // In real implementation, this would update in database
      }}
      onReviewDelete={(reviewId) => {
        console.log("Review deleted:", reviewId);
        // In real implementation, this would delete from database
      }}
      onReviewReport={(reviewId, reason) => {
        console.log("Review reported:", reviewId, reason);
        // In real implementation, this would handle report
      }}
    />
  );
}
