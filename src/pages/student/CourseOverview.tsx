import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Grid, List, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { enrollmentService, Enrollment } from "@/services/enrollment";
import StudentHeaderActions from "@/components/StudentHeaderActions";
import { getImageUrl } from "@/lib/apiHelper";
import SkillAuditDialog from "@/components/SkillAuditDialog";
import TeacherRatingDialog from "@/components/TeacherRatingDialog";
import { skillAuditService } from "@/services/skillAudit";
import { profileService } from "@/services/profile";
import { teacherRatingService } from "@/services/teacherRating";

interface CourseOverviewProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string, courseId?: number) => void;
  onLogout: () => void;
}

const CourseOverview = ({ user, onNavigate, onLogout }: CourseOverviewProps) => {
  const { toast } = useToast();
  const studentId = user.id.toString();
  const currentYear = new Date().getFullYear();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(" ");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  const [skillAuditOpen, setSkillAuditOpen] = useState(false);
  const [skillAuditChecked, setSkillAuditChecked] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSubmitted, setAuditSubmitted] = useState<boolean | null>(null);
  const [ratingDialogEnrollment, setRatingDialogEnrollment] = useState<Enrollment | null>(null);
  const [teacherRatingSubmitted, setTeacherRatingSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [studentId]);

  useEffect(() => {
    const checkSkillAudit = async () => {
      if (!user?.id || skillAuditChecked) return;

      setAuditLoading(true);

      try {
        const [auditResult, profileResult] = await Promise.all([
          skillAuditService.getStatus(user.id, currentYear),
          profileService.getProfile(user.id.toString()),
        ]);

        if (auditResult.success) {
          setAuditSubmitted(!!auditResult.submitted);

          // Always preload so the user can open the dialog via button instantly.
          setAuditData({
            audit: auditResult.audit,
            profile: profileResult.success ? profileResult.profile : null,
          });

          if (!auditResult.submitted) {
            setSkillAuditOpen(true);
          }
        } else {
          setAuditSubmitted(null);
        }
      } finally {
        setAuditLoading(false);
        setSkillAuditChecked(true);
      }
    };

    checkSkillAudit();
  }, [user?.id, skillAuditChecked, currentYear]);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchQuery, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch enrolled courses
    const enrolledResult = await enrollmentService.getMyEnrollments(studentId);
    if (enrolledResult.success) {
      setEnrollments(enrolledResult.enrollments);

      const completedWithTeacher = (enrolledResult.enrollments || []).filter(
        (e) => e.status === "completed" && !!e.course?.teacher
      );

      const results = await Promise.all(
        completedWithTeacher.map(async (e) => {
          const teacherId = e.course?.teacher?.id;
          if (!teacherId) return { key: "", submitted: false };
          const key = `${e.course_id}::${teacherId}`;
          const status = await teacherRatingService.getStatus(user.id, e.course_id, teacherId);
          return { key, submitted: !!status.submitted };
        })
      );

      setTeacherRatingSubmitted((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.key) next[r.key] = r.submitted;
        });
        return next;
      });
    }
    
    // Fetch available courses
    const availableResult = await enrollmentService.getAvailableCourses(studentId);
    if (availableResult.success) {
      setAvailableCourses(availableResult.courses);
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

  const handleEnroll = async (courseId: number) => {
    setEnrollingCourseId(courseId);
    const result = await enrollmentService.enrollInCourse(studentId, courseId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message || "Enrollment application submitted. Awaiting approval.",
      });
      fetchData(); // Refresh data
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to enroll in course",
        variant: "destructive",
      });
    }
    setEnrollingCourseId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SkillAuditDialog
        open={skillAuditOpen}
        userId={user.id}
        preloadedData={auditData}
        readOnly={auditSubmitted === true}
        onSubmitted={() => {
          setSkillAuditOpen(false);
          setAuditSubmitted(true);
        }}
        onClose={() => {
          setSkillAuditOpen(false);
        }}
      />
      {ratingDialogEnrollment?.course?.teacher && (
        <TeacherRatingDialog
          open={!!ratingDialogEnrollment}
          userId={user.id}
          courseId={ratingDialogEnrollment.course_id}
          courseName={ratingDialogEnrollment.course?.course_name || "Course"}
          teacherId={ratingDialogEnrollment.course.teacher.id}
          teacherName={`${ratingDialogEnrollment.course.teacher.first_name} ${ratingDialogEnrollment.course.teacher.last_name}`}
          onSubmitted={() => {
            setRatingDialogEnrollment(null);
          }}
          onClose={() => {
            setRatingDialogEnrollment(null);
          }}
        />
      )}
      {/* Header */}
      <div className="bg-sidebar-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Course Overview</h1>
              <div className="flex items-center gap-2">
                {auditLoading ? (
                  <Badge variant="secondary">SATNA: Checking...</Badge>
                ) : auditSubmitted === true ? (
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">SATNA {currentYear}: Submitted</Badge>
                ) : auditSubmitted === false ? (
                  <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">SATNA {currentYear}: Not submitted</Badge>
                ) : (
                  <Badge variant="secondary">SATNA: Unknown</Badge>
                )}
              </div>
            </div>
          </div>

          <StudentHeaderActions user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>

      <div className="p-6">
        {/* Course Finder */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Course Finder</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* My Enrolled Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
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

          {/* Enrolled Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No enrolled courses yet</p>
              <p className="text-sm text-muted-foreground mt-2">Browse available courses below to get started</p>
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
                  <div
                    className={`bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${
                      viewMode === "grid" ? "h-40" : "w-48 h-full"
                    }`}
                  >
                    {getImageUrl(enrollment.course?.thumbnail_url) ? (
                      <img
                        src={getImageUrl(enrollment.course?.thumbnail_url)!}
                        alt={enrollment.course?.course_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-primary" />
                    )}
                  </div>

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

                    {enrollment.course?.teacher && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Teacher: {enrollment.course.teacher.first_name} {enrollment.course.teacher.last_name}
                      </p>
                    )}

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
                          Pending approval from management.
                        </p>
                      </div>
                    )}

                    {enrollment.status === 'rejected' && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Application not approved.
                        </p>
                      </div>
                    )}

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

                    {enrollment.status === "completed" && enrollment.course?.teacher && (
                      (() => {
                        const key = `${enrollment.course_id}::${enrollment.course.teacher.id}`;
                        const already = !!teacherRatingSubmitted[key];
                        if (already) return null;
                        return (
                          <Button
                            variant="outline"
                            className="w-full mt-2"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRatingDialogEnrollment(enrollment);
                            }}
                          >
                            Rate Teacher
                          </Button>
                        );
                      })()
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses Section */}
        {availableCourses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Available Courses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 h-40 flex items-center justify-center">
                    {getImageUrl(course.thumbnail_url) ? (
                      <img
                        src={getImageUrl(course.thumbnail_url)!}
                        alt={course.course_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-primary" />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        {course.status}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {course.course_code}
                    </p>

                    {course.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {course.duration_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours}h
                        </div>
                      )}
                      {course.category && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.category}
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingCourseId === course.id}
                    >
                      {enrollingCourseId === course.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
