import { api } from "../services/api.js";

export function resolveImageUrl(image) {
  const imageUrl = typeof image === "string" ? image : image?.imageUrl;
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http") || imageUrl.startsWith("data:") || imageUrl.startsWith("/assets")) return imageUrl;
  if (imageUrl.startsWith("assets/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads")) return `${api.origin}${imageUrl}`;
  return imageUrl;
}

export function getPostImages(post) {
  if (!post) return [];
  const images = Array.isArray(post.images) && post.images.length > 0 ? post.images : [post.imageUrl].filter(Boolean);
  return images.map(resolveImageUrl).filter(Boolean);
}

export function withPrimaryImage(post) {
  const [imageUrl = ""] = getPostImages(post);
  return { ...post, imageUrl };
}
