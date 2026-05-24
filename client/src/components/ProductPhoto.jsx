import { resolveImageUrl } from "../utils/images.js";

export default function ProductPhoto({ product, className = "" }) {
  const imageUrl = resolveImageUrl(product.imageUrl || product.images?.[0] || "");

  if (imageUrl) {
    return (
      <figure className={`product-photo image-photo ${className}`} aria-label={product.title}>
        <img src={imageUrl} alt={product.title} loading="lazy" />
      </figure>
    );
  }

  return (
    <div
      className={`product-photo ${product.photo} ${className}`}
      role="img"
      aria-label={product.title}
    />
  );
}
