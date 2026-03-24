const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface CareerLeverageSubmission {
  user_id: number;
  year: number;
  submitted_at?: string;
  updated_at?: string;
  student: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    cellphone_number?: string;
    profile_image_url?: string;
  };
  cli: any;
}

export interface CareerLeverageGetResponse {
  success: boolean;
  submitted: boolean;
  cli?: any;
  message?: string;
}

export interface CareerLeverageSubmitResponse {
  success: boolean;
  submitted: boolean;
  cli?: any;
  message?: string;
}

export interface CareerLeverageFetchResponse {
  success: boolean;
  submissions: CareerLeverageSubmission[];
  count: number;
  year?: number;
  message?: string;
}

export const careerLeverageInventoryService = {
  async getStatus(userId: number, year?: number): Promise<CareerLeverageGetResponse> {
    try {
      const y = year ?? new Date().getFullYear();
      const response = await fetch(`${API_BASE_URL}/student/career-leverage-inventory.php?user_id=${userId}&year=${y}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, submitted: false, message: text || "Invalid server response" };
      }
    } catch (error) {
      return {
        success: false,
        submitted: false,
        message: error instanceof Error ? error.message : "Failed to fetch Career Leverage Inventory status",
      };
    }
  },

  async submit(payload: any): Promise<CareerLeverageSubmitResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/career-leverage-inventory.php`, {
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
        return { success: false, submitted: false, message: text || "Invalid server response" };
      }
    } catch (error) {
      return {
        success: false,
        submitted: false,
        message: error instanceof Error ? error.message : "Failed to submit Career Leverage Inventory",
      };
    }
  },

  async fetchManagement(year: number): Promise<CareerLeverageFetchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/career-leverage-inventory.php?year=${year}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        submissions: [],
        count: 0,
        message: error instanceof Error ? error.message : "Failed to fetch Career Leverage Inventory submissions",
      };
    }
  },

  async fetchAdmin(year: number): Promise<CareerLeverageFetchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/career-leverage-inventory.php?year=${year}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        submissions: [],
        count: 0,
        message: error instanceof Error ? error.message : "Failed to fetch Career Leverage Inventory submissions",
      };
    }
  },
};
