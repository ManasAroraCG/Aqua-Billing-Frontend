import axios from "axios";

const api = axios.create({
  baseURL: "https://aquabilling-api-manas-buc9bmdwa2hghaap.centralindia-01.azurewebsites.net/api",
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForBackendReady({
  endpoint = "/customers",
  timeoutMs = 10000,
  retryDelayMs = 3000,
  onRetry,
} = {}) {
  let attempt = 0;

  while (true) {
    attempt += 1;

    try {
      await api.get(endpoint, {
        timeout: timeoutMs,
      });

      return { success: true, attempts: attempt };
    } catch (error) {
      if (typeof onRetry === "function") {
        onRetry({ attempt, error });
      }

      await sleep(retryDelayMs);
    }
  }
}

export default api;
