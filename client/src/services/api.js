const configuredApiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const API_BASE_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

async function request(path, options = {}) {
  const headers = options.body instanceof FormData
    ? { ...options.headers }
    : {
        "Content-Type": "application/json",
        ...options.headers,
      };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error de API" }));
    throw new Error(error.message || "Error de API");
  }

  return response.json();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function postFormData(payload, categories) {
  const formData = new FormData();
  const category = categories.find((item) => item.name === payload.category || String(item.id) === String(payload.categoryId));
  const imageUrls = payload.imageUrls || [];

  formData.append("categoryId", category?.id || payload.categoryId || 1);
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("price", payload.price);
  formData.append("condition", payload.condition);
  formData.append("commune", payload.location || payload.commune);
  formData.append("status", payload.status || "active");

  for (const file of payload.imageFiles || []) {
    formData.append("images", file);
  }

  if ((!payload.imageFiles || payload.imageFiles.length === 0) && imageUrls.length > 0) {
    formData.append("images", JSON.stringify(imageUrls.map((imageUrl, index) => ({
      imageUrl,
      altText: payload.title,
      isCover: index === 0,
    }))));
  }

  return formData;
}

export const api = {
  origin: API_ORIGIN,
  getCategories: () => request("/categories"),
  getPosts: () => request("/posts"),
  getPost: (id) => request(`/posts/${id}`),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  createPost: (payload, categories, token) => request("/posts", {
    method: "POST",
    headers: authHeaders(token),
    body: postFormData(payload, categories),
  }),
  updatePost: (id, payload, categories, token) => request(`/posts/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: postFormData(payload, categories),
  }),
  deletePost: (id, token) => request(`/posts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }),
};
