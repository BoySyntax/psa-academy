import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Grid, List, Clock, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { enrollmentService, Enrollment } from "@/services/enrollment";
import StudentHeaderActions from "@/components/StudentHeaderActions";
import { notificationsService } from "@/services/notifications";

interface MyCoursesProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string, courseId?: number) => void;
  onLogout: () => void;
}

const MyCourses = ({ user, onNavigate, onLogout }: MyCoursesProps) => {
  const { toast } = useToast();
  const studentId = user.id.toString();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchEnrollments();
  }, [studentId]);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchQuery, filterStatus]);

  const fetchEnrollments = async () => {
    setLoading(true);
    const result = await enrollmentService.getMyEnrollments(studentId);
    
    if (result.success) {
      setEnrollments(result.enrollments);
      
      // Mark course notifications as read when My Courses page is opened
      const approvedOrRejectedEnrollments = result.enrollments.filter(
        enrollment => enrollment.status === "enrolled" || enrollment.status === "rejected"
      );
      
      if (approvedOrRejectedEnrollments.length > 0) {
        try {
          await notificationsService.markRead(studentId);
          console.log('Course notifications marked as read');
        } catch (error) {
          console.error('Failed to mark course notifications as read:', error);
        }
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch your courses",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    if (filterStatus !== "all") {
      filtered = filtered.filter((enrollment) => enrollment.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (enrollment) =>
          enrollment.course?.course_name.toLowerCase().includes(query) ||
          enrollment.course?.course_code.toLowerCase().includes(query) ||
          enrollment.course?.category?.toLowerCase().includes(query)
      );
    }

    setFilteredEnrollments(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20";
      case "enrolled":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
      case "dropped":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
    }
  };

  const handleViewCourse = (enrollment: Enrollment) => {
    if (enrollment.status === 'pending' || enrollment.status === 'rejected') {
      return;
    }
    onNavigate("course-viewer", enrollment.course_id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-sidebar-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          </div>

          <StudentHeaderActions user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>

      <div className="p-6">
        {/* Course Finder */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Course Finder</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("available-courses")}
            >
              Browse All Courses
            </Button>
          </div>
        </div>

        {/* Course Overview Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Course overview</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-border mb-6">
            {[
              { label: "All", value: "all" },
              { label: "In progress", value: "in_progress" },
              { label: "Future", value: "enrolled" },
              { label: "Past", value: "completed" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  filterStatus === tab.value
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {filterStatus === tab.value && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses found</p>
            <Button
              onClick={() => onNavigate("available-courses")}
              className="mt-4"
            >
              Browse Available Courses
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredEnrollments.map((enrollment) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow ${
                  enrollment.status === 'pending' || enrollment.status === 'rejected' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                } ${
                  viewMode === "list" ? "flex" : ""
                }`}
                onClick={() => handleViewCourse(enrollment)}
              >
                {/* Course Thumbnail */}
                <div
                  className={`bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${
                    viewMode === "grid" ? "h-40" : "w-48 h-full"
                  }`}
                >
                  {enrollment.course?.thumbnail_url ? (
                    <img
                      src={enrollment.course.thumbnail_url}
                      alt={enrollment.course.course_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-primary" />
                  )}
                </div>

                {/* Course Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getStatusBadge(enrollment.status)}>
                      {enrollment.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                    {enrollment.course?.course_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {enrollment.course?.course_code}
                  </p>

                  {enrollment.course?.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {enrollment.course.description}
                    </p>
                  )}

                  {/* Progress */}
                  {enrollment.status !== 'pending' && enrollment.status !== 'rejected' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium text-foreground">
                          {Math.round(enrollment.progress_percentage)}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress_percentage} className="h-2" />
                    </div>
                  )}

                  {enrollment.status === 'pending' && (
                    <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-900">
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Your enrollment application is pending approval from management.
                      </p>
                    </div>
                  )}

                  {enrollment.status === 'rejected' && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Your enrollment application was not approved.
                      </p>
                    </div>
                  )}

                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {enrollment.course?.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {enrollment.course.duration_hours}h
                      </div>
                    )}
                    {enrollment.course?.category && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {enrollment.course.category}
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    disabled={enrollment.status === 'pending' || enrollment.status === 'rejected'}
                  >
                    {enrollment.status === "pending" 
                      ? "Awaiting Approval" 
                      : enrollment.status === "rejected"
                      ? "Application Rejected"
                      : enrollment.status === "completed" 
                      ? "Review Course" 
                      : "Continue Learning"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* See all link */}
        {filteredEnrollments.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="link" onClick={() => onNavigate("available-courses")}>
              See all my courses in progress →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
