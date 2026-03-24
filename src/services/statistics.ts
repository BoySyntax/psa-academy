const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

const parseJsonResponse = async (response: Response) => {
  const rawText = await response.text();

  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch {
    return {
      success: false,
      message: rawText || 'Failed to fetch statistics',
    };
  }
};

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
        headers: DEFAULT_HEADERS,
      });

      const data = await parseJsonResponse(response);
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
