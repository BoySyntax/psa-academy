const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export type StudentNotificationStatus = "enrolled" | "rejected" | "idp_approved" | "idp_rejected";

export interface StudentNotification {
  enrollment_id?: number;
  course_id?: number;
  course_name?: string;
  course_code?: string;
  status: StudentNotificationStatus;
  approved_at: string | null;
  student_seen: number;
  message: string;
  rejection_reason?: string | null;
}

export interface FetchNotificationsResponse {
  success: boolean;
  notifications: StudentNotification[];
  unread_count: number;
  message?: string;
}

export const notificationsService = {
  async fetchNotifications(studentId: string, onlyUnread: boolean = false): Promise<FetchNotificationsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/notifications.php?student_id=${studentId}&only_unread=${onlyUnread ? 1 : 0}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          notifications: data.notifications || [],
          unread_count: Number(data.unread_count || 0),
        };
      }

      return {
        success: false,
        notifications: [],
        unread_count: 0,
        message: data.message || "Failed to fetch notifications",
      };
    } catch (error) {
      return {
        success: false,
        notifications: [],
        unread_count: 0,
        message: error instanceof Error ? error.message : "Failed to fetch notifications",
      };
    }
  },

  async markRead(studentId: string, enrollmentId?: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/notifications-read.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: studentId, enrollment_id: enrollmentId }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      }

      return { success: false, message: data.message || "Failed to mark read" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to mark read",
      };
    }
  },
};
