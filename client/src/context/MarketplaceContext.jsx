import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultPosts, categories as seedCategories } from "../data/seed.js";
import { api } from "../services/api.js";

const sessionKey = "mercadoVecinoUser";
const postsKey = "mercadoVecinoPosts";
const MarketplaceContext = createContext(null);
const demoUser = { id: 1, name: "Usuario Demo" };
const imageByCategory = {
  Deportes: "/assets/bicicleta-urbana.svg",
  Tecnologia: "/assets/notebook-lenovo.svg",
  Hogar: "/assets/silla-ergonomica.svg",
  Servicios: "/assets/fotografia-producto.svg",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo persistir ${key} en localStorage`, error);
  }
}

function inferImage(post) {
  const title = post.title?.toLowerCase() || "";
  if (title.includes("bicicleta")) return imageByCategory.Deportes;
  if (title.includes("notebook") || title.includes("lenovo")) return imageByCategory.Tecnologia;
  if (title.includes("silla")) return imageByCategory.Hogar;
  if (title.includes("fotografia") || title.includes("foto")) return imageByCategory.Servicios;
  return imageByCategory[post.category] || imageByCategory.Tecnologia;
}

function normalizePost(post) {
  const categoryName = typeof post.category === "object" ? post.category.name : post.category;
  const sellerName = typeof post.seller === "object" ? post.seller.fullName : post.seller;
  const apiImages = Array.isArray(post.images) && post.images.length > 0
    ? post.images.map((image) => image.imageUrl || image)
    : [];
  const images = Array.isArray(post.images) && post.images.length > 0
    ? apiImages
    : [post.coverImage || post.imageUrl || inferImage({ ...post, category: categoryName })].filter(Boolean);
  return {
    ...post,
    id: Number(post.id),
    ownerId: Number(post.ownerId || post.userId || post.seller?.id || demoUser.id),
    category: categoryName,
    categoryId: post.categoryId || post.category?.id,
    seller: sellerName || demoUser.name,
    location: post.location || post.commune,
    imageUrl: images[0] || "",
    images,
  };
}

function normalizePosts(posts) {
  return posts.map(normalizePost);
}

export function MarketplaceProvider({ children }) {
  const [user, setUser] = useState(() => readJson(sessionKey, null));
  const [posts, setPosts] = useState(() => normalizePosts(readJson(postsKey, defaultPosts)));
  const [categories, setCategories] = useState(seedCategories);
  const [filters, setFilters] = useState({ search: "", category: "" });

  useEffect(() => {
    let active = true;

    async function loadBackendData() {
      try {
        const [apiCategories, apiPosts] = await Promise.all([
          api.getCategories(),
          api.getPosts(),
        ]);
        if (!active) return;
        const backendCategories = Array.isArray(apiCategories) && apiCategories.length > 0
          ? apiCategories
          : seedCategories;

        setCategories(backendCategories);
        setPosts(normalizePosts(apiPosts.data || apiPosts));
      } catch (error) {
        console.warn("No se pudo cargar API, se mantiene fallback local", error);
      }
    }

    loadBackendData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      writeJson(sessionKey, user);
      return;
    }
    localStorage.removeItem(sessionKey);
  }, [user]);

  useEffect(() => {
    writeJson(postsKey, posts);
  }, [posts]);

  const login = useCallback(async (email, password) => {
    const session = await api.login({ email, password });
    setUser({ ...session.user, name: session.user.fullName, token: session.token });
    return session.user;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await api.register({
      fullName: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    });
    setUser({ ...session.user, name: session.user.fullName, token: session.token });
    return session.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const createPost = useCallback(async (payload) => {
    const created = await api.createPost(payload, categories, user?.token);
    const post = normalizePost({
      ...created,
      category: categories.find((category) => String(category.id) === String(created.categoryId)) || payload.category,
      seller: { id: user?.id, fullName: user?.name || user?.fullName || "Usuario Demo" },
      commune: created.commune || payload.location,
    });
    setPosts((current) => [post, ...current]);
    return post;
  }, [categories, user]);

  const updatePost = useCallback(async (id, payload) => {
    const updated = await api.updatePost(id, payload, categories, user?.token);
    const post = normalizePost({
      ...updated,
      category: categories.find((category) => String(category.id) === String(updated.categoryId)) || payload.category,
      seller: { id: user?.id, fullName: user?.name || user?.fullName || "Usuario Demo" },
      commune: updated.commune || payload.location,
    });
    setPosts((current) => current.map((item) => item.id === Number(id) ? post : item));
    return post;
  }, [categories, user]);

  const deletePost = useCallback(async (id) => {
    if (user?.token) await api.deletePost(id, user.token);
    setPosts((current) => current.filter((post) => post.id !== id));
  }, [user]);

  const filteredPosts = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesText = !term || post.title.toLowerCase().includes(term) || post.description.toLowerCase().includes(term);
      const matchesCategory = !filters.category || post.category === filters.category;
      return matchesText && matchesCategory;
    });
  }, [posts, filters]);

  const myPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter((post) => post.ownerId === user.id || post.seller === user.name);
  }, [posts, user]);

  const value = useMemo(() => ({
    user,
    posts,
    categories,
    filters,
    filteredPosts,
    myPosts,
    isAuthenticated: Boolean(user),
    setFilters,
    login,
    register,
    logout,
    createPost,
    updatePost,
    deletePost,
  }), [user, posts, filters, filteredPosts, myPosts, login, register, logout, createPost, updatePost, deletePost]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace debe usarse dentro de MarketplaceProvider");
  }
  return context;
}
