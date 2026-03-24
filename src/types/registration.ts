import { UserType } from "@/constants/userTypes";

export interface RegistrationFormData {
  // Account Details
  username: string;
  email: string;
  password: string;
  userType: UserType;

  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  dateOfBirth: string;
  sex: string;
  bloodType?: string;
  civilStatus: string;
  typeOfDisability?: string;
  religion?: string;
  educationalAttainment: string;

  // Address
  houseNoAndStreet: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;

  // Contact Information
  cellphoneNumber: string;

  // Employment Details
  typeOfEmployment?: string;
  civilServiceEligibilityLevel?: string;
  salaryGrade?: string;
  presentPosition?: string;
  office?: string;
  service?: string;
  divisionProvince?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactAddress?: string;
  emergencyContactNumber?: string;
}
