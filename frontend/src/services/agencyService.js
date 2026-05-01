import axiosInstance from "../api/axiosInstance";

function authHeaders() {
  const token = window.localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export const agencyService = {
  async getAgency() {
    const res = await axiosInstance.get("/agency", {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateAgency(data) {
    const res = await axiosInstance.put("/agency", data, {
      headers: authHeaders(),
    });
    return res.data;
  },
};