import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
  Users,
  UserPlus,
  Clock,
} from "lucide-react";
import { courseService, Course, CourseStatus } from "@/services/courses";
import { adminService, User } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CourseManagement = ({ user, onNavigate, onLogout }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CourseStatus | "all">("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, filterStatus]);

  const fetchCourses = async () => {
    setLoading(true);
    const result = await courseService.getAllCourses();
    if (result.success) {
      setCourses(result.courses);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch courses",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchTeachers = async () => {
    const result = await adminService.getUsersByType("teacher");
    if (result.success) {
      setTeachers(result.users);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (filterStatus !== "all") {
      filtered = filtered.filter((course) => course.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.course_code.toLowerCase().includes(query) ||
          course.course_name.toLowerCase().includes(query) ||
          (course.category && course.category.toLowerCase().includes(query))
      );
    }

    setFilteredCourses(filtered);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignTeacherClick = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTeacherId("");
    setIsAssignTeacherDialogOpen(true);
  };

  const handleAssignTeacher = async () => {
    if (!selectedCourse || !selectedTeacherId) {
      toast({
        title: "Validation Error",
        description: "Please select a teacher",
        variant: "destructive",
      });
      return;
    }

    setAssigningTeacher(true);
    const result = await courseService.assignTeacher({
      course_id: selectedCourse.id,
      teacher_id: selectedTeacherId,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      });
      fetchCourses();
      setIsAssignTeacherDialogOpen(false);
      setSelectedCourse(null);
      setSelectedTeacherId("");
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to assign teacher",
        variant: "destructive",
      });
    }
    setAssigningTeacher(false);
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedCourse) return;

    const result = await courseService.removeTeacher(selectedCourse.id, teacherId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Teacher removed successfully",
      });
      fetchCourses();
      // Refresh the selected course data
      const updatedCourse = await courseService.getCourseById(selectedCourse.id);
      if (updatedCourse.success) {
        setSelectedCourse(updatedCourse.course);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to remove teacher",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    const result = await courseService.deleteCourse(selectedCourse.id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete course",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  const getStatusBadgeColor = (status: CourseStatus) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Course Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage all system courses</p>
            </div>

            <HeaderProfileMenu
              user={user}
              roleLabel="Admin"
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, name, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as CourseStatus | "all")}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => onNavigate("create-course")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Total Courses</p>
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {courses.filter((c) => c.status === "published").length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">
              {courses.filter((c) => c.status === "draft").length}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-sm text-muted-foreground">Archived</p>
            <p className="text-2xl font-bold text-gray-600">
              {courses.filter((c) => c.status === "archived").length}
            </p>
          </div>
        </div>

        {/* Courses Table */}
        <div className="rounded-lg border border-border bg-card">
          {loading ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
              />
              <p className="text-muted-foreground mt-4">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.course_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{course.course_code}</TableCell>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.category || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(course.status)}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {course.teacher_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {course.student_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.duration_hours ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {course.duration_hours}h
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAssignTeacherClick(course)}
                          title="Assign Teacher"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onNavigate(`edit-course/${course.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(course)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCourse?.course_name}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Course Code
                  </p>
                  <p className="text-sm">{selectedCourse.course_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge className={getStatusBadgeColor(selectedCourse.status)}>
                    {selectedCourse.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="text-sm">{selectedCourse.category || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p className="text-sm">
                    {selectedCourse.duration_hours
                      ? `${selectedCourse.duration_hours} hours`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Max Students
                  </p>
                  <p className="text-sm">{selectedCourse.max_students || "Unlimited"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Enrolled Students
                  </p>
                  <p className="text-sm">{selectedCourse.student_count || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{selectedCourse.description || "No description provided"}</p>
              </div>
              {selectedCourse.teachers && selectedCourse.teachers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Assigned Teachers
                  </p>
                  <div className="space-y-2">
                    {selectedCourse.teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between gap-2 p-2 bg-secondary rounded">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {teacher.first_name} {teacher.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">({teacher.email})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeacher(teacher.id)}
                          className="h-6 px-2"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignTeacherDialogOpen} onOpenChange={setIsAssignTeacherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher to assign to <strong>{selectedCourse?.course_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Teacher</label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignTeacherDialogOpen(false)}
              disabled={assigningTeacher}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTeacher} disabled={assigningTeacher}>
              {assigningTeacher ? "Assigning..." : "Assign Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete course{" "}
              <strong>{selectedCourse?.course_name}</strong>? This will also remove all
              enrollments and assignments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
