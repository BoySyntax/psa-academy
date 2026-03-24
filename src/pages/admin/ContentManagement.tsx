import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Video,
  File,
  Link as LinkIcon,
  Upload,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { courseService, Course } from "@/services/courses";
import { contentService, CourseModule, Lesson, LessonType } from "@/services/content";
import { moduleTestsService, ModuleTest, TestType } from "@/services/moduleTests";
import { UserType } from "@/constants/userTypes";
import { Button } from "@/components/ui/button";
import TestManagementDialog from "@/components/TestManagementDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContentManagementProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  currentUserType: UserType;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ContentManagement = ({ user, currentUserType, onNavigate, onLogout }: ContentManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedTestType, setSelectedTestType] = useState<TestType>('pre_test');
  const [selectedTest, setSelectedTest] = useState<ModuleTest | null>(null);
  const [moduleLessons, setModuleLessons] = useState<{ [key: number]: Lesson[] }>({});
  const [moduleTests, setModuleTests] = useState<{ [key: number]: ModuleTest[] }>({});
  const { toast } = useToast();

  const canManageTests = currentUserType === "teacher";

  const [moduleForm, setModuleForm] = useState({
    module_name: "",
    description: "",
    order_index: 1,
  });

  const [lessonForm, setLessonForm] = useState({
    lesson_title: "",
    lesson_content: "",
    lesson_type: "reading" as LessonType,
    duration_minutes: 0,
    order_index: 1,
    is_published: false,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    const result = await courseService.getAllCourses();
    if (result.success) {
      setCourses(result.courses);
    }
    setLoading(false);
  };

  const fetchModules = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    const result = await contentService.getCourseModules(parseInt(selectedCourse.id));
    if (result.success) {
      setModules(result.modules);
      result.modules.forEach((module) => {
        fetchModuleLessons(module.id);
        fetchModuleTests(module.id);
      });
    }
    setLoading(false);
  };

  const fetchModuleLessons = async (moduleId: number) => {
    const result = await contentService.getModuleLessons(moduleId);
    if (result.success) {
      setModuleLessons((prev) => ({
        ...prev,
        [moduleId]: result.lessons,
      }));
    }
  };

  const fetchModuleTests = async (moduleId: number) => {
    const result = await moduleTestsService.getModuleTests(moduleId);
    if (result.success) {
      setModuleTests((prev) => ({
        ...prev,
        [moduleId]: result.tests,
      }));
    }
  };

  const handleCreateModule = async () => {
    if (!selectedCourse) return;

    const result = await contentService.createModule({
      course_id: parseInt(selectedCourse.id),
      ...moduleForm,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Module created successfully",
      });
      setIsModuleDialogOpen(false);
      setModuleForm({ module_name: "", description: "", order_index: 1 });
      fetchModules();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create module",
        variant: "destructive",
      });
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedModule) return;

    const result = await contentService.createLesson({
      module_id: selectedModule.id,
      ...lessonForm,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Lesson created successfully",
      });
      setIsLessonDialogOpen(false);
      setLessonForm({
        lesson_title: "",
        lesson_content: "",
        lesson_type: "reading",
        duration_minutes: 0,
        order_index: 1,
        is_published: false,
      });
      fetchModuleLessons(selectedModule.id);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create lesson",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module? All lessons will be deleted.")) return;

    const result = await contentService.deleteModule(moduleId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      fetchModules();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: number, moduleId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const result = await contentService.deleteLesson(lessonId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      fetchModuleLessons(moduleId);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const handleManageTest = (module: CourseModule, testType: TestType) => {
    setSelectedModule(module);
    setSelectedTestType(testType);
    const existingTest = moduleTests[module.id]?.find(t => t.test_type === testType);
    setSelectedTest(existingTest || null);
    setIsTestDialogOpen(true);
  };

  const handleTestUpdated = () => {
    if (selectedModule) {
      fetchModuleTests(selectedModule.id);
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      case "reading":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
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
                <FileText className="w-6 h-6" />
                Content Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage course modules, lessons, and materials
              </p>
            </div>

            <HeaderProfileMenu
              user={user}
              roleLabel={currentUserType === "teacher" ? "Teacher" : "Admin"}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Course
          </label>
          <Select
            value={selectedCourse?.id}
            onValueChange={(value) => {
              const course = courses.find((c) => c.id === value);
              setSelectedCourse(course || null);
            }}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCourse && (
          <>
            {/* Course Info */}
            <div className="mb-6 p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg">{selectedCourse.course_name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
            </div>

            {/* Add Module Button */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              <Button onClick={() => setIsModuleDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>

            {/* Modules List */}
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : modules.length === 0 ? (
              <div className="p-12 text-center border border-border rounded-lg">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No modules yet. Create your first module!</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {modules.map((module) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id.toString()}
                    className="border border-border rounded-lg bg-card"
                  >
                    <div className="flex items-center px-4">
                      <AccordionTrigger className="flex-1 hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant="outline">{module.order_index}</Badge>
                          <div className="text-left">
                            <h3 className="font-semibold">{module.module_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge>
                          {moduleLessons[module.id]?.length || 0} lessons
                        </Badge>
                        <button
                          className="p-2 hover:bg-secondary rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <AccordionContent className="px-4 pb-4">
                      <div className="mt-4">
                        <div className="flex gap-2 mb-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setIsLessonDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lesson
                          </Button>
                          {canManageTests && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleManageTest(module, "pre_test")}
                              >
                                {moduleTests[module.id]?.find((t) => t.test_type === "pre_test")
                                  ? "Edit"
                                  : "Create"}{" "}
                                Pre-Test
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleManageTest(module, "post_test")}
                              >
                                {moduleTests[module.id]?.find((t) => t.test_type === "post_test")
                                  ? "Edit"
                                  : "Create"}{" "}
                                Post-Test
                              </Button>
                            </>
                          )}
                        </div>

                        {moduleLessons[module.id] && moduleLessons[module.id].length > 0 && (
                          <div className="mt-4 space-y-2">
                            {moduleLessons[module.id].map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded border border-border bg-background"
                              >
                                <div className="flex items-center gap-3">
                                  {getLessonIcon(lesson.lesson_type)}
                                  <div>
                                    <p className="font-medium">{lesson.lesson_title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Badge variant="outline" className="text-xs">
                                        {lesson.lesson_type}
                                      </Badge>
                                      {lesson.duration_minutes && (
                                        <span>{lesson.duration_minutes} min</span>
                                      )}
                                      {lesson.is_published ? (
                                        <Badge className="bg-green-100 text-green-800">
                                          Published
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">Draft</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        )}
      </div>

      {/* Create Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Module</DialogTitle>
            <DialogDescription>Add a new module to organize your course content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Module Name</label>
              <Input
                value={moduleForm.module_name}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, module_name: e.target.value })
                }
                placeholder="e.g., Introduction to Programming"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, description: e.target.value })
                }
                placeholder="Brief description of this module"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={moduleForm.order_index}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, order_index: parseInt(e.target.value) })
                }
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>Create Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Management Dialog */}
      {canManageTests && selectedModule && (
        <TestManagementDialog
          isOpen={isTestDialogOpen}
          onClose={() => setIsTestDialogOpen(false)}
          moduleId={selectedModule.id}
          moduleName={selectedModule.module_name}
          testType={selectedTestType}
          existingTest={selectedTest || undefined}
          onTestUpdated={handleTestUpdated}
        />
      )}

      {/* Create Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>
              Add a new lesson to {selectedModule?.module_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lesson Title</label>
              <Input
                value={lessonForm.lesson_title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, lesson_title: e.target.value })
                }
                placeholder="e.g., Variables and Data Types"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lesson Type</label>
              <Select
                value={lessonForm.lesson_type}
                onValueChange={(value: LessonType) =>
                  setLessonForm({ ...lessonForm, lesson_type: value })
                }
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
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={lessonForm.lesson_content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, lesson_content: e.target.value })
                }
                placeholder="Lesson content..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })
                }
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={lessonForm.order_index}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) })
                }
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={lessonForm.is_published}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, is_published: e.target.checked })
                }
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Publish immediately
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLesson}>Create Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;
