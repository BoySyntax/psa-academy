const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface Statistics {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_enrollments: number;
}

export interface StatisticsResponse {
  success: boolean;
  statistics?: Statistics;
  message?: string;
}

class StatisticsService {
  async getStatistics(): Promise<StatisticsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/statistics.php`, {
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
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }
}

export const statisticsService = new StatisticsService();
