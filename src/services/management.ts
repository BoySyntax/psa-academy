const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export interface EnrollmentStudent {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  cellphone_number?: string;
  profile_image_url?: string;
}

export interface EnrollmentCourse {
  course_code: string;
  course_name: string;
  category?: string;
  subcategory?: string;
  duration_hours?: number;
}

export interface EnrollmentApprover {
  first_name: string;
  last_name: string;
}

export interface PendingEnrollment {
  enrollment_id: number;
  course_id: number;
  student_id: number;
  student_uuid: string;
  enrollment_date: string;
  status: 'pending' | 'enrolled' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  course: EnrollmentCourse;
  student: EnrollmentStudent;
  approver?: EnrollmentApprover | null;
}

export interface FetchEnrollmentsResponse {
  success: boolean;
  enrollments: PendingEnrollment[];
  count: number;
  message?: string;
}

export interface ApproveEnrollmentRequest {
  enrollment_id: number;
  action: 'approve' | 'reject';
  management_user_id: number;
  rejection_reason?: string;
  management_message?: string;
}

export interface ApproveEnrollmentResponse {
  success: boolean;
  message: string;
  enrollment_id?: number;
  new_status?: string;
}

export interface PendingIdpStudent {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  cellphone_number?: string;
  profile_image_url?: string;
}

export interface PendingIdpApprover {
  first_name: string;
  last_name: string;
}

export interface PendingIdp {
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  management_message?: string;
  student: PendingIdpStudent;
  approver?: PendingIdpApprover | null;
  idp: any;
}

export interface FetchIdpsResponse {
  success: boolean;
  idps: PendingIdp[];
  count: number;
  message?: string;
}

export interface ApproveIdpRequest {
  user_id: number;
  action: 'approve' | 'reject';
  management_user_id: number;
  rejection_reason?: string;
  management_message?: string;
}

export interface ApproveIdpResponse {
  success: boolean;
  message: string;
  user_id?: number;
  new_status?: string;
}

export interface SatnaStudent {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  cellphone_number?: string;
  profile_image_url?: string;
}

export interface SatnaSubmission {
  user_id: number;
  year: number;
  submitted_at?: string;
  updated_at?: string;
  student: SatnaStudent;
  audit: any;
}

export interface FetchSatnaResponse {
  success: boolean;
  audits: SatnaSubmission[];
  count: number;
  year?: number;
  message?: string;
}

export interface TeacherRatingsTeacher {
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string | null;
  present_position?: string | null;
  office?: string | null;
  division_province?: string | null;
  trainer_since?: number | null;
}

export interface TeacherRatingsCourse {
  course_code: string;
  course_name: string;
  category?: string;
}

export interface TeacherRatingsStudent {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
}

export interface TeacherRatingSummary {
  teacher_id: number;
  course_id: number;
  teacher: TeacherRatingsTeacher;
  course: TeacherRatingsCourse;
  average_rating: number;
  rating_count: number;
}

export interface TeacherRatingItem {
  id: number;
  user_id: number;
  course_id: number;
  teacher_id: number;
  rating: number;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
  course: TeacherRatingsCourse;
  teacher: TeacherRatingsTeacher;
  student: TeacherRatingsStudent;
}

export interface FetchTeacherRatingsResponse {
  success: boolean;
  ratings: TeacherRatingItem[];
  summaries: TeacherRatingSummary[];
  count: number;
  message?: string;
}

export const managementService = {
  async fetchEnrollments(status: string = 'pending'): Promise<FetchEnrollmentsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/pending-enrollments.php?status=${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return {
        success: false,
        enrollments: [],
        count: 0,
        message: 'Failed to fetch enrollments'
      };
    }
  },

  async approveEnrollment(request: ApproveEnrollmentRequest): Promise<ApproveEnrollmentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/approve-enrollment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving enrollment:', error);
      return {
        success: false,
        message: 'Failed to process enrollment'
      };
    }
  },

  async rejectEnrollment(enrollmentId: number, managementUserId: number, reason?: string): Promise<ApproveEnrollmentResponse> {
    return this.approveEnrollment({
      enrollment_id: enrollmentId,
      action: 'reject',
      management_user_id: managementUserId,
      rejection_reason: reason
    });
  },

  async fetchIdps(status: string = 'pending'): Promise<FetchIdpsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/pending-idps.php?status=${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IDPs:', error);
      return {
        success: false,
        idps: [],
        count: 0,
        message: 'Failed to fetch IDPs'
      };
    }
  },

  async approveIdp(request: ApproveIdpRequest): Promise<ApproveIdpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/approve-idp.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        return {
          success: false,
          message: `HTTP ${response.status}: ${errorText}`
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving IDP:', error);
      return {
        success: false,
        message: 'Failed to process IDP'
      };
    }
  },

  async fetchSatna(year: number): Promise<FetchSatnaResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/skill-audits.php?year=${year}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching SATNA submissions:', error);
      return {
        success: false,
        audits: [],
        count: 0,
        message: 'Failed to fetch SATNA submissions',
      };
    }
  },

  async fetchTeacherRatings(): Promise<FetchTeacherRatingsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/management/teacher-ratings.php`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching teacher ratings:', error);
      return {
        success: false,
        ratings: [],
        summaries: [],
        count: 0,
        message: 'Failed to fetch teacher ratings',
      };
    }
  },
};
