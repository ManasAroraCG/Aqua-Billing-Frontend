import axios from "axios";

const api = axios.create({
  baseURL: "https://aquabilling-api-manas-buc9bmdwa2hghaap.centralindia-01.azurewebsites.net/api",
});

export default api;
