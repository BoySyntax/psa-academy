import { useState } from "react";
import AuthPage from "./AuthPage";
import DashboardHome from "./DashboardHome";
import DashboardProfile from "./DashboardProfile";
import CareerLeverageInventory from "./CareerLeverageInventory";
import EditProfile from "./EditProfile";
import DashboardDocuments from "./DashboardDocuments";
import DashboardSettings from "./DashboardSettings";
import StudentDashboard from "./dashboards/StudentDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import ManagementDashboard from "./dashboards/ManagementDashboard";
import UserManagement from "./admin/UserManagement";
import CourseManagement from "./admin/CourseManagement";
import ContentManagement from "./admin/ContentManagement";
import CreateUser from "./admin/CreateUser";
import EditUser from "./admin/EditUser";
import AdminAssessments from "./admin/AdminAssessments";
import TrainerList from "./admin/TrainerList";
import CreateCourse from "./admin/CreateCourse";
import EditCourse from "./admin/EditCourse";
import CapacityDevelopmentPlan from "./admin/CapacityDevelopmentPlan";
import MyCourses from "./student/MyCourses";
import AvailableCourses from "./student/AvailableCourses";
import CourseViewer from "./student/CourseViewer";
import CourseOverview from "./student/CourseOverview";
import TeacherCourses from "./teacher/TeacherCourses";
import TeacherStudents from "./teacher/TeacherStudents";
import EnrollmentApprovals from "./management/EnrollmentApprovals";
import IdpApprovals from "./management/IdpApprovals";
import StudentGrades from "./teacher/StudentGrades";
import DashboardIDP from "./DashboardIDP";
import CareerLeverageSubmissions from "./management/CareerLeverageSubmissions";
import SatnaSubmissions from "./management/SatnaSubmissions";
import TeacherRatings from "./management/TeacherRatings";
import StudentAssessments from "./student/StudentAssessments";
import ImpactEvaluations from "./management/ImpactEvaluations";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { UserType } from "@/constants/userTypes";
import { motion } from "framer-motion";

const Index = () => {
  const { loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardPage, setDashboardPage] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    userType?: UserType;
  } | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);

  const handleLoginSuccess = (userData: { id: number; firstName: string; lastName: string; userType?: UserType }) => {
    const normalizedId = Number((userData as any).id);
    setUser({
      ...userData,
      id: Number.isFinite(normalizedId) ? normalizedId : 0,
    });
    if (userData.userType) {
      setCurrentUserType(userData.userType);
    }
    setIsLoggedIn(true);
    setDashboardPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUserType(null);
    setIsLoggedIn(false);
    setDashboardPage("home");
  };

  const handleNavigate = (page: string, courseId?: number) => {
    setDashboardPage(page);
    if (courseId !== undefined) {
      setSelectedCourseId(courseId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!isLoggedIn || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render appropriate dashboard based on user type
  const renderDashboard = () => {
    if (!currentUserType) {
      return <DashboardHome user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    switch (currentUserType) {
      case "student":
        return <CourseOverview user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "teacher":
        return <TeacherDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "management":
        return <ManagementDashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <DashboardHome user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  // Render page content based on navigation
  const renderPageContent = () => {
    if (dashboardPage.startsWith("edit-user/")) {
      const userId = dashboardPage.slice("edit-user/".length);
      return <EditUser user={user} onNavigate={handleNavigate} onLogout={handleLogout} userId={userId} />;
    }

    if (dashboardPage.startsWith("edit-course/")) {
      const courseId = dashboardPage.slice("edit-course/".length);
      return <EditCourse onNavigate={handleNavigate} courseId={courseId} />;
    }

    switch (dashboardPage) {
      case "home":
        return renderDashboard();
      case "profile":
        return <DashboardProfile user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "career-leverage-inventory":
        return <CareerLeverageInventory user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "idp":
        return <DashboardIDP user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "edit-profile":
        return <EditProfile user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "documents":
        return <DashboardDocuments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "settings":
        return <DashboardSettings user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "users":
        return <UserManagement user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "trainers":
        return <TrainerList user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "admin-career-leverage":
        return <AdminAssessments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "create-user":
        return <CreateUser user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "courses":
        return <CourseManagement user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "capacity-development-plan":
        return <CapacityDevelopmentPlan user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "content":
        return currentUserType ? (
          <ContentManagement
            user={user}
            currentUserType={currentUserType}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : (
          <ContentManagement
            user={user}
            currentUserType={"student"}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "create-course":
        return <CreateCourse onNavigate={handleNavigate} />;
      case "course-overview":
        return renderDashboard();
      case "teacher-courses":
        return <TeacherCourses teacherId={user?.id.toString() || ""} onNavigate={handleNavigate} />;
      case "students":
        return <TeacherStudents teacherId={user?.id.toString() || ""} onNavigate={handleNavigate} />;
      case "my-courses":
        return <MyCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "available-courses":
        return <AvailableCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "course-viewer":
        return selectedCourseId ? (
          <CourseViewer 
            courseId={selectedCourseId} 
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : (
          <MyCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
        );
      case "enrollments":
        return <EnrollmentApprovals user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "idp-approvals":
        return <IdpApprovals user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "satna-submissions":
        return <SatnaSubmissions user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "career-leverage-submissions":
        return <CareerLeverageSubmissions user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "teacher-ratings":
        return <TeacherRatings user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "impact-evaluations":
        return <ImpactEvaluations user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "student-grades":
        return <StudentGrades user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "student-assessments":
        return <StudentAssessments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return renderDashboard();
    }
  };

  
  return (
    <div className="flex h-screen overflow-hidden">
      {currentUserType && (
        <Sidebar
          userType={currentUserType}
          activePage={dashboardPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      <main
        style={{ willChange: "margin-left" }}
        className={`flex-1 overflow-y-auto transition-[margin] duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {renderPageContent()}
      </main>
    </div>
  );
};

export default Index;

