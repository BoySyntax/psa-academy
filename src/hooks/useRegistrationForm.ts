import { useState } from "react";
import { RegistrationFormData } from "@/types/registration";

const initialFormState: RegistrationFormData = {
  // Account Details
  username: "",
  email: "",
  password: "",
  userType: "student",

  // Personal Information
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  dateOfBirth: "",
  sex: "",
  bloodType: "",
  civilStatus: "",
  typeOfDisability: "",
  religion: "",
  educationalAttainment: "",

  // Address
  houseNoAndStreet: "",
  barangay: "",
  municipality: "",
  province: "",
  region: "",

  // Contact Information
  cellphoneNumber: "",

  // Employment Details
  typeOfEmployment: "",
  civilServiceEligibilityLevel: "",
  salaryGrade: "",
  presentPosition: "",
  office: "",
  service: "",
  divisionProvince: "",

  // Emergency Contact
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactAddress: "",
  emergencyContactNumber: "",
};

export const useRegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  const updateField = (
    field: keyof RegistrationFormData,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || "",
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateRequired = (
    requiredFields: (keyof RegistrationFormData)[]
  ): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = `${field} is required` as any;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Invalid email address" as any,
      }));
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (formData.password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters" as any,
      }));
      return false;
    }
    return true;
  };

  const validatePhoneNumber = (): boolean => {
    const phoneRegex = /^(\+?63|0)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.cellphoneNumber.replace(/\s/g, ""))) {
      setErrors((prev) => ({
        ...prev,
        cellphoneNumber: "Invalid phone number" as any,
      }));
      return false;
    }
    return true;
  };

  const validate = (): boolean => {
    const requiredFields: (keyof RegistrationFormData)[] = [
      "username",
      "email",
      "password",
      "firstName",
      "lastName",
      "dateOfBirth",
      "sex",
      "civilStatus",
      "educationalAttainment",
      "houseNoAndStreet",
      "barangay",
      "municipality",
      "province",
      "region",
      "cellphoneNumber",
    ];

    const isRequiredValid = validateRequired(requiredFields);
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPhoneValid = validatePhoneNumber();

    return isRequiredValid && isEmailValid && isPasswordValid && isPhoneValid;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateRequired,
    validateEmail,
    validatePassword,
    validatePhoneNumber,
    validate,
    resetForm,
  };
};
