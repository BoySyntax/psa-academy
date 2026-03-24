import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Upload, FileText, Trash2, ChevronDown, ChevronRight, Users, Clock, Plus, Edit, FolderPlus, Video, FileQuestion, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { teacherService, TeacherCourse, LearningMaterial } from "@/services/teacher";
import { contentService, CreateModuleData, CreateLessonData, LessonType } from "@/services/content";
import TestManagementDialog from "@/components/TestManagementDialog";
import CourseTestsDialog from "@/components/CourseTestsDialog";
import { ModuleTest, moduleTestsService, TestType } from "@/services/moduleTests";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeacherCoursesProps {
  teacherId: string;
  onNavigate: (page: string) => void;
}

const TeacherCourses = ({ teacherId, onNavigate }: TeacherCoursesProps) => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [courseContent, setCourseContent] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [moduleTestsByModuleId, setModuleTestsByModuleId] = useState<Record<number, ModuleTest[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleForm, setModuleForm] = useState({ module_name: "", description: "" });
  const [savingModule, setSavingModule] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({
    lesson_title: "",
    lesson_content: "",
    lesson_type: "reading" as LessonType,
    duration_minutes: 0,
    is_published: true,
  });
  const [savingLesson, setSavingLesson] = useState(false);

  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testModuleId, setTestModuleId] = useState<number | null>(null);
  const [testModuleName, setTestModuleName] = useState<string>("");
  const [testType, setTestType] = useState<TestType>("pre_test");
  const [existingTest, setExistingTest] = useState<ModuleTest | undefined>(undefined);
  const [courseTestsDialogOpen, setCourseTestsDialogOpen] = useState(false);

  const getAccurateDurationMinutes = (content: any) => {
    const modules = content?.modules || [];
    let total = 0;
    for (const m of modules) {
      const lessons = m?.lessons || [];
      for (const l of lessons) {
        const minutes = Number(l?.duration_minutes || 0);
        if (!Number.isNaN(minutes) && minutes > 0) total += minutes;
      }
    }
    return total;
  };

  const formatDuration = (totalMinutes: number) => {
    const minutes = Math.max(0, Math.floor(totalMinutes));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h <= 0) return `${m}m`;
    if (m <= 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    fetchCourses();
  }, [teacherId]);

  const fetchCourses = async () => {
    setLoading(true);
    const result = await teacherService.getMyCourses(teacherId);
    if (result.success) {
      setCourses(result.courses);
      if (result.courses.length > 0 && !selectedCourse) {
        handleSelectCourse(result.courses[0]);
      }
    }
    setLoading(false);
  };

  const handleSelectCourse = async (course: TeacherCourse) => {
    setSelectedCourse(course);
    const result = await teacherService.getCourseContent(course.id, teacherId);
    if (result.success) {
      setCourseContent(result);
      // Expand all modules by default
      const moduleIds = new Set<number>(result.modules.map((m: any) => m.id as number));
      setExpandedModules(moduleIds);

      // Load tests for each module (for Create/Manage buttons)
      const next: Record<number, ModuleTest[]> = {};
      for (const m of result.modules || []) {
        const testsResult = await moduleTestsService.getModuleTests(m.id);
        next[m.id] = (testsResult.success ? (testsResult.tests as ModuleTest[]) : []) || [];
      }
      setModuleTestsByModuleId(next);
    }
  };

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleUploadClick = (lesson: any) => {
    setSelectedLesson(lesson);
    setMaterialName("");
    setMaterialDescription("");
    setUploadFile(null);
    setUploadDialogOpen(true);
  };

  const openTestManager = async (module: any, type: TestType) => {
    setTestModuleId(module.id);
    setTestModuleName(module.module_name || "");
    setTestType(type);
    setExistingTest(undefined);
    setTestDialogOpen(true);

    const result = await moduleTestsService.getModuleTests(module.id);
    if (result.success) {
      const found = (result.tests || []).find((t: any) => t.test_type === type);
      if (found) {
        setExistingTest(found as ModuleTest);
      }
    }
  };

  const getExistingModuleTest = (moduleId: number, type: TestType) => {
    return (moduleTestsByModuleId[moduleId] || []).find((t) => t.test_type === type);
  };

  const getCourseLevelTest = (type: TestType) => {
    // Use the first module as a proxy for course-level tests for now
    const firstModule = courseContent?.modules?.[0];
    if (!firstModule) return undefined;
    return getExistingModuleTest(firstModule.id, type);
  };

  const openCourseTestManager = (type: TestType) => {
    const firstModule = courseContent?.modules?.[0];
    if (!firstModule) {
      toast({
        title: "No Modules",
        description: "Create a module first before adding a course test.",
        variant: "destructive",
      });
      return;
    }
    openTestManager(firstModule, type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!materialName) {
        setMaterialName(file.name);
      }
    }
  };

  const handleUploadMaterial = async () => {
    if (!uploadFile || !selectedLesson || !selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const result = await teacherService.uploadMaterial(
      selectedLesson.id,
      selectedCourse.id,
      teacherId,
      uploadFile,
      materialName,
      materialDescription
    );

    if (result.success) {
      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });
      setUploadDialogOpen(false);
      // Refresh course content
      handleSelectCourse(selectedCourse);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to upload material",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    const result = await teacherService.deleteMaterial(materialId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
      // Refresh course content
      if (selectedCourse) {
        handleSelectCourse(selectedCourse);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const handleCreateModuleClick = () => {
    setEditingModule(null);
    setModuleForm({ module_name: "", description: "" });
    setModuleDialogOpen(true);
  };

  const handleEditModuleClick = (module: any) => {
    setEditingModule(module);
    setModuleForm({ module_name: module.module_name, description: module.description || "" });
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!selectedCourse || !moduleForm.module_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Module name is required",
        variant: "destructive",
      });
      return;
    }

    setSavingModule(true);
    let result;

    if (editingModule) {
      // Update existing module
      result = await contentService.updateModule(editingModule.id, moduleForm);
    } else {
      // Create new module
      const nextOrder = courseContent?.modules?.length || 0;
      result = await contentService.createModule({
        course_id: selectedCourse.id as any,
        ...moduleForm,
        order_index: nextOrder,
      });
    }

    if (result.success) {
      toast({
        title: "Success",
        description: editingModule ? "Module updated successfully" : "Module created successfully",
      });
      setModuleDialogOpen(false);
      setEditingModule(null);
      setModuleForm({ module_name: "", description: "" });
      // Refresh course content
      handleSelectCourse(selectedCourse);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to save module",
        variant: "destructive",
      });
    }
    setSavingModule(false);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module? All lessons in this module will also be deleted.")) return;

    const result = await contentService.deleteModule(moduleId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      if (selectedCourse) {
        handleSelectCourse(selectedCourse);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const handleCreateLessonClick = (module: any) => {
    setSelectedModuleForLesson(module);
    setLessonForm({
      lesson_title: "",
      lesson_content: "",
      lesson_type: "reading",
      duration_minutes: 0,
      is_published: true,
    });
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!selectedModuleForLesson || !lessonForm.lesson_title.trim()) {
      toast({
        title: "Validation Error",
        description: "Lesson title is required",
        variant: "destructive",
      });
      return;
    }

    setSavingLesson(true);
    const nextOrder = selectedModuleForLesson.lessons?.length || 0;
    const result = await contentService.createLesson({
      module_id: selectedModuleForLesson.id,
      ...lessonForm,
      order_index: nextOrder,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Lesson created successfully",
      });
      setLessonDialogOpen(false);
      setSelectedModuleForLesson(null);
      setLessonForm({
        lesson_title: "",
        lesson_content: "",
        lesson_type: "reading",
        duration_minutes: 0,
        is_published: true,
      });
      // Refresh course content
      if (selectedCourse) {
        handleSelectCourse(selectedCourse);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create lesson",
        variant: "destructive",
      });
    }
    setSavingLesson(false);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const result = await contentService.deleteLesson(lessonId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      if (selectedCourse) {
        handleSelectCourse(selectedCourse);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return "🎥";
      case "pre_test":
        return "🧪";
      case "post_test":
        return "✅";
      case "quiz":
        return "📝";
      case "assignment":
        return "📋";
      case "document":
        return "📄";
      default:
        return "📖";
    }
  };

  const getLessonTypeIcon = (type: LessonType) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "pre_test":
        return <FileQuestion className="w-4 h-4" />;
      case "post_test":
        return <FileQuestion className="w-4 h-4" />;
      case "quiz":
        return <FileQuestion className="w-4 h-4" />;
      case "assignment":
        return <FileText className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
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
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Course List Sidebar */}
        <div className="w-80 border-r border-border overflow-y-auto bg-card">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Assigned Courses</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No courses assigned</p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCourse?.id === course.id
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{course.course_name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{course.course_code}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolled_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedCourse?.id === course.id && courseContent
                          ? formatDuration(getAccurateDurationMinutes(courseContent))
                          : course.duration_hours
                            ? `${course.duration_hours}h`
                            : "0h"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCourse && courseContent ? (
            <div className="max-w-4xl mx-auto">
              {/* Course Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{selectedCourse.course_name}</h2>
                    <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>
                    <div className="flex gap-2">
                      <Badge>{selectedCourse.status}</Badge>
                      <Badge variant="outline">{selectedCourse.category}</Badge>
                      <Badge variant="outline">{formatDuration(getAccurateDurationMinutes(courseContent))}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleCreateModuleClick}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Module
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCourseTestsDialogOpen(true)}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Manage Tests
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modules and Lessons */}
              <div className="space-y-4">
                {courseContent.modules.map((module: any) => (
                  <div key={module.id} className="bg-card rounded-lg border border-border overflow-hidden">
                    {/* Module Header */}
                    <div className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{module.module_name}</h3>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{module.lessons?.length || 0} lessons</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditModuleClick(module)}
                          title="Edit Module"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(module.id)}
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="border-t border-border">
                        <div className="p-3 bg-accent/30">
                          <Button
                            size="sm"
                            onClick={() => handleCreateLessonClick(module)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                        {module.lessons && module.lessons.length > 0 && (
                          module.lessons
                            .filter(
                              (lesson: any) =>
                                lesson.lesson_type !== "pre_test" &&
                                lesson.lesson_type !== "post_test"
                            )
                            .map((lesson: any) => (
                              <div key={lesson.id} className="p-4 border-b border-border last:border-b-0">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl">{getLessonIcon(lesson.lesson_type)}</span>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-foreground mb-1">{lesson.lesson_title}</h4>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                          {lesson.lesson_type}
                                        </Badge>
                                        {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                                          <span>{lesson.duration_minutes} min</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={() => handleUploadClick(lesson)}>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Material
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      title="Delete Lesson"
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Materials List */}
                                {lesson.materials && lesson.materials.length > 0 && (
                                  <div className="mt-3 ml-11 space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground">Materials:</p>
                                    {lesson.materials.map((material: LearningMaterial) => (
                                      <div
                                        key={material.id}
                                        className="flex items-center justify-between p-2 bg-accent/50 rounded"
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <FileText className="w-4 h-4 text-primary" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                              {material.material_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {material.material_type} • {material.file_size ? `${(material.file_size / 1024).toFixed(2)} KB` : 'N/A'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <a
                                            href={material.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline"
                                          >
                                            View
                                          </a>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteMaterial(material.id)}
                                          >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a course to view content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>
              Add a new lesson to {selectedModuleForLesson?.module_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="lesson_title">Lesson Title *</Label>
              <Input
                id="lesson_title"
                value={lessonForm.lesson_title}
                onChange={(e) => setLessonForm({ ...lessonForm, lesson_title: e.target.value })}
                placeholder="e.g., Introduction to Variables"
              />
            </div>
            <div>
              <Label htmlFor="lesson_type">Lesson Type *</Label>
              <Select
                value={lessonForm.lesson_type}
                onValueChange={(value: LessonType) => setLessonForm({ ...lessonForm, lesson_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson_content">Content (Optional)</Label>
              <Textarea
                id="lesson_content"
                value={lessonForm.lesson_content}
                onChange={(e) => setLessonForm({ ...lessonForm, lesson_content: e.target.value })}
                placeholder="Lesson description or instructions"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={savingLesson || !lessonForm.lesson_title.trim()}>
              {savingLesson ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Creating...
                </>
              ) : (
                "Create Lesson"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {testModuleId !== null && (
        <TestManagementDialog
          isOpen={testDialogOpen}
          onClose={() => setTestDialogOpen(false)}
          moduleId={testModuleId}
          moduleName={testModuleName}
          testType={testType}
          existingTest={existingTest}
          onTestUpdated={async () => {
            if (testModuleId !== null) {
              const result = await moduleTestsService.getModuleTests(testModuleId);
              if (result.success) {
                const found = (result.tests || []).find((t: any) => t.test_type === testType);
                setExistingTest(found as ModuleTest | undefined);

                setModuleTestsByModuleId((prev) => ({
                  ...prev,
                  [testModuleId]: (result.tests as ModuleTest[]) || [],
                }));
              }
            }
          }}
        />
      )}

      {/* Create/Edit Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update the module information" : "Add a new module to organize your course lessons"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="module_name">Module Name *</Label>
              <Input
                id="module_name"
                value={moduleForm.module_name}
                onChange={(e) => setModuleForm({ ...moduleForm, module_name: e.target.value })}
                placeholder="e.g., Getting Started, Variables and Data Types"
              />
            </div>
            <div>
              <Label htmlFor="module_description">Description</Label>
              <Textarea
                id="module_description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="e.g., Introduction to programming concepts"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={savingModule || !moduleForm.module_name.trim()}>
              {savingModule ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  {editingModule ? "Update Module" : "Create Module"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Material Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Learning Material</DialogTitle>
            <DialogDescription>
              Upload a PDF, document, video, or other learning material for "{selectedLesson?.lesson_title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.mp3,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Allowed: PDF, DOC, PPT, XLS, ZIP, MP4, MP3, Images (Max 500MB)
              </p>
            </div>
            <div>
              <Label htmlFor="material_name">Material Name *</Label>
              <Input
                id="name"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g., Lecture Slides Week 1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                placeholder="Brief description of the material"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadMaterial} disabled={!uploadFile || uploading}>
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Tests Dialog */}
      <CourseTestsDialog
        isOpen={courseTestsDialogOpen}
        onClose={() => setCourseTestsDialogOpen(false)}
        courseId={selectedCourse?.id || 0}
        firstModuleId={courseContent?.modules?.[0]?.id ?? null}
        onTestUpdated={async () => {
          if (selectedCourse) {
            await handleSelectCourse(selectedCourse);
          }
        }}
      />
    </div>
  );
};

export default TeacherCourses;
