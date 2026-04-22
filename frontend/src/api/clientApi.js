import axiosInstance from "./axiosInstance";

export function getClients() {
  return axiosInstance.get("/clients");
}

export function createClient(data) {
  return axiosInstance.post("/clients", data);
}

export function deleteClient(id) {
  return axiosInstance.delete(`/clients/${id}`);
}