const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface EvaluationStatusResponse {
  success: boolean;
  submitted?: boolean;
  message?: string;
}

export interface SubmitEvaluationResponse {
  success: boolean;
  message?: string;
}

export interface TrainingEvaluationPayload {
  user_id: number;
  course_id: number;
  trainee_name: string;
  office_service_division: string;
  training_program: string;
  topic: string;
  date_of_conduct: string;
  venue: string;
  training_objectives: string;
  ratings: Record<string, number>;
  yesno: Record<string, "YES" | "NO">;
  comments_1: string;
  comments_2: string;
  comments_3: string;

  level2_q1: string;
  level2_q2: string;

  level3_q1: string;
  level3_q2: string;
  level3_q3: string;

  evaluated_by: string;
  evaluated_by_date: string;
  received_by: string;
  received_by_date: string;
}

export const evaluationService = {
  async getStatus(userId: number, courseId: number): Promise<EvaluationStatusResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/evaluation.php?user_id=${userId}&course_id=${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch evaluation status",
      };
    }
  },

  async submit(payload: TrainingEvaluationPayload): Promise<SubmitEvaluationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/evaluation.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit evaluation",
      };
    }
  },
};
