import axiosInstance from "./axiosInstance";
import httpClient from "../services/httpClient";

export function getLeads() {
  return axiosInstance.get("/leads");
}

export function createLead(data) {
  return axiosInstance.post("/leads", data);
}

export function deleteLead(id) {
  return axiosInstance.delete(`/leads/${id}`);
}

export const convertLead = async (id) => {
  return httpClient.post(`/api/leads/${id}/convert`);
};


