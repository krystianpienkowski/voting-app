import axiosInstance from "../api/axiosInstance";

export async function login(formData) {
  const response = await axiosInstance.post("/api/auth/login", formData);
  return response.data;
}

export async function signup(formData) {
  const response = await axiosInstance.post("/api/auth/signup", formData);
  return response.data;
}