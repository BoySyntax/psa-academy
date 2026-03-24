import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, Eye, TrendingUp, TrendingDown, Users, BookOpen, Award } from "lucide-react";

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
  completedAt: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

const StudentGrades = ({ user, onNavigate, onLogout }: StudentGradesProps) => {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockGrades: GradeData[] = [
      {
        id: 1,
        studentId: 1,
        studentName: "Juan Dela Cruz",
        courseName: "Data Privacy Fundamentals",
        courseCode: "DPF-101",
        preTestScore: 45,
        postTestScore: 85,
        improvement: 40,
        completedAt: "2024-03-15",
        status: "completed"
      },
      {
        id: 2,
        studentId: 2,
        studentName: "Maria Santos",
        courseName: "Cybersecurity Basics",
        courseCode: "CSB-201",
        preTestScore: 60,
        postTestScore: 92,
        improvement: 32,
        completedAt: "2024-03-14",
        status: "completed"
      },
      {
        id: 3,
        studentId: 3,
        studentName: "Jose Reyes",
        courseName: "Data Privacy Fundamentals",
        courseCode: "DPF-101",
        preTestScore: 30,
        postTestScore: 78,
        improvement: 48,
        completedAt: "2024-03-13",
        status: "completed"
      },
      {
        id: 4,
        studentId: 4,
        studentName: "Ana Garcia",
        courseName: "Information Security",
        courseCode: "ISC-301",
        preTestScore: 55,
        postTestScore: 0,
        improvement: 0,
        completedAt: "",
        status: "in-progress"
      },
      {
        id: 5,
        studentId: 5,
        studentName: "Carlos Mendoza",
        courseName: "Cybersecurity Basics",
        courseCode: "CSB-201",
        preTestScore: 0,
        postTestScore: 0,
        improvement: 0,
        completedAt: "",
        status: "not-started"
      }
    ];

    setTimeout(() => {
      setGrades(mockGrades);
      setLoading(false);
    }, 1000);
  }, []);

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
    completedCourses: grades.filter(g => g.status === "completed").length,
    averagePreTest: grades.filter(g => g.preTestScore > 0).reduce((acc, g) => acc + g.preTestScore, 0) / grades.filter(g => g.preTestScore > 0).length || 0,
    averagePostTest: grades.filter(g => g.postTestScore > 0).reduce((acc, g) => acc + g.postTestScore, 0) / grades.filter(g => g.postTestScore > 0).length || 0,
    averageImprovement: grades.filter(g => g.improvement > 0).reduce((acc, g) => acc + g.improvement, 0) / grades.filter(g => g.improvement > 0).length || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "in-progress": return "text-yellow-600 bg-yellow-100";
      case "not-started": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
              <p className="text-sm text-muted-foreground mt-1">View and analyze student assessment results</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Pre-Test</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averagePreTest)}`}>
                  {Math.round(stats.averagePreTest)}%
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Post-Test</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averagePostTest)}`}>
                  {Math.round(stats.averagePostTest)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Improvement</p>
                <p className="text-2xl font-bold text-green-600">+{Math.round(stats.averageImprovement)}%</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
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
              <option value="DPF-101">Data Privacy Fundamentals</option>
              <option value="CSB-201">Cybersecurity Basics</option>
              <option value="ISC-301">Information Security</option>
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
                  <th className="text-center p-4 font-semibold text-foreground">Improvement</th>
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
                      {grade.improvement > 0 ? (
                        <span className="font-semibold text-green-600">
                          +{grade.improvement}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grade.status)}`}>
                        {grade.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredGrades.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No grades found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
