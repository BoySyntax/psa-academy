import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  User,
  FileText,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { teacherStatisticsService, TeacherStatistics } from "@/services/teacherStatistics";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";

interface TeacherDashboardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TeacherDashboard = ({ user, onNavigate, onLogout }: TeacherDashboardProps) => {
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const result = await teacherStatisticsService.getTeacherStatistics(user.id.toString());
        if (result.success && result.statistics) {
          setStatistics(result.statistics);
        }
      } catch (error) {
        console.error('Failed to fetch teacher statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user.id]);

  const quickLinks = [
    {
      icon: BookOpen,
      title: "My Courses",
      description: "Manage your courses and classes",
      page: "courses",
    },
    {
      icon: Users,
      title: "My Students",
      description: "View and manage your students",
      page: "students",
    },
    {
      icon: FileText,
      title: "Assignments",
      description: "Create and grade assignments",
      page: "assignments",
    },
    {
      icon: BarChart3,
      title: "Class Analytics",
      description: "View class performance analytics",
      page: "analytics",
    },
    {
      icon: User,
      title: "My Profile",
      description: "View and edit your information",
      page: "profile",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your preferences",
      page: "settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Teacher Portal</p>
            </div>

            <HeaderProfileMenu
              user={user}
              roleLabel="Teacher"
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.firstName}! 👨‍🏫
          </h2>
          <p className="text-muted-foreground">
            Manage your courses, students, and assignments
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="p-6 rounded-lg border border-border bg-orange-50 dark:bg-orange-950/30">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-muted-foreground font-medium">My Courses</p>
            </div>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {loading ? "..." : statistics?.my_courses.toLocaleString() || "0"}
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <p className="text-sm text-muted-foreground font-medium">Total Students</p>
            </div>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? "..." : statistics?.total_students.toLocaleString() || "0"}
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-muted-foreground font-medium">Pending Assignments</p>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? "..." : statistics?.pending_assignments.toLocaleString() || "0"}
            </p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <motion.button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-left transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <link.icon className="w-6 h-6 text-orange-600" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h4 className="font-semibold text-foreground">{link.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
