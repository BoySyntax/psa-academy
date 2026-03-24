import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { registrationService } from "@/services/registration";
import { RegistrationFormData } from "@/types/registration";
import { USER_TYPE_OPTIONS } from "@/constants/userTypes";

interface AuthPageProps {
  onLoginSuccess?: (user: { id: number; firstName: string; lastName: string }) => void;
}

const AuthPage = ({ onLoginSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { formData, updateField } = useRegistrationForm();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  // Prevent multiple submissions
  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef(0);
  const SUBMIT_COOLDOWN = 10000; // 10 seconds between attempts

  const TERMS_AND_PRIVACY_TEXT = `PSA Academy Terms of Service and Privacy Policy

I. About PSA Academy

The PSA Academy aims to carry out in line with the PSA Strategic Plan 2024 to 2027:
Vision:  Build high-performing global leaders of dynamic and transformative statistics, civil registration, and identification services.
Mission:
Develop highly competent and professional knowledge attuned to the changing global environment;
Promote global competencies to foster a sustainable culture of innovation and inclusive development.
To achieve the vision and mission, it shall focus on targeted components of human capital development, categorized into four (4) pillars:
Foundational Courses
Technical Courses
Specialist Development Courses
Executive Classes
Founded on PSA’s vision, mission, and values, the foundational courses are linked with the organizational competencies that lead to desired outcomes.
The Specialist Development Courses support the strategic objective of developing a credible and robust HR system in the PSA by producing in-house experts in key functional areas.  Programs are targeted to specific needs aimed at enhancing the performance of roles related to the mandates of PSA.
The Executive Classes cover PSA’s leadership and managerial competencies such as Thinking Strategically, Decision Making, Developing People and Managing Performance.  These courses continuously develop leadership capacities of those who steer the agency towards the realization of its strategic goals.  As part of the ongoing career development / succession planning of the PSA, those occupying higher technical positions with high potential, are also targeted to attend the executive courses in our aim to deepen the leadership bench.
With the pursuit of continuous learning, the research and innovation pillar aims to support creative, critical, and innovative thinking, while promoting the Knowledge Management Community of Practice within the organization.

II. Commitment to Learners
We aim to promote continuous learning and growth by providing up-to-date, targeted competency-based programs that intend to strengthen existing talents and address development areas.  We also give importance and seek to contribute to the general well-being of the officials and employees, guaranteeing holistic development for learning readiness and capacity.

III. Privacy Practices
The practices of privacy and confidentiality in the PSA Academy Learning Management System are designed in compliance with the Data Privacy Act of 2012 and its implementing rules and regulations. When you create an account in our platform, you give us consent to collect, process, generate, share, and store your personal information in our database.
Our privacy policy will be updated when our processes in handling personal data and information of learners change. This will be posted in the LMS from time to time to keep the users aware of changes.

IV. Information Collected
Listed below are the following information we collect from our learners to provide a better user experience.

A.) Personal Information
This includes all the personal data you have voluntarily given to us to register and create an account in the PSA Academy LMS such as:
Your Full Name
Date of Birth (Age)
Gender
Sex
Blood Type
Civil Status
Type of Disability
Ethnicity
Religion
Educational Attainment
Address
Contact Information
Employment Details
Emergency Contact

B.) User Activities
We may collect the information about your activity in our system for the purpose of tracking your progress in your enrolled course in the LMS. Further, your site navigation history on our site may also be collected to help us in updating our features and interface, to provide a better user experience in the learning management platform. The activity information we gather may include:
Course Progress
Submission of Requirements
Grades / Scores
Training Needs Assessment
Training Hours Completed
Professional Development Action Plan
Recently Accessed/Browsed Courses
Other user activity logs

C.) User-generated Contents
We also collect the contents you create, upload, or receive from other learners when using the PSA Academy Learning Management System. This includes your username, email, learning reference number, and password for the purpose of creating your LMS account; the email you write and receive from other learners; photos and videos you uploaded to your personal LMS account, and the documents you upload as part of your course requirement.

D.) Other Personal Data
This includes other information you voluntarily shared in the PSA Academy Learning Management System and disclosed upon contacting the PSA LMS Technical Support for assistance. We also collect, use, and keep your feedback and suggestions made known to us using the customer satisfaction feedback (CSF) forms and other means to improve our online learning platform.

V. Use of Information
We use the data that we collected from the users to understand their needs and provide a better service, particularly for the following reasons:

A.) Course Participation
We use your information to facilitate your course enrollment to our programs offered, check your attendance, keep track of your participation in the course activities, and monitor the progress in your enrolled course(s).

B.) Learning and Development Needs
We use your information stored in the PSA Academy Learning Management System to identify competency gaps, conduct training needs analysis to identify future course offerings of the PSA Management, and create a learning pathway for a new curriculum under Project Hanas.

C.) Communication
We use your information to contact you regarding the status of your enrollment and send you notifications and announcements from your course instructors and administrators to keep you updated on activities related to your enrolled program. We also use your information to be able to respond to your questions, requests, concerns, and other training-related assistance that you might need.

D.) Personnel Record
We use your information in the PSA Academy Learning Management System to monitor your training hours attended for internal record keeping, verify your course completion for the processing of certificates, and other personnel movement purposes.

E.) Report Generation
We use the Learners’ Information in the PSA Academy Learning Management System to generate a usage report to identify the number of PSA Employees enrolled in the courses offered by the PSA Academy LMS;
Identify the number of employees who completed the courses;
Measure the learning effectiveness of the course content and teaching methodologies,
Create a customer satisfaction feedback report in courses completed by the learners per batch.

F.) Any other purposes subject to compliance within the provisions of Rule V, Section 21 of the Implementing Rules and Regulations (IRR) of RA 10173, otherwise known as the Data Privacy Act (DPA) of 2012 as follows:
The data subject must have given his or her consent prior to the collection, or as soon as practicable and reasonable;
The processing involves the personal information of a data subject who is a party to a contractual agreement, in order to fulfill obligations under the contract or to take steps at the request of the data subject prior to entering the said agreement;
The processing is necessary for compliance with a legal obligation to which the personal information controller is subject;
The processing is necessary to protect vitally important interests of the data subject, including his or her life and health;
The processing of personal information is necessary to respond to national emergency or to comply with the requirements of public order and safety, as prescribed by law;
The processing of personal information is necessary for the fulfillment of the constitutional or statutory mandate of a public authority; or
The processing is necessary to pursue the legitimate interests of the personal information controller, or by a third party or parties to whom the data is disclosed, except where such interests are overridden by fundamental rights and freedoms of the data subject, which require protection under the Philippine Constitution.

VI. Information Sharing
The information we collect from your personal account in the PSA Academy Learning Management System is shared with the following parties for your personal development and for the benefit of the Community of Learners in PSA Academy:
A.) Course Instructors - your information, including any content that you created in fulfillment of course activities, such as discussion forums or assignments, will be shared with the instructors of the course offerings you enrolled in.
B.) System Administrators – your personal information shared in the PSA Academy Learning Management System are shared with the system administrators to provide you with the technical support you may require for a better user experience in our online learning platform.
C.) Other Course Participants - as a participant in a course, your profile and any content that you created and submitted in course activities may be viewed by all other course participants, in addition to the course instructors.
D.) Third-Party Software – your personal Information may be shared with the Human Resource Information System (IHRIS) of the Human Resource Division for internal record keeping and any other purposes related to your employment in the PSA.
E.) Any government authority asking for your personal data in writing, provided that it does not fall under the exceptions to the right of access to information of Executive Order No. 2, series of 2016 or the Freedom of Information Act (FOI) or there is a court order/subpoena addressed to the PSA Academy, to comply with the legal process.

VII. Data Protection
The PSA Academy is committed to exercising due diligence to maintain the Privacy and Confidentiality of the Learners’ Personal Information stored in the PSA Academy Learning Management System. We have established appropriate physical, technical, and organizational security measures in our platform to safeguard the data against accidental and unlawful loss or destruction; alteration or contamination; physical security breach; data breach; accidental exposure to unauthorized personnel; unauthorized disclosure of collected personal information; and other means of unlawful processing of information of the data in the PSA Academy Learning Management System, thus, preserving the Integrity of the Online Learning Platform.
Any person or entity who knowingly and unlawfully violated the data confidentiality and security measures of the PSA Academy Learning Management System; or process the personal information without the consent of the data subject or under the existing laws shall be penalized depending on the degree of violation(s) as defined in Rule XIII of Implementing Rules and Regulations (IRR) of Republic Act 10173 or otherwise known as the Data Privacy Act (DPA) of 2012 and other existing laws.

VIII. Retention Period
The personal information you shared with us shall be retained in the PSA Academy Learning Management System for as long as necessary to the fulfillment of its purpose of why it was collected; or as needed to meet other requirements in relation to your employment in the Philippine Statistics Authority.

IX. Limitations of Liability

A.) Unauthorized Use and User Negligence
Under no circumstances shall the PSA Academy be held liable for any incidental damage, breach, or loss of your personal data as a result of your negligent acts, omissions, or willful misconduct in using your account. This includes but is not limited to the installation of unauthorized third-party software or browser extensions to be integrated into the platform or the use of your log-in credentials in our online learning platform to other suspicious websites not related to the PSA Academy Learning Management System. And any other unnecessary actions resulting in theft, financial loss, security breaches; or causing potential harm to the system.

X. User’s Rights and Obligations

1.) Declaration of User’s Rights
Pursuant to the Rule VIII of Implementing Rules and Regulations (IRR) of Republic Act 10173 or otherwise known as the Data Privacy Act (DPA) of 2012, users of the PSA Academy Learning Management System are entitled to the following rights:

A. Right to be informed.
1. The data subject has a right to be informed whether personal data pertaining to him or her shall be, are being, or have been processed, including the existence of automated decision-making and profiling.
2. The data subject shall be notified and furnished with information indicated hereunder before the entry of his or her personal data into the processing system of the personal information controller, or at the next practical opportunity:
a) Description of the personal data to be entered into the system;
b) Purposes for which they are being or will be processed, including processing for profiling or historical, statistical or scientific purpose;
c) Basis of processing, when processing is not based on the consent of the data subject;
d) Scope and method of the personal data processing;
e) The recipients or classes of recipients to whom the personal data are or may be disclosed;
f) Methods utilized for automated access, if the same is allowed by the data subject, and the extent to which such access is authorized, including meaningful information about the logic involved, as well as the significance and the envisaged consequences of such processing for the data subject;
g) The identity and contact details of the personal data controller or its representative;
h) The period for which the information will be stored; and
i) The existence of their rights as data subjects, including the right to access, correction, and object to the processing, as well as the right to lodge a complaint before the Commission.

B. Right to object.
The data subject shall have the right to object to the processing of his or her personal data, including processing for direct marketing, automated processing or profiling. The data subject shall also be notified and given an opportunity to withhold consent to the processing in case of changes or any amendment to the information supplied or declared to the data subject in the preceding paragraph.
When a data subject objects or withholds consent, the personal information controller shall no longer process the personal data, unless:
1. The personal data is needed pursuant to a subpoena;
2. The collection and processing are for obvious purposes, including, when it is necessary for the performance of or in relation to a contract or service to which the data subject is a party, or when necessary or desirable in the context of an employer-employee relationship between the collector and the data subject; or
3. The information is being collected and processed as a result of a legal obligation.

C. Right to Access.
The data subject has the right to reasonable access to, upon demand, the following:
1. Contents of his or her personal data that were processed;
2. Sources from which personal data were obtained;
3. Names and addresses of recipients of the personal data;
4. Manner by which such data were processed;
5. Reasons for the disclosure of the personal data to recipients, if any;
6. Information on automated processes where the data will, or is likely to, be made as the sole basis for any decision that significantly affects or will affect the data subject;
7. Date when his or her personal data concerning the data subject were last accessed and modified; and
8. The designation, name or identity, and address of the personal information controller.

D. Right to rectification.
The data subject has the right to dispute the inaccuracy or error in the personal data and have the personal information controller correct it immediately and accordingly, unless the request is vexatious or otherwise unreasonable. If the personal data has been corrected, the personal information controller shall ensure the accessibility of both the new and the retracted information and the simultaneous receipt of the new and the retracted information by the intended recipients thereof: Provided, That recipients or third parties who have previously received such processed personal data shall be informed of its inaccuracy and its rectification, upon reasonable request of the data subject.

E. Right to Erasure or Blocking.
The data subject shall have the right to suspend, withdraw or order the blocking, removal or destruction of his or her personal data from the personal information controller’s filing system.
1. This right may be exercised upon discovery and substantial proof of any of the following:
a) The personal data is incomplete, outdated, false, or unlawfully obtained;
b) The personal data is being used for a purpose not authorized by the data subject;
c) The personal data is no longer necessary for the purposes for which they were collected;
d) The data subject withdraws consent or objects to the processing, and there is no other legal ground or overriding legitimate interest for the processing;
e) The personal data concerns private information that is prejudicial to data subject, unless justified by freedom of speech, of expression, or of the press or otherwise authorized;
f) The processing is unlawful;
g) The personal information controller or personal information processor violated the rights of the data subject.
2. The personal information controller may notify third parties who have previously received such processed personal information.

F. Right to damages.
The data subject shall be indemnified for any damages sustained due to such inaccurate, incomplete, outdated, false, unlawfully obtained or unauthorized use of personal data, taking into account any violation of his or her rights and freedoms as the data subject.

2.) Declaration of User’s Responsibilities
This terms of service and privacy policy describe below the responsibilities of the user of PSA Academy Learning Management System:
It is the responsibility of the user of Learner’s account in the PSA Academy Learning Management System to observe the basic practices of protecting the platform and the stored personal data in the system against unintended use, such as installing third-party software or browser extension to integrate into the PSA Learning Management System.
It is the responsibility of the user to keep his or her username and personal password private at all times and avoid using them on other online platforms to avoid data leaks.
It is the responsibility of the user to input his or her information correctly and accurately in the PSA Academy Learning Management System to avoid data contamination or error when processing a request for credentials.
It is the responsibility of the user to be aware of uploading contents or documents as part of the course requirement in the program in which he or she is enrolled.
It is the responsibility of the user to be careful in including any sensitive information about him or herself on content that he or she submit such as in quizzes, exams, assignments, activities, and surveys.
It is the responsibility of the users of the PSA Learning Management System to keep updated with the changes in our terms of service and privacy policy and reserves the right to withdraw the participation in the course enrolled and future course offerings, should the changes made are perceived to be a threat to the safety of own data or personal information.
It is the responsibility of the user to report to the PSA Academy any suspected data breach in his or her own account.

XI. Privacy Policy Amendments
The PSA Academy reserves the right, at its sole discretion, to amend, modify, add, remove, or otherwise revise a portion of this terms of service and privacy policy anytime. Further, any changes or amendments made will be posted in our system. Likewise, the most updated version of this policy will supersede the previous versions.

XII. Contact Us
Should you have any concerns or clarifications regarding our data privacy policy, practices, and measures, you may contact us through our email at rsso10crasd@psa.gov.ph.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple concurrent submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }
    
    // Prevent rapid successive submissions
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current;
    
    if (timeSinceLastSubmit < SUBMIT_COOLDOWN) {
      const secondsToWait = Math.ceil((SUBMIT_COOLDOWN - timeSinceLastSubmit) / 1000);
      setMessage({
        type: "error",
        text: `Please wait ${secondsToWait} seconds before trying again`,
      });
      return;
    }
    
    lastSubmitTimeRef.current = now;
    isSubmittingRef.current = true;
    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // Login
        const result = await registrationService.loginUser(
          username,
          password
        );
        if (result.success) {
          const normalizedId = Number((result.user as any)?.id ?? (result.user as any)?.user_id);
          if (!Number.isFinite(normalizedId) || normalizedId <= 0) {
            setMessage({ type: "error", text: "Login failed: missing user id" });
            setIsLoading(false);
            return;
          }

          setMessage({ type: "success", text: result.message });
          // Reset login fields
          setUsername("");
          setPassword("");
          setShowPassword(false);
          // Call the callback after a short delay to show the success message
          if (onLoginSuccess && result.user) {
            setTimeout(() => {
              onLoginSuccess({
                ...result.user,
                id: normalizedId,
              });
            }, 500);
          }
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } else {
        // Register - validate passwords match
        if (formData.password !== confirmPassword) {
          setMessage({ type: "error", text: "Passwords do not match" });
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage({ type: "error", text: "Password must be at least 6 characters" });
          setIsLoading(false);
          return;
        }

        if (!agreeToTerms) {
          setMessage({ type: "error", text: "You must agree to the Terms of Service and Privacy Policy" });
          setIsLoading(false);
          return;
        }

        if (!hasViewedTerms) {
          setMessage({ type: "error", text: "Please read the Terms of Service and Privacy Policy first" });
          setIsLoading(false);
          return;
        }

        const result = await registrationService.registerUser(
          formData as RegistrationFormData
        );
        if (result.success) {
          setMessage({ type: "success", text: "Account created! You can now sign in." });
          // Reset form
          setConfirmPassword("");
          setShowPassword(false);
          // Switch to login tab
          setTimeout(() => setIsLogin(true), 2000);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authBg}
          alt="Abstract art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/30" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-light leading-relaxed text-foreground/90 max-w-md"
          >
            Where creativity
            <br />
            meets <span className="text-primary font-semibold">simplicity</span>.
          </motion.p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ●&nbsp; PSA Academy
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {["Sign In", "Sign Up"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(i === 0);
                  if (i === 0) {
                    setAgreeToTerms(false);
                    setHasViewedTerms(false);
                  }
                }}
                className={`relative flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  (i === 0 ? isLogin : !isLogin)
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-blue-600"
                }`}
              >
                {(i === 0 ? isLogin : !isLogin) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Message Display */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {!isLogin && (
                <Accordion type="multiple" className="w-full">
                  {/* Personal Information */}
                  <AccordionItem value="personal-info">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Personal Information
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => updateField("firstName", e.target.value)}
                              placeholder="Enter your first name"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Middle Name
                            </label>
                            <input
                              type="text"
                              value={formData.middleName}
                              onChange={(e) => updateField("middleName", e.target.value)}
                              placeholder="Enter your middle name"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => updateField("lastName", e.target.value)}
                              placeholder="Enter your last name"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Suffix
                            </label>
                            <input
                              type="text"
                              value={formData.suffix}
                              onChange={(e) => updateField("suffix", e.target.value)}
                              placeholder="Jr., Sr., III, etc."
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => updateField("dateOfBirth", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Sex <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.sex}
                              onChange={(e) => updateField("sex", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            >
                              <option value="">Select sex</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Blood Type
                            </label>
                            <select
                              value={formData.bloodType}
                              onChange={(e) => updateField("bloodType", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            >
                              <option value="">Select blood type</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Civil Status <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.civilStatus}
                              onChange={(e) => updateField("civilStatus", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            >
                              <option value="">Select civil status</option>
                              <option value="single">Single</option>
                              <option value="married">Married</option>
                              <option value="divorced">Divorced</option>
                              <option value="widowed">Widowed</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Type of Disability
                            </label>
                            <select
                              value={formData.typeOfDisability}
                              onChange={(e) => updateField("typeOfDisability", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            >
                              <option value="">Select type of disability</option>
                              <option value="none">None</option>
                              <option value="physical">Physical</option>
                              <option value="visual">Visual</option>
                              <option value="hearing">Hearing</option>
                              <option value="mental">Mental</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Religion
                            </label>
                            <select
                              value={formData.religion}
                              onChange={(e) => updateField("religion", e.target.value)}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            >
                              <option value="">Select religion</option>
                              <option value="catholic">Catholic</option>
                              <option value="protestant">Protestant</option>
                              <option value="islam">Islam</option>
                              <option value="buddhism">Buddhism</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Educational Attainment <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.educationalAttainment}
                            onChange={(e) => updateField("educationalAttainment", e.target.value)}
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                          >
                            <option value="">Select educational attainment</option>
                            <option value="elementary">Elementary</option>
                            <option value="high-school">High School</option>
                            <option value="college">College</option>
                            <option value="masters">Master's Degree</option>
                            <option value="phd">PhD</option>
                          </select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Address */}
                  <AccordionItem value="address">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Address
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            House No. and Street <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.houseNoAndStreet}
                            onChange={(e) => updateField("houseNoAndStreet", e.target.value)}
                            placeholder="Enter house number and street"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Barangay <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.barangay}
                              onChange={(e) => updateField("barangay", e.target.value)}
                              placeholder="Enter barangay"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Municipality <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.municipality}
                              onChange={(e) => updateField("municipality", e.target.value)}
                              placeholder="Enter municipality"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Province <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.province}
                              onChange={(e) => updateField("province", e.target.value)}
                              placeholder="Enter province"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Region <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.region}
                              onChange={(e) => updateField("region", e.target.value)}
                              placeholder="Enter region"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Contact Information */}
                  <AccordionItem value="contact-info">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Contact Information
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Cellphone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.cellphoneNumber}
                            onChange={(e) => updateField("cellphoneNumber", e.target.value)}
                            placeholder="0917 123 4567 or +63 917 123 4567"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="Enter email address"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Employment Details */}
                  <AccordionItem value="employment">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Employment Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Type of Employment
                            </label>
                            <select
                              value={formData.typeOfEmployment}
                              onChange={(e) => updateField("typeOfEmployment", e.target.value)}
                              disabled={isLoading}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select type of employment</option>
                              <option value="government">Government</option>
                              <option value="private">Private</option>
                              <option value="self-employed">Self-employed</option>
                              <option value="unemployed">Unemployed</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Civil Service Eligibility Level
                            </label>
                            <select
                              value={formData.civilServiceEligibilityLevel}
                              onChange={(e) => updateField("civilServiceEligibilityLevel", e.target.value)}
                              disabled={isLoading}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select civil service eligibility level</option>
                              <option value="none">None</option>
                              <option value="sub-professional">Sub-professional</option>
                              <option value="professional">Professional</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Salary Grade
                            </label>
                            <select
                              value={formData.salaryGrade}
                              onChange={(e) => updateField("salaryGrade", e.target.value)}
                              disabled={isLoading}
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select salary grade</option>
                              <option value="sg1">SG-1</option>
                              <option value="sg2">SG-2</option>
                              <option value="sg3">SG-3</option>
                              <option value="sg4">SG-4</option>
                              <option value="sg5">SG-5</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Present Position
                            </label>
                            <input
                              type="text"
                              value={formData.presentPosition}
                              onChange={(e) => updateField("presentPosition", e.target.value)}
                              placeholder="Enter present position"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Office
                            </label>
                            <input
                              type="text"
                              value={formData.office}
                              onChange={(e) => updateField("office", e.target.value)}
                              placeholder="Enter office"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Service
                            </label>
                            <input
                              type="text"
                              value={formData.service}
                              onChange={(e) => updateField("service", e.target.value)}
                              placeholder="Enter service"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Division/Province
                          </label>
                          <input
                            type="text"
                            value={formData.divisionProvince}
                            onChange={(e) => updateField("divisionProvince", e.target.value)}
                            placeholder="Enter division/province"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Emergency Contact */}
                  <AccordionItem value="emergency-contact">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Emergency Contact
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Name of Contact Person
                            </label>
                            <input
                              type="text"
                              value={formData.emergencyContactName}
                              onChange={(e) => updateField("emergencyContactName", e.target.value)}
                              placeholder="Enter emergency contact name"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={formData.emergencyContactRelationship}
                              onChange={(e) => updateField("emergencyContactRelationship", e.target.value)}
                              placeholder="Enter relationship"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Contact Address
                          </label>
                          <input
                            type="text"
                            value={formData.emergencyContactAddress}
                            onChange={(e) => updateField("emergencyContactAddress", e.target.value)}
                            placeholder="Enter contact address"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Contact Number
                          </label>
                          <input
                            type="tel"
                            value={formData.emergencyContactNumber}
                            onChange={(e) => updateField("emergencyContactNumber", e.target.value)}
                            placeholder="Enter contact number"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Account Details */}
                  <AccordionItem value="account-details">
                    <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                      Account Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => updateField("username", e.target.value)}
                            placeholder="Choose a username"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => updateField("password", e.target.value)}
                              placeholder="Create password"
                              className="w-full rounded-lg border border-border bg-input px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 transition-colors"
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            User Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.userType}
                            onChange={(e) => updateField("userType", e.target.value)}
                            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          >
                            {USER_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select your role in the system
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              )}

              {isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-border bg-input px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading || !hasViewedTerms}
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                        setHasViewedTerms(true);
                      }}
                    >
                      Terms of Service and Privacy Policy
                    </a>
                    {!hasViewedTerms && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                </div>
              )}

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                type="submit"
                disabled={isLoading || (!isLogin && !agreeToTerms)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-blue-600 transition-colors auth-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{isLogin ? "Signing in..." : "Creating Account..."}</span>
                  </div>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-3 text-sm font-medium text-foreground hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-3 text-sm font-medium text-foreground hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </motion.form>
          </AnimatePresence>

          
          <Dialog open={showTerms} onOpenChange={setShowTerms}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>PSA Academy Terms of Service and Privacy Policy</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {TERMS_AND_PRIVACY_TEXT}
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
