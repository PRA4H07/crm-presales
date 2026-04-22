import httpClient from "./httpClient";

export const agencyService = {
  async getAgency() {
    const res = await httpClient.get("/api/agency");
    return res.data;
  },

  async updateAgency(data) {
    const res = await httpClient.put("/api/agency", data);
    return res.data;
  },
};