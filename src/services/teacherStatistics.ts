const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface TeacherStatistics {
  my_courses: number;
  total_students: number;
  pending_assignments: number;
}

export interface TeacherStatisticsResponse {
  success: boolean;
  statistics?: TeacherStatistics;
  message?: string;
}

class TeacherStatisticsService {
  async getTeacherStatistics(teacherId: string): Promise<TeacherStatisticsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/statistics.php?teacher_id=${teacherId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teacher statistics',
      };
    }
  }
}

export const teacherStatisticsService = new TeacherStatisticsService();
