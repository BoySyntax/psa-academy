import { useState, lazy, Suspense } from "react";
import SupabaseAuthPage from "./SupabaseAuthPage";
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
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { UserType } from "@/constants/userTypes";
import { motion } from "framer-motion";

// Lazy load heavy components to reduce initial bundle size
const UserManagement = lazy(() => import("./admin/UserManagement"));
const CourseManagement = lazy(() => import("./admin/CourseManagement"));
const ContentManagement = lazy(() => import("./admin/ContentManagement"));
const CreateUser = lazy(() => import("./admin/CreateUser"));
const EditUser = lazy(() => import("./admin/EditUser"));
const AdminAssessments = lazy(() => import("./admin/AdminAssessments"));
const TrainerList = lazy(() => import("./admin/TrainerList"));
const CreateCourse = lazy(() => import("./admin/CreateCourse"));
const EditCourse = lazy(() => import("./admin/EditCourse"));
const CapacityDevelopmentPlan = lazy(() => import("./admin/CapacityDevelopmentPlan"));
const MyCourses = lazy(() => import("./student/MyCourses"));
const AvailableCourses = lazy(() => import("./student/AvailableCourses"));
const CourseViewer = lazy(() => import("./student/CourseViewer"));
const CourseOverview = lazy(() => import("./student/CourseOverview"));
const TeacherCourses = lazy(() => import("./teacher/TeacherCourses"));
const TeacherStudents = lazy(() => import("./teacher/TeacherStudents"));
const EnrollmentApprovals = lazy(() => import("./management/EnrollmentApprovals"));
const IdpApprovals = lazy(() => import("./management/IdpApprovals"));
const StudentGrades = lazy(() => import("./teacher/StudentGrades"));
const DashboardIDP = lazy(() => import("./DashboardIDP"));
const CareerLeverageSubmissions = lazy(() => import("./management/CareerLeverageSubmissions"));
const SatnaSubmissions = lazy(() => import("./management/SatnaSubmissions"));
const TeacherRatings = lazy(() => import("./management/TeacherRatings"));
const StudentAssessments = lazy(() => import("./student/StudentAssessments"));
const ImpactEvaluations = lazy(() => import("./management/ImpactEvaluations"));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
    />
  </div>
);

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

  const handleLoginSuccess = (userData: {
    id: string | number;
    email?: string;
    firstName?: string;
    lastName?: string;
    userType?: UserType;
  }) => {
    // Convert Supabase user to expected format
    const user = {
      id: typeof userData.id === 'string' ? parseInt(userData.id) || 0 : userData.id,
      firstName: userData.firstName || userData.email?.split('@')[0] || 'User',
      lastName: userData.lastName || '',
      userType: userData.userType,
    };
    setUser(user);
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
    return <SupabaseAuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render appropriate dashboard based on user type
  const renderDashboard = () => {
    if (!currentUserType) {
      return <DashboardHome user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }

    switch (currentUserType) {
      case "student":
        return (
          <Suspense fallback={<PageLoader />}>
            <CourseOverview user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
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
      return (
        <Suspense fallback={<PageLoader />}>
          <EditUser user={user} onNavigate={handleNavigate} onLogout={handleLogout} userId={userId} />
        </Suspense>
      );
    }

    if (dashboardPage.startsWith("edit-course/")) {
      const courseId = dashboardPage.slice("edit-course/".length);
      return (
        <Suspense fallback={<PageLoader />}>
          <EditCourse onNavigate={handleNavigate} courseId={courseId} />
        </Suspense>
      );
    }

    switch (dashboardPage) {
      case "home":
        return renderDashboard();
      case "profile":
        return <DashboardProfile user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "career-leverage-inventory":
        return <CareerLeverageInventory user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "idp":
        return (
          <Suspense fallback={<PageLoader />}>
            <DashboardIDP user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "edit-profile":
        return <EditProfile user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "documents":
        return <DashboardDocuments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "settings":
        return <DashboardSettings user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "users":
        return (
          <Suspense fallback={<PageLoader />}>
            <UserManagement user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "trainers":
        return (
          <Suspense fallback={<PageLoader />}>
            <TrainerList user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "admin-career-leverage":
        return (
          <Suspense fallback={<PageLoader />}>
            <AdminAssessments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "create-user":
        return (
          <Suspense fallback={<PageLoader />}>
            <CreateUser user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "courses":
        return (
          <Suspense fallback={<PageLoader />}>
            <CourseManagement user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "capacity-development-plan":
        return (
          <Suspense fallback={<PageLoader />}>
            <CapacityDevelopmentPlan user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "content":
        return (
          <Suspense fallback={<PageLoader />}>
            {currentUserType ? (
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
            )}
          </Suspense>
        );
      case "create-course":
        return (
          <Suspense fallback={<PageLoader />}>
            <CreateCourse onNavigate={handleNavigate} />
          </Suspense>
        );
      case "course-overview":
        return renderDashboard();
      case "teacher-courses":
        return (
          <Suspense fallback={<PageLoader />}>
            <TeacherCourses teacherId={user?.id.toString() || ""} onNavigate={handleNavigate} />
          </Suspense>
        );
      case "students":
        return (
          <Suspense fallback={<PageLoader />}>
            <TeacherStudents teacherId={user?.id.toString() || ""} onNavigate={handleNavigate} />
          </Suspense>
        );
      case "my-courses":
        return (
          <Suspense fallback={<PageLoader />}>
            <MyCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "available-courses":
        return (
          <Suspense fallback={<PageLoader />}>
            <AvailableCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "course-viewer":
        return selectedCourseId ? (
          <Suspense fallback={<PageLoader />}>
            <CourseViewer 
              courseId={selectedCourseId} 
              user={user}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}>
            <MyCourses user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "enrollments":
        return (
          <Suspense fallback={<PageLoader />}>
            <EnrollmentApprovals user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "idp-approvals":
        return (
          <Suspense fallback={<PageLoader />}>
            <IdpApprovals user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "satna-submissions":
        return (
          <Suspense fallback={<PageLoader />}>
            <SatnaSubmissions user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "career-leverage-submissions":
        return (
          <Suspense fallback={<PageLoader />}>
            <CareerLeverageSubmissions user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "teacher-ratings":
        return (
          <Suspense fallback={<PageLoader />}>
            <TeacherRatings user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "impact-evaluations":
        return (
          <Suspense fallback={<PageLoader />}>
            <ImpactEvaluations user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "student-grades":
        return (
          <Suspense fallback={<PageLoader />}>
            <StudentGrades user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
      case "student-assessments":
        return (
          <Suspense fallback={<PageLoader />}>
            <StudentAssessments user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
          </Suspense>
        );
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

