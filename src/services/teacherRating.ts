const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface TeacherRatingRecord {
  id: number;
  rating: number;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherRatingStatusResponse {
  success: boolean;
  submitted?: boolean;
  rating?: TeacherRatingRecord | null;
  message?: string;
}

export interface SubmitTeacherRatingPayload {
  user_id: number;
  course_id: number;
  teacher_id: number;
  rating: number;
  comment?: string;
}

export interface SubmitTeacherRatingResponse {
  success: boolean;
  message?: string;
}

export const teacherRatingService = {
  async getStatus(userId: number, courseId: number, teacherId: number): Promise<TeacherRatingStatusResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/teacher-rating.php?user_id=${userId}&course_id=${courseId}&teacher_id=${teacherId}`,
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
        message: error instanceof Error ? error.message : "Failed to fetch teacher rating",
      };
    }
  },

  async submit(payload: SubmitTeacherRatingPayload): Promise<SubmitTeacherRatingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/teacher-rating.php`, {
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
        message: error instanceof Error ? error.message : "Failed to submit teacher rating",
      };
    }
  },
};
