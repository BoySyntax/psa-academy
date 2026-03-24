const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export type ImpactListStatus = "due" | "not_yet_due" | "completed" | "all";

export interface ImpactEvaluationItem {
  evaluation_id: number;
  user_id: number;
  course_id: number;
  trainee_name: string;
  office_service_division?: string | null;
  training_program: string;
  training_objectives?: string | null;
  completion_date?: string | null;
  due_date?: string | null;
  course: {
    course_code: string;
    course_name: string;
  };
  student: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
  };
  level3: {
    q1?: string | null;
    q2?: string | null;
    q3?: string | null;
    evaluated_by?: string | null;
    evaluated_by_date?: string | null;
    received_by?: string | null;
    received_by_date?: string | null;
  };
}

export interface FetchImpactEvaluationsResponse {
  success: boolean;
  items: ImpactEvaluationItem[];
  count: number;
  message?: string;
}

export interface SaveImpactEvaluationResponse {
  success: boolean;
  message?: string;
}

export const impactEvaluationService = {
  async fetch(status: ImpactListStatus): Promise<FetchImpactEvaluationsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/impact-evaluations.php?status=${status}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        items: [],
        count: 0,
        message: error instanceof Error ? error.message : "Failed to fetch impact evaluations",
      };
    }
  },

  async saveLevel3(payload: {
    user_id: number;
    course_id: number;
    level3_q1: string;
    level3_q2: string;
    level3_q3: string;
    evaluated_by?: string;
    evaluated_by_date?: string;
    received_by?: string;
    received_by_date?: string;
  }): Promise<SaveImpactEvaluationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/impact-evaluations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save impact evaluation",
      };
    }
  },
};
