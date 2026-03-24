const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface IdpResponse {
  success: boolean;
  idp?: any;
  message?: string;
}

export interface SaveIdpResponse {
  success: boolean;
  message?: string;
}

export const idpService = {
  async get(userId: number): Promise<IdpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/idp.php?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {
          success: false,
          message: text || "Invalid server response",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch IDP",
      };
    }
  },

  async save(payload: any): Promise<SaveIdpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/idp.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {
          success: false,
          message: text || "Invalid server response",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save IDP",
      };
    }
  },
};
