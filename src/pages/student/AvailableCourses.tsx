import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowLeft, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { enrollmentService } from "@/services/enrollment";
import StudentHeaderActions from "@/components/StudentHeaderActions";

interface AvailableCoursesProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AvailableCourses = ({ user, onNavigate, onLogout }: AvailableCoursesProps) => {
  const { toast } = useToast();
  const studentId = user.id.toString();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableCourses();
  }, [studentId]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery]);

  const fetchAvailableCourses = async () => {
    setLoading(true);
    const result = await enrollmentService.getAvailableCourses(studentId);
    
    if (result.success) {
      setCourses(result.courses);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch available courses",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.course_name.toLowerCase().includes(query) ||
          course.course_code.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingCourseId(courseId);
    const result = await enrollmentService.enrollInCourse(studentId, courseId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message || "Enrollment application submitted. Awaiting approval.",
      });
      // Refresh available courses
      fetchAvailableCourses();
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
      {/* Header */}
      <div className="bg-sidebar-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("my-courses")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Available Courses</h1>
          </div>
          </div>

          <StudentHeaderActions user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>

      <div className="p-6">
        {/* Search and Actions */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
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
            onClick={() => onNavigate("my-courses")}
          >
            View My Enrolled Courses
          </Button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No courses found matching your search" : "No courses available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Course Thumbnail */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 h-40 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.course_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-primary" />
                  )}
                </div>

                {/* Course Info */}
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

                  {/* Course Meta */}
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
                    {course.max_students && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Max {course.max_students}
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
        )}
      </div>
    </div>
  );
};

export default AvailableCourses;
