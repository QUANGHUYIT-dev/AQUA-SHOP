import axios from "axios";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
      return SYSTEM_MESSAGES.API_CONNECTION_ERROR;
    }

    if (error.response?.status === 401) {
      return SYSTEM_MESSAGES.UNAUTHORIZED;
    }

    if (error.response?.status === 404) {
      return SYSTEM_MESSAGES.NOT_FOUND;
    }
  }

  return SYSTEM_MESSAGES.GENERIC_ERROR;
}
