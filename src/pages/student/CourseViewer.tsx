import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Lock,
  Unlock, 
  CheckCircle2, 
  Circle,
  PlayCircle,
  FileText,
  ClipboardList,
  BookOpen,
  X,
  Menu
 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  enrollmentService, 
  CourseModule, 
  CourseLesson 
  } from "@/services/enrollment";
import { moduleTestsService } from "@/services/moduleTests";
import StudentHeaderActions from "@/components/StudentHeaderActions";
import StudentTestTaking from "@/components/StudentTestTaking";
import TrainingEvaluationDialog from "@/components/TrainingEvaluationDialog";
import { profileService } from "@/services/profile";
import { evaluationService } from "@/services/evaluation";

interface CourseViewerProps {
  courseId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CourseViewer = ({ courseId, user, onNavigate, onLogout }: CourseViewerProps) => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";
  const studentId = user.id.toString();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [pdfReachedMaterialIds, setPdfReachedMaterialIds] = useState<Set<number>>(new Set());
  const [videoCompletedMaterialIds, setVideoCompletedMaterialIds] = useState<Set<number>>(new Set());
  const videoMaxWatchedRef = useRef<Record<number, number>>({});
  const videoLastTimeRef = useRef<Record<number, number>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [moduleTests, setModuleTests] = useState<{ [key: number]: any[] }>({});
  const [showingTest, setShowingTest] = useState<{ moduleId: number; testType: 'pre_test' | 'post_test' } | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [evaluationSubmitted, setEvaluationSubmitted] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string>("");
  const [evaluationTraineeName, setEvaluationTraineeName] = useState<string>(
    `${user.firstName} ${user.lastName}`
  );

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  useEffect(() => {
    const loadLatestName = async () => {
      if (!evaluationOpen) return;
      const result = await profileService.getProfile(user.id.toString());
      if (result.success && result.profile) {
        const first = (result.profile.first_name || "").trim();
        const last = (result.profile.last_name || "").trim();
        const full = `${first} ${last}`.trim();
        if (full) {
          setEvaluationTraineeName(full);
          return;
        }
      }
      setEvaluationTraineeName(`${user.firstName} ${user.lastName}`);
    };

    loadLatestName();
  }, [evaluationOpen, user.firstName, user.id, user.lastName]);

  useEffect(() => {
    if (!modules.length) return;
    calculateProgress(modules);
  }, [modules, moduleTests]);

  const fetchCourseContent = async () => {
    setLoading(true);
    const result = await enrollmentService.getCourseContent(courseId, studentId);
    
    if (result.success) {
      setCourse(result.course);
      setModules(result.modules || []);
      
      // Auto-expand all modules (even if locked) so the menu is open by default
      if (result.modules && result.modules.length > 0) {
        setExpandedModules(result.modules.map((m) => m.id));
      }
      
      // Fetch tests for all modules
      if (result.modules) {
        for (const module of result.modules) {
          await fetchModuleTests(module.id);
        }
      }
      
      // Calculate overall progress
      calculateProgress(result.modules || []);

      try {
        const status = await evaluationService.getStatus(user.id, courseId);
        setEvaluationSubmitted(!!(status.success && status.submitted));
      } catch {
        setEvaluationSubmitted(false);
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to load course content",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const maybeRequireEvaluation = async () => {
    try {
      const status = await evaluationService.getStatus(user.id, courseId);
      if (status.success && status.submitted) {
        setEvaluationSubmitted(true);
        return;
      }
      setEvaluationOpen(true);
    } catch {
      setEvaluationOpen(true);
    }
  };

  const openCertificate = () => {
    const url = `${API_BASE_URL}/student/certificate.php?user_id=${user.id}&course_id=${courseId}&t=${Date.now()}`;
    setCertificateUrl(url);
    setCertificateOpen(true);
  };

  const fetchModuleTests = async (moduleId: number) => {
    const result = await moduleTestsService.getModuleTestsForStudent(moduleId, user.id);
    if (result.success) {
      setModuleTests(prev => ({ ...prev, [moduleId]: result.tests }));
    }
  };

  const calculateProgress = (mods: CourseModule[]) => {
    let totalLessons = 0;
    let completedLessons = 0;
    let totalTests = 0;
    let completedTests = 0;

    mods.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          totalLessons++;
          if (lesson.progress?.status === 'completed') {
            completedLessons++;
          }
        });
      }

      const tests = moduleTests[module.id] || [];
      totalTests += tests.length;
      completedTests += tests.filter((t: any) => (t.attempts_count && Number(t.attempts_count) > 0)).length;
    });

    const totalItems = totalLessons + totalTests;
    const completedItems = completedLessons + completedTests;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    setOverallProgress(Math.round(progress));
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isPostTestCompleted = (moduleId: number) => {
    const tests = moduleTests[moduleId] || [];
    const post = tests.find(t => t.test_type === 'post_test');
    if (!post) return true; // no post-test => don't block module completion
    return (post.attempts_count && Number(post.attempts_count) > 0) || (post.best_score && Number(post.best_score) > 0);
  };

  const isModuleCompleted = (moduleId: number) => {
    return areAllLessonsCompleted(moduleId);
  };

  const isModuleUnlocked = (moduleId: number) => {
    const sorted = [...modules].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((m) => m.id === moduleId);
    if (idx <= 0) return true; // first module always unlocked
    const prev = sorted[idx - 1];
    if (!prev) return true;
    return isModuleCompleted(prev.id);
  };

  const handleToggleModule = (moduleId: number) => {
    toggleModule(moduleId);
  };

  // Check if all lessons in a module are completed
  const areAllLessonsCompleted = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || !module.lessons || module.lessons.length === 0) {
      return false;
    }
    return module.lessons.every(lesson => lesson.progress?.status === 'completed');
  };

  const getPreTestStatus = (moduleId: number) => {
    const tests = moduleTests[moduleId] || [];
    const pre = tests.find(t => t.test_type === 'pre_test');
    const completed = !!pre && ((pre.attempts_count && Number(pre.attempts_count) > 0) || (pre.best_score && Number(pre.best_score) > 0));
    return {
      exists: !!pre,
      completed,
    };
  };

  // Lessons are locked until pre-test is completed (if a pre-test exists)
  const areLessonsLocked = (moduleId: number) => {
    const pre = getPreTestStatus(moduleId);
    if (!pre.exists) return false;
    return !pre.completed;
  };

  // Post-test is locked until all lessons are completed
  const isPostTestLocked = (moduleId: number) => {
    return !areAllLessonsCompleted(moduleId);
  };

  const areAllCourseLessonsCompleted = () => {
    if (!modules.length) return false;
    return modules.every((m) => (m.lessons || []).length > 0 && (m.lessons || []).every((l) => l.progress?.status === 'completed'));
  };

  const isCoursePostTestLocked = () => {
    if (!modules.length) return true;
    const sorted = [...modules].sort((a, b) => a.order_index - b.order_index);
    const last = sorted[sorted.length - 1];
    if (!last) return true;
    if (!isModuleUnlocked(last.id)) return true;
    return !areAllCourseLessonsCompleted();
  };

  const getCourseLevelTest = (testType: 'pre_test' | 'post_test') => {
    for (const module of modules) {
      const test = (moduleTests[module.id] || []).find((t) => t.test_type === testType);
      if (test) {
        return {
          moduleId: module.id,
          test,
        };
      }
    }

    return null;
  };

  const handleLessonClick = async (lesson: CourseLesson, moduleId: number) => {
    if (!isModuleUnlocked(moduleId)) {
      toast({
        title: "Module Locked",
        description: "Please complete the previous module before accessing this module.",
        variant: "destructive",
      });
      return;
    }
    if (areLessonsLocked(moduleId)) {
      toast({
        title: "Lessons Locked",
        description: "Please complete the pre-test before accessing the lessons in this module.",
        variant: "destructive",
      });
      return;
    }
    setSelectedLesson(lesson);
    setSelectedModuleId(moduleId);
    setShowingTest(null);
    setCanMarkComplete(false);
    setPdfReachedMaterialIds(new Set());
    setVideoCompletedMaterialIds(new Set());
    videoMaxWatchedRef.current = {};
    videoLastTimeRef.current = {};
    
    // Fetch lesson details
    const result = await enrollmentService.getLessonDetails(lesson.id, studentId);
    if (result.success) {
      setLessonContent(result);
      
      // Mark as in progress if not started
      if (!lesson.progress || lesson.progress.status === 'not_started') {
        await enrollmentService.updateLessonProgress(
          studentId,
          lesson.id,
          'in_progress',
          0
        );
        fetchCourseContent(); // Refresh to update progress
      }
    }
  };

  const handleTestClick = (moduleId: number, testType: 'pre_test' | 'post_test') => {
    if (!isModuleUnlocked(moduleId)) {
      toast({
        title: "Module Locked",
        description: "Please complete the previous module before accessing this module.",
        variant: "destructive",
      });
      return;
    }
    if (testType === 'post_test' && isCoursePostTestLocked()) {
      toast({
        title: "Post-Test Locked",
        description: "Please complete all lessons in this course before taking the post-test.",
        variant: "destructive",
      });
      return;
    }
    
    setShowingTest({ moduleId, testType });
    setSelectedModuleId(moduleId);
    setSelectedLesson(null);
  };

  // Check if lesson can be marked complete
  useEffect(() => {
    if (!selectedLesson || !lessonContent?.materials) return;
    
    const pdfMaterials = lessonContent.materials.filter((m: any) => m.material_type === 'pdf');
    const videoMaterials = lessonContent.materials.filter((m: any) => m.material_type === 'video');

    // If already completed, allow button
    if (selectedLesson.progress?.status === 'completed') {
      setCanMarkComplete(true);
      return;
    }

    const pdfOk = pdfMaterials.length === 0 || pdfReachedMaterialIds.size >= pdfMaterials.length;
    const videoOk = videoMaterials.length === 0 || videoCompletedMaterialIds.size >= videoMaterials.length;

    setCanMarkComplete(pdfOk && videoOk);
  }, [selectedLesson, lessonContent, pdfReachedMaterialIds, videoCompletedMaterialIds]);

  // Listen for PDF.js viewer messages to unlock completion when last page is reached
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const allowedOrigin = new URL(API_BASE_URL).origin;
        if (event.origin !== allowedOrigin) return;
      } catch {
        return;
      }

      const data: any = event?.data;
      if (!data || data.type !== 'PDF_LAST_PAGE_REACHED') return;
      if (!lessonContent?.materials) return;

      const pdfMaterials = lessonContent.materials.filter((m: any) => m.material_type === 'pdf');
      const matched = pdfMaterials.find((m: any) => m.file_url === data.file_url);
      if (!matched) return;

      setPdfReachedMaterialIds((prev) => {
        const next = new Set(prev);
        next.add(matched.id);
        return next;
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [lessonContent]);

  const markLessonComplete = async () => {
    if (!selectedLesson) return;
    
    const result = await enrollmentService.updateLessonProgress(
      studentId,
      selectedLesson.id,
      'completed',
      100
    );
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Lesson marked as complete",
      });
      fetchCourseContent(); // Refresh progress
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4" />;
      case 'document':
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
      case 'assignment':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (lesson: CourseLesson) => {
    if (!lesson.progress || lesson.progress.status === 'not_started') {
      return <Circle className="w-4 h-4 text-gray-400" />;
    } else if (lesson.progress.status === 'completed') {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else {
      return <Circle className="w-4 h-4 text-blue-500 fill-blue-500" />;
    }
  };

  const getEnrolledCount = () => {
    let count = 0;
    modules.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          if (lesson.progress && lesson.progress.status !== 'not_started') {
            count++;
          }
        });
      }
    });
    return count;
  };

  const getCompletedCount = () => {
    let count = 0;
    modules.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          if (lesson.progress?.status === 'completed') {
            count++;
          }
        });
      }
    });
    return count;
  };

  const getInProgressCount = () => {
    let count = 0;
    modules.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          if (lesson.progress?.status === 'in_progress') {
            count++;
          }
        });
      }
    });
    return count;
  };

  const getNotStartedCount = () => {
    let count = 0;
    modules.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          if (!lesson.progress || lesson.progress.status === 'not_started') {
            count++;
          }
        });
      }
    });
    return count;
  };

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Course Menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-80 bg-card border-r border-border flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-foreground">Course Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course?.course_name}
              </p>
            </div>

            {/* Course Modules List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {modules.map((module, index) => (
                <div key={module.id} className="rounded-lg border border-border bg-background">
                  <button
                    onClick={() => handleToggleModule(module.id)}
                    className={`w-full flex items-center justify-between p-3 hover:bg-accent transition-colors ${
                      !isModuleUnlocked(module.id) ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 text-left">
                      {expandedModules.includes(module.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm text-foreground">
                        {module.module_name}
                      </span>
                    </div>
                    {!isModuleUnlocked(module.id) ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-500" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-2 space-y-1">
                          {(() => {
                            const isFirstModule = index === 0;
                            const isLastModule = index === modules.length - 1;
                            const preTestEntry = getCourseLevelTest('pre_test');
                            const postTestEntry = getCourseLevelTest('post_test');
                            const preTest = preTestEntry?.test;
                            const postTest = postTestEntry?.test;
                            const preTestModuleId = preTestEntry?.moduleId;
                            const postTestModuleId = postTestEntry?.moduleId;

                            return (
                              <>
                          {/* Pre-Test Button */}
                          {isFirstModule && preTest && preTestModuleId && (
                            <button
                              onClick={() => handleTestClick(preTestModuleId, 'pre_test')}
                              className={`w-full flex items-center gap-2 p-2 rounded text-left hover:bg-accent transition-colors ${
                                showingTest?.moduleId === preTestModuleId && showingTest?.testType === 'pre_test' ? 'bg-accent' : ''
                              }`}
                            >
                              <ClipboardList className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-foreground flex-1 font-medium">
                                Pre-Test
                              </span>
                              {preTest?.best_score ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          )}
                          
                          {module.lessons
                            ?.filter(
                              (lesson) =>
                                (lesson as any).lesson_type !== 'pre_test' &&
                                (lesson as any).lesson_type !== 'post_test'
                            )
                            .map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson, module.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded text-left hover:bg-accent transition-colors ${
                                selectedLesson?.id === lesson.id ? 'bg-accent' : ''
                              } ${areLessonsLocked(module.id) ? 'opacity-60' : ''}`}
                            >
                              {getStatusIcon(lesson)}
                              {getLessonIcon(lesson.lesson_type)}
                              <span className="text-sm text-foreground flex-1 line-clamp-1">
                                {lesson.lesson_title}
                              </span>
                              {areLessonsLocked(module.id) && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                              {!lesson.is_published && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </button>
                          ))}
                          
                          {/* Post-Test Button */}
                          {isLastModule && postTest && postTestModuleId && (
                            <button
                              onClick={() => handleTestClick(postTestModuleId, 'post_test')}
                              className={`w-full flex items-center gap-2 p-2 rounded text-left hover:bg-accent transition-colors ${
                                showingTest?.moduleId === postTestModuleId && showingTest?.testType === 'post_test' ? 'bg-accent' : ''
                              } ${isCoursePostTestLocked() ? 'opacity-60' : ''}`}
                            >
                              <ClipboardList className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-foreground flex-1 font-medium">
                                Post-Test
                              </span>
                              {isCoursePostTestLocked() ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : postTest?.best_score ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          )}
                              </>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {evaluationSubmitted && (
                <div className="rounded-lg border border-border bg-background">
                  <button
                    onClick={openCertificate}
                    className="w-full flex items-center gap-2 p-3 text-left hover:bg-accent transition-colors"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">E-Certificate</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{course?.course_name}</h1>
              <p className="text-sm text-muted-foreground">{course?.course_code}</p>
            </div>

            <StudentHeaderActions user={user} onNavigate={onNavigate} onLogout={onLogout} />
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {overallProgress}% complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <Circle className="w-4 h-4" />
                <span className="text-2xl font-bold">{getEnrolledCount()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Enrolled Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-2xl font-bold">{getCompletedCount()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Students Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Circle className="w-4 h-4 fill-blue-600" />
                <span className="text-2xl font-bold">{getInProgressCount()}</span>
              </div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600">
                <Circle className="w-4 h-4" />
                <span className="text-2xl font-bold">{getNotStartedCount()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Yet to Start</p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          {showingTest && selectedModuleId ? (
            <StudentTestTaking
              moduleId={selectedModuleId}
              moduleName={modules.find(m => m.id === selectedModuleId)?.module_name || ''}
              studentId={user.id}
              testType={showingTest.testType}
              onTestCompleted={() => {
                fetchModuleTests(selectedModuleId);
                const completedType = showingTest.testType;
                setShowingTest(null);
                toast({
                  title: "Test Completed",
                  description: "You can now access the module content.",
                });

                if (completedType === 'post_test') {
                  maybeRequireEvaluation();
                }
              }}
              onClose={() => setShowingTest(null)}
            />
          ) : selectedLesson ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Breadcrumb */}
              <div className="text-sm text-muted-foreground mb-4 px-6">
                {course?.course_code} / {selectedLesson.lesson_type === 'quiz' ? 'Quiz' : selectedLesson.lesson_type === 'assignment' ? 'Assignment' : 'Lesson'} / {selectedLesson.lesson_title}
              </div>

              {/* Lesson Header with Icon */}
              <div className="flex items-center gap-3 mb-6 px-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {selectedLesson.lesson_type === 'quiz' || selectedLesson.lesson_type === 'assignment' ? (
                    <ClipboardList className="w-6 h-6 text-primary" />
                  ) : selectedLesson.lesson_type === 'video' ? (
                    <PlayCircle className="w-6 h-6 text-primary" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedLesson.lesson_title}
                  </h2>
                  {selectedLesson.progress?.started_at && (
                    <p className="text-sm text-muted-foreground">
                      Opened: {new Date(selectedLesson.progress.started_at).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs for Quiz/Assignment */}
              {(selectedLesson.lesson_type === 'quiz' || selectedLesson.lesson_type === 'assignment') && (
                <div className="border-b border-border mb-6 px-6">
                  <div className="flex gap-6">
                    <button className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                      {selectedLesson.lesson_type === 'quiz' ? 'Quiz' : 'Assignment'}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                      Results
                    </button>
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="px-6 mb-6">
                <div className="prose prose-sm max-w-none text-foreground">
                    {lessonContent?.lesson?.lesson_content ? (
                      <div dangerouslySetInnerHTML={{ __html: lessonContent.lesson.lesson_content }} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-full max-w-md mx-auto mb-6">
                          <img 
                            src="https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=Lesson+Content" 
                            alt="Lesson illustration"
                            className="w-full rounded-lg"
                          />
                        </div>
                        <p className="text-muted-foreground">
                          {selectedLesson.lesson_type === 'quiz' 
                            ? 'Complete the quiz to test your knowledge' 
                            : selectedLesson.lesson_type === 'assignment'
                            ? 'Submit your assignment to complete this lesson'
                            : 'No content available for this lesson.'}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* PDF Viewer - Display PDFs inline */}
              {lessonContent?.materials && lessonContent.materials.length > 0 && (
                <div className="mb-6">
                  {lessonContent.materials.map((material: any) => (
                    material.material_type === 'pdf' ? (
                      <div key={material.id} className="mb-6">
                        <div className="flex items-center justify-between mb-2 px-6">
                          <h3 className="font-semibold text-foreground">{material.material_name}</h3>
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Open in new tab
                          </a>
                        </div>
                        <div className="border-y border-border bg-white overflow-hidden" style={{ height: 'calc(100vh - 300px)', minHeight: '800px' }}>
                          <iframe
                            src={`${API_BASE_URL}/pdf-viewer.html?file=${encodeURIComponent(material.file_url)}`}
                            className="w-full h-full"
                            title={material.material_name}
                            scrolling="no"
                          />
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}

              {/* Video Player - Display videos inline and prevent skipping */}
              {lessonContent?.materials && lessonContent.materials.some((m: any) => m.material_type === 'video') && (
                <div className="mb-6">
                  {lessonContent.materials
                    .filter((m: any) => m.material_type === 'video')
                    .map((material: any) => (
                      <div key={material.id} className="mb-6">
                        <div className="flex items-center justify-between mb-2 px-6">
                          <h3 className="font-semibold text-foreground">{material.material_name}</h3>
                          <span className="text-xs text-muted-foreground">Must be watched fully (no skipping)</span>
                        </div>

                        <div className="px-6">
                          <div className="border border-border rounded-lg overflow-hidden bg-black">
                            <video
                              src={material.file_url?.startsWith('http') ? material.file_url : `${API_BASE_URL}/${material.file_url}`}
                              className="w-full"
                              controls
                              controlsList="nodownload noplaybackrate"
                              disablePictureInPicture
                              playsInline
                              onContextMenu={(e) => e.preventDefault()}
                              onLoadedMetadata={(e) => {
                                const v = e.currentTarget;
                                const t = Math.max(0, v.currentTime || 0);
                                videoMaxWatchedRef.current[material.id] = t;
                                videoLastTimeRef.current[material.id] = t;
                              }}
                              onTimeUpdate={(e) => {
                                const v = e.currentTarget;
                                if (v.seeking) return;

                                const max = Number(videoMaxWatchedRef.current[material.id] || 0);
                                const last = Number(videoLastTimeRef.current[material.id] || 0);

                                // Block forward jumps caused by seek bar / keyboard.
                                const jumpedForward = v.currentTime > max + 0.75;
                                const largeStep = v.currentTime - last > 1.5;
                                if (jumpedForward || largeStep) {
                                  v.currentTime = max;
                                  return;
                                }

                                if (v.currentTime > max) {
                                  videoMaxWatchedRef.current[material.id] = v.currentTime;
                                }
                                videoLastTimeRef.current[material.id] = v.currentTime;
                              }}
                              onSeeking={(e) => {
                                const v = e.currentTarget;
                                const max = Number(videoMaxWatchedRef.current[material.id] || 0);
                                if (v.currentTime > max + 0.25) {
                                  v.currentTime = max;
                                }
                              }}
                              onEnded={() => {
                                setVideoCompletedMaterialIds((prev) => {
                                  const next = new Set(prev);
                                  next.add(material.id);
                                  return next;
                                });
                              }}
                              onError={() => {
                                toast({
                                  title: "Video Error",
                                  description: "Video failed to load. Please try again or contact the administrator.",
                                  variant: "destructive",
                                });
                              }}
                            />
                          </div>

                          {videoCompletedMaterialIds.has(material.id) ? (
                            <div className="mt-2 text-sm text-green-600">Video completed</div>
                          ) : (
                            <div className="mt-2 text-sm text-muted-foreground">Watch until the end to unlock completion.</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Quiz/Assignment Info */}
              {(selectedLesson.lesson_type === 'quiz' || selectedLesson.lesson_type === 'assignment') && (
                <div className="space-y-3 mb-6 px-6">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Attempts allowed:</span>
                    <span className="text-sm font-medium text-foreground">1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Grade to pass:</span>
                    <span className="text-sm font-medium text-foreground">22.50 out of 30.00</span>
                  </div>
                </div>
              )}

              {/* Other Materials (non-PDF) */}
              {lessonContent?.materials && lessonContent.materials.some((m: any) => m.material_type !== 'pdf') && (
                <div className="mb-6 px-6">
                  <h3 className="font-semibold text-foreground mb-3">Additional Materials</h3>
                  <div className="space-y-2">
                    {lessonContent.materials
                      .filter((material: any) => material.material_type !== 'pdf' && material.material_type !== 'video')
                      .map((material: any) => (
                      <a
                        key={material.id}
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{material.material_name}</p>
                          <p className="text-xs text-muted-foreground">{material.material_type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="px-6 pb-6">
                {selectedLesson.progress?.status === 'completed' ? (
                  <div className="flex justify-center">
                    <Button variant="outline" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Action Button */}
                    <div className="flex justify-center">
                      <Button 
                        onClick={markLessonComplete} 
                        size="lg"
                        disabled={!canMarkComplete}
                      >
                        {selectedLesson.lesson_type === 'quiz' 
                          ? 'Continue the last preview' 
                          : selectedLesson.lesson_type === 'assignment'
                          ? 'Submit Assignment'
                          : 'Mark as done'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a lesson from the menu to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TrainingEvaluationDialog
        open={evaluationOpen}
        userId={user.id}
        courseId={courseId}
        traineeName={evaluationTraineeName}
        trainorTeacherName={course?.assigned_teacher_name || ""}
        trainingProgram={course?.course_name || ""}
        dateOfConduct={
          course?.date_of_conduct ||
          course?.conduct_date ||
          course?.start_date ||
          course?.training_date ||
          undefined
        }
        venue="PSA Academy"
        onSubmitted={() => {
          setEvaluationOpen(false);
          setEvaluationSubmitted(true);
          toast({
            title: "Evaluation Submitted",
            description: "Thank you for completing the evaluation form.",
          });
        }}
        onClose={() => setEvaluationOpen(false)}
      />

      <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>E-Certificate</DialogTitle>
          </DialogHeader>
          <div className="border border-border rounded-md overflow-hidden bg-white" style={{ height: '80vh' }}>
            <iframe
              src={certificateUrl}
              className="w-full h-full"
              title="E-Certificate"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseViewer;
