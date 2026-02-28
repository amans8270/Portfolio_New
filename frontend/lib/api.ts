import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: false,
});

// Attach JWT token from localStorage for admin routes
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ── Projects ────────────────────────────────────────────────────────────────
export const getProjects = () => api.get("/projects");
export const createProject = (data: unknown) => api.post("/projects", data);
export const updateProject = (id: string, data: unknown) => api.put(`/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);

// ── Resume ──────────────────────────────────────────────────────────────────
export const getResumeInfo = () => api.get("/resume/info");
export const uploadResume = (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
export const getResumeDownloadUrl = () => `${API_URL}/resume/download`;

// ── Contact ─────────────────────────────────────────────────────────────────
export const sendContact = (data: { name: string; email: string; subject: string; message: string }) =>
    api.post("/contact", data);

// ── Auth ────────────────────────────────────────────────────────────────────
export const adminLogin = (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
};

export default api;
