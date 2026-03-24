import { motion } from "framer-motion";
import {
  ArrowRight,
  User,
  FileText,
  Settings,
  CheckSquare,
  ClipboardList,
} from "lucide-react";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";

interface ManagementDashboardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ManagementDashboard = ({ user, onNavigate, onLogout }: ManagementDashboardProps) => {
  const quickLinks = [
    {
      icon: CheckSquare,
      title: "Enrollment Approvals",
      description: "Review and approve student applications",
      page: "enrollments",
    },
    {
      icon: ClipboardList,
      title: "IDP Approvals",
      description: "Review and approve student IDPs",
      page: "idp-approvals",
    },
    {
      icon: ClipboardList,
      title: "CLI Submissions",
      description: "View Career Leverage Inventory totals and responses",
      page: "career-leverage-submissions",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Access organizational documents",
      page: "documents",
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
      description: "Manage organizational settings",
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
              <h1 className="text-2xl font-bold text-foreground">Management Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Management Portal</p>
            </div>

            <HeaderProfileMenu
              user={user}
              roleLabel="Management"
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
            Welcome, {user.firstName}! 👔
          </h2>
          <p className="text-muted-foreground">
            Monitor organizational performance and strategic initiatives
          </p>
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
                  <link.icon className="w-6 h-6 text-purple-600" />
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

export default ManagementDashboard;
