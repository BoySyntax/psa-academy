import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, Eye, TrendingUp, TrendingDown, Users, BookOpen, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface StudentGradesProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface GradeData {
  id: number;
  studentId: number;
  studentName: string;
  courseName: string;
  courseCode: string;
  preTestScore: number;
  postTestScore: number;
  improvement: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

const normalizeStatus = (status: string): GradeData['status'] => {
  const s = (status || '').toLowerCase().trim();
  if (s === 'completed') return 'completed';
  if (s === 'in_progress' || s === 'in-progress') return 'in-progress';
  if (s === 'not_started' || s === 'not-started') return 'not-started';
  // Fallback: treat unknown statuses as not-started for display/filtering
  return 'not-started';
};

const StudentGrades = ({ user, onNavigate, onLogout }: StudentGradesProps) => {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeData | null>(null);
  const [testDetails, setTestDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (grade: GradeData) => {
    setSelectedGrade(grade);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setTestDetails(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';
      
      // Fetch test attempts for this student in this course
      const response = await fetch(`${API_BASE_URL}/teacher/student-test-details.php?student_id=${grade.studentId}&course_id=${grade.courseCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTestDetails(result.testDetails);
        } else {
          console.error('Failed to fetch test details:', result.message);
        }
      } else {
        const body = await response.text();
        console.error('API request failed for test details', response.status, body);
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch real grade data from API
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';
        
        // Fetch teacher's course enrollments with grades
        const response = await fetch(`${API_BASE_URL}/teacher/student-grades.php?teacher_id=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseText = await response.text();

        if (!response.ok) {
          console.error('API request failed', response.status, responseText);
          setGrades([]);
          return;
        }

        let result: any;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse API response as JSON:', responseText);
          setGrades([]);
          return;
        }

        if (result.success) {
          const normalized: GradeData[] = (result.grades || []).map((g: any) => ({
            id: g.id,
            studentId: g.studentId,
            studentName: g.studentName,
            courseName: g.courseName,
            courseCode: g.courseCode,
            preTestScore: g.preTestScore,
            postTestScore: g.postTestScore,
            improvement: g.improvement,
            status: normalizeStatus(g.status),
          }));
          setGrades(normalized);
        } else {
          console.error('Failed to fetch grades:', result.message);
          setGrades([]);
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user.id]);

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || grade.courseCode === selectedCourse;
    const matchesStatus = selectedStatus === "all" || grade.status === selectedStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const stats = {
    totalStudents: grades.length,
    completedCourses: grades.filter(g => g.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in-progress": return "bg-blue-500 text-white";
      case "not-started": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return "text-green-600";
    if (improvement < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Grades</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage student assessment results</p>
            </div>
            <button
              onClick={() => onNavigate("home")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats.completedCourses}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-secondary/30 rounded-lg p-4 mb-6 border border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by student name, course name, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Courses</option>
              {Array.from(new Set(grades.map(g => g.courseCode))).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Student Name</th>
                  <th className="text-left p-4 font-semibold text-foreground">Course</th>
                  <th className="text-center p-4 font-semibold text-foreground">Pre-Test</th>
                  <th className="text-center p-4 font-semibold text-foreground">Post-Test</th>
                  <th className="text-center p-4 font-semibold text-foreground">Status</th>
                  <th className="text-center p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade, index) => (
                  <motion.tr
                    key={grade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{grade.studentName}</p>
                        <p className="text-sm text-muted-foreground">ID: {grade.studentId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{grade.courseName}</p>
                        <p className="text-sm text-muted-foreground">{grade.courseCode}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {grade.preTestScore > 0 ? (
                        <span className={`font-semibold ${getScoreColor(grade.preTestScore)}`}>
                          {grade.preTestScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {grade.postTestScore > 0 ? (
                        <span className={`font-semibold ${getScoreColor(grade.postTestScore)}`}>
                          {grade.postTestScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(grade.status)}`}>
                        {grade.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleViewDetails(grade)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredGrades.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No grades found matching your criteria.</p>
          </div>
        )}

        {grades.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No student grades available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Grades will appear here once students complete assessments.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Test Details</DialogTitle>
            <DialogDescription>
              View detailed test questions, student answers, and correct answers for this student's assessments.
            </DialogDescription>
          </DialogHeader>
          {selectedGrade && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{selectedGrade.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-semibold">{selectedGrade.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Code</p>
                  <p className="font-semibold">{selectedGrade.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedGrade.status)}`}>
                    {selectedGrade.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
                  <p className="mt-4 text-muted-foreground">Loading test details...</p>
                </div>
              ) : testDetails && testDetails.length > 0 ? (
                <div className="space-y-6">
                  {testDetails.map((test: any, testIndex: number) => (
                    <div key={testIndex} className="border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-secondary/30 border-b border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Assessment</p>
                            <h3 className="font-semibold text-base">{test.testType}</h3>
                            <p className="text-sm text-muted-foreground">{test.moduleName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-xl font-semibold text-foreground">{test.score}%</p>
                            <p className="text-xs text-muted-foreground">
                              {test.earnedPoints}/{test.totalPoints} points
                            </p>
                            <span
                              className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-medium border ${
                                test.passed
                                  ? 'border-green-300 text-green-700 bg-green-50'
                                  : 'border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {test.passed ? 'Passed' : 'Not Passed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {test.answers.map((answer: any, answerIndex: number) => (
                          <div key={answerIndex} className="border border-border rounded-lg">
                            <div className="px-4 py-3 border-b border-border bg-background">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Question {answer.questionNumber}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {answer.question}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {answer.points} points • {answer.type.replace('_', ' ').toUpperCase()}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                                    answer.isCorrect
                                      ? 'border-green-300 text-green-700 bg-green-50'
                                      : 'border-red-300 text-red-700 bg-red-50'
                                  }`}
                                >
                                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 space-y-3">
                              {answer.type === 'multiple_choice' && answer.allOptions && answer.allOptions.length > 0 ? (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">Options</p>
                                  <div className="space-y-2">
                                    {answer.allOptions.map((option: any, optIndex: number) => {
                                      const optionText = option.answer_text;
                                      const isSelected = optionText === answer.studentAnswer;
                                      const isCorrect = option.is_correct === 1;

                                      return (
                                        <div key={optIndex} className="flex items-start gap-3">
                                          <div className="mt-0.5 h-4 w-4 rounded-full border border-border flex items-center justify-center">
                                            {isCorrect && (
                                              <div className="h-2 w-2 rounded-full bg-green-600" />
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <p className="text-sm text-foreground">
                                                <span className="text-muted-foreground mr-2">
                                                  {String.fromCharCode(65 + optIndex)}.
                                                </span>
                                                {optionText}
                                              </p>
                                              {isCorrect && (
                                                <span className="px-2 py-0.5 rounded text-[11px] border border-green-300 text-green-700 bg-green-50">
                                                  Correct
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Student Answer</p>
                                    <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                                      {answer.studentAnswer || 'Not answered'}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Correct Answer</p>
                                    <div className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground">
                                      {answer.correctAnswer || '—'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test attempts found for this student.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The student may not have completed any tests yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentGrades;
