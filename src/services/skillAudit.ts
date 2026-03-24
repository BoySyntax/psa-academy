const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface SkillAuditGetResponse {
  success: boolean;
  submitted: boolean;
  audit?: any;
  message?: string;
}

export interface SkillAuditSubmitResponse {
  success: boolean;
  submitted: boolean;
  audit?: any;
  message?: string;
}

export const skillAuditService = {
  async getStatus(userId: number, year?: number): Promise<SkillAuditGetResponse> {
    try {
      const y = year ?? new Date().getFullYear();
      const response = await fetch(`${API_BASE_URL}/student/skill-audit.php?user_id=${userId}&year=${y}`, {
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
        message: error instanceof Error ? error.message : "Failed to fetch Skill Audit status",
      };
    }
  },

  async submit(payload: any): Promise<SkillAuditSubmitResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/skill-audit.php`, {
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
        message: error instanceof Error ? error.message : "Failed to submit Skill Audit",
      };
    }
  },
};
