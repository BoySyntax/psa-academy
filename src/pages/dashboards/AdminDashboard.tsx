import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { adminService, AdminCliSubmission, AdminIdpSubmission, AdminSatnaSubmission, User } from "@/services/admin";
import { careerLeverageScoreGroups, computeCareerLeverageScores } from "@/data/careerLeverageInventory";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onNavigate, onLogout }: AdminDashboardProps) => {
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [cliSubmissions, setCliSubmissions] = useState<AdminCliSubmission[]>([]);
  const [satnaSubmissions, setSatnaSubmissions] = useState<AdminSatnaSubmission[]>([]);
  const [idpSubmissions, setIdpSubmissions] = useState<AdminIdpSubmission[]>([]);
  const [studentUsers, setStudentUsers] = useState<User[]>([]);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const fetchAssessmentAnalytics = async () => {
    setAssessmentLoading(true);
    try {
      const [cliResult, satnaResult, idpResult, studentsResult] = await Promise.all([
        adminService.fetchCareerLeverageInventory(currentYear),
        adminService.fetchSkillAudits(currentYear),
        adminService.fetchIdps("all"),
        adminService.getUsersByType("student"),
      ]);

      if (cliResult.success) {
        setCliSubmissions(cliResult.submissions || []);
      }

      if (satnaResult.success) {
        setSatnaSubmissions(satnaResult.audits || []);
      }

      if (idpResult.success) {
        setIdpSubmissions(idpResult.idps || []);
      }

      if (studentsResult.success) {
        setStudentUsers((studentsResult.users || []) as User[]);
      }
    } catch (error) {
      console.error("Failed to fetch assessment analytics:", error);
    } finally {
      setAssessmentLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentAnalytics();
  }, [currentYear]);

  const assessmentSummary = useMemo(() => {
    const cliPathCounts = cliSubmissions.reduce<Record<string, number>>((acc, submission) => {
      const score = submission.cli?.scores || computeCareerLeverageScores(submission.cli?.answers || {});
      const selectedPaths = score.highestList && score.highestList.length > 0
        ? score.highestList.map((item: any) => String(item.key || "").toLowerCase())
        : score.highest?.key
          ? [String(score.highest.key).toLowerCase()]
          : [];

      selectedPaths.forEach((pathKey: string) => {
        acc[pathKey] = (acc[pathKey] || 0) + 1;
      });

      return acc;
    }, careerLeverageScoreGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.key] = 0;
      return acc;
    }, {}));

    const cliCareerPaths = careerLeverageScoreGroups.map((group) => ({
      key: group.key,
      label: group.label.charAt(0) + group.label.slice(1).toLowerCase(),
      count: cliPathCounts[group.key] || 0,
    }));

    const uniqueAssessedUsers = new Set<number>([
      ...cliSubmissions.map((item) => item.user_id),
      ...satnaSubmissions.map((item) => item.user_id),
      ...idpSubmissions.map((item) => item.user_id),
    ]).size;

    const satnaWithDifficulties = satnaSubmissions.filter((item) => {
      const difficult = String(item.audit?.difficult_to_perform || "").trim();
      const suggestions = String(item.audit?.other_training_suggestions || "").trim();
      const desired = item.audit?.desired_trainings;
      const hasDesired = Array.isArray(desired)
        ? desired.length > 0
        : !!desired && typeof desired === "object" && Object.keys(desired).length > 0;

      return !!difficult || !!suggestions || hasDesired;
    }).length;

    const satnaWithDifficultFunctions = satnaSubmissions.filter((item) => String(item.audit?.difficult_to_perform || "").trim().length > 0).length;
    const satnaWithTrainingSuggestions = satnaSubmissions.filter((item) => String(item.audit?.other_training_suggestions || "").trim().length > 0).length;

    const satnaTotalRespondents = satnaSubmissions.length;
    const satnaTrainingTopics = [
      "Management",
      "Inter-personal Effectiveness",
      "Intra-personal Development",
      "Research",
      "Statistics",
      "Communication",
      "Computer Skills",
      "HR",
      "Accounting",
      "GAD",
      "Civil Registration",
    ];

    const satnaRespondentsByTopic = satnaSubmissions.reduce<Record<string, number>>((acc, submission) => {
      const audit = submission.audit || {};
      const topics = new Set<string>();

      // Count a student once per topic if they selected it as a main topic OR selected any training under it
      const mainTopics = Array.isArray(audit.desired_training_topics) ? audit.desired_training_topics.map((t: any) => String(t || "").trim()).filter(Boolean) : [];
      mainTopics.forEach((topic) => topics.add(topic));

      if (audit.desired_trainings && typeof audit.desired_trainings === "object") {
        Object.entries(audit.desired_trainings).forEach(([key, value]) => {
          const v: any = value;
          if (v?.selected) {
            const [topic] = String(key || "").split("::");
            const normalized = String(topic || "").trim();
            if (normalized) topics.add(normalized);
          }
        });
      }

      topics.forEach((topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
      });

      return acc;
    }, satnaTrainingTopics.reduce<Record<string, number>>((acc, topic) => {
      acc[topic] = 0;
      return acc;
    }, {}));

    const satnaGroupConfig = {
      soft: {
        label: "Soft Skills",
        topics: ["Communication", "Inter-personal Effectiveness", "Intra-personal Development"],
        tone: "bg-emerald-500",
      },
      technical: {
        label: "Technical Skills",
        topics: ["Statistics", "Computer Skills", "Research"],
        tone: "bg-blue-500",
      },
      administrative: {
        label: "Administrative Skills",
        topics: ["HR", "Accounting", "GAD", "Civil Registration"],
        tone: "bg-amber-500",
      },
    };

    const satnaRespondentsByGroup = Object.entries(satnaGroupConfig).reduce<Record<string, number>>((acc, [key, group]) => {
      acc[key] = group.topics.reduce((sum, topic) => sum + (satnaRespondentsByTopic[topic] || 0), 0);
      return acc;
    }, {});

    const satnaTopicDistribution = Object.entries(satnaRespondentsByTopic)
      .filter(([topic, count]) => satnaTrainingTopics.includes(topic) && count > 0)
      .sort((a, b) => b[1] - a[1]);

    const satnaTrainingCounts = satnaSubmissions.reduce<Record<string, number>>((acc, submission) => {
      const desired = submission.audit?.desired_trainings;
      if (!desired || typeof desired !== "object") return acc;

      Object.entries(desired).forEach(([key, value]) => {
        const v: any = value;
        if (v?.selected) {
          acc[key] = (acc[key] || 0) + 1;
        }
      });

      return acc;
    }, {});

    const satnaTopTrainings = Object.entries(satnaTrainingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [topic, item] = key.split("::");
        return { key, topic: topic || "", item: item || key, count };
      });

    const satnaLeastTrainings = Object.entries(satnaTrainingCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [topic, item] = key.split("::");
        return { key, topic: topic || "", item: item || key, count };
      });

    const satnaAverageTrainingsSelected = satnaTotalRespondents === 0
      ? 0
      : satnaSubmissions.reduce((sum, submission) => {
          const desired = submission.audit?.desired_trainings;
          if (!desired || typeof desired !== "object") return sum;
          const selectedCount = Object.values(desired).filter((value: any) => value?.selected).length;
          return sum + selectedCount;
        }, 0) / satnaTotalRespondents;

    const satnaTotal = Math.max(satnaTotalRespondents, 1);

    const satnaMostCommonSkillGaps = satnaTopicDistribution.slice(0, 3).map(([topic]) => topic);

    const idpGoalCounts = idpSubmissions.reduce(
      (acc, submission) => {
        const purpose = submission.idp?.purpose || {};

        if (purpose?.meet_current_position) {
          acc.meetCurrentPosition += 1;
        }

        if (purpose?.meet_next_higher_position) {
          acc.meetNextHigherPosition += 1;
        }

        if (purpose?.increase_current_position) {
          acc.increaseCurrentPosition += 1;
        }

        if (purpose?.acquire_new_competencies) {
          acc.acquireNewCompetencies += 1;
        }

        return acc;
      },
      {
        meetCurrentPosition: 0,
        meetNextHigherPosition: 0,
        increaseCurrentPosition: 0,
        acquireNewCompetencies: 0,
      }
    );

    const pendingIdp = idpSubmissions.filter((item) => item.status === "pending").length;
    const approvedIdp = idpSubmissions.filter((item) => item.status === "approved").length;
    const rejectedIdp = idpSubmissions.filter((item) => item.status === "rejected").length;

    const idpTotal = Math.max(idpSubmissions.length, 1);
    const cliTotal = Math.max(cliSubmissions.length, 1);

    const idpGoalsChartData = [
      { key: "meetCurrentPosition", label: "Current", count: idpGoalCounts.meetCurrentPosition },
      { key: "meetNextHigherPosition", label: "Next", count: idpGoalCounts.meetNextHigherPosition },
      { key: "increaseCurrentPosition", label: "Increase", count: idpGoalCounts.increaseCurrentPosition },
      { key: "acquireNewCompetencies", label: "New", count: idpGoalCounts.acquireNewCompetencies },
    ];

    const cliChartData = cliCareerPaths.map((p) => ({
      key: p.key,
      label: p.label,
      count: p.count,
    }));

    const satnaGroupedChartData = [
      { key: "soft", label: "Soft", count: satnaRespondentsByGroup.soft || 0 },
      { key: "technical", label: "Technical", count: satnaRespondentsByGroup.technical || 0 },
      { key: "administrative", label: "Admin", count: satnaRespondentsByGroup.administrative || 0 },
    ];

    const smartInsights: string[] = [];
    const smartAlerts: string[] = [];

    // SATNA grouped demand
    const groupEntries = Object.entries(satnaRespondentsByGroup);
    if (groupEntries.length > 0) {
      const [topKey, topCount] = groupEntries.sort((a, b) => b[1] - a[1])[0];
      const groupLabelMap: Record<string, string> = {
        soft: "Soft Skills",
        technical: "Technical Skills",
        administrative: "Administrative Skills",
      };
      const topLabel = groupLabelMap[topKey] || topKey;
      if (topCount > 0) {
        smartInsights.push(`${topLabel} is the highest training demand (${Math.round((topCount / satnaTotal) * 100)}%). Prioritize scheduling programs under ${topLabel}.`);
      }

      const nonZeroCounts = groupEntries.map(([, v]) => v).filter((v) => v > 0);
      if (nonZeroCounts.length >= 2) {
        const max = Math.max(...nonZeroCounts);
        const min = Math.min(...nonZeroCounts);
        if (min > 0 && max / min >= 2) {
          smartAlerts.push(`SATNA training needs are imbalanced (largest group is ${Math.round(max / min)}x the smallest). Consider balancing the training plan.`);
        }
      }
    }

    // CLI career path
    if (cliCareerPaths.length > 0) {
      const topCli = cliCareerPaths.reduce((best, cur) => (cur.count > best.count ? cur : best), cliCareerPaths[0]);
      if (topCli?.count > 0) {
        smartInsights.push(`${topCli.label} is the top CLI path (${Math.round((topCli.count / cliTotal) * 100)}%). Align development opportunities with this direction.`);
      }
    }

    // IDP goals
    const idpGoalEntries = Object.entries(idpGoalCounts);
    if (idpGoalEntries.length > 0) {
      const [topGoalKey, topGoalCount] = idpGoalEntries.sort((a, b) => b[1] - a[1])[0];
      const idpGoalLabelMap: Record<string, string> = {
        meetCurrentPosition: "Meet current position competencies",
        meetNextHigherPosition: "Meet next higher position competencies",
        increaseCurrentPosition: "Increase current position competency",
        acquireNewCompetencies: "Acquire new competencies",
      };
      const goalLabel = idpGoalLabelMap[topGoalKey] || topGoalKey;
      if (topGoalCount > 0) {
        smartInsights.push(`IDP focus trend: ${goalLabel} (${Math.round((topGoalCount / idpTotal) * 100)}%). Allocate coaching/training resources accordingly.`);
      }
    }

    // Simple completeness signal (based on unique assessed users)
    const completeness = uniqueAssessedUsers === 0
      ? 0
      : Math.round(((cliSubmissions.length + satnaSubmissions.length + idpSubmissions.length) / (uniqueAssessedUsers * 3)) * 100);
        if (completeness > 0 && completeness < 60) {
      smartAlerts.push(`Low assessment completeness (${completeness}%). Send reminders to improve coverage.`);
    }

    const cliSubmitters = new Set<number>(cliSubmissions.map((s) => s.user_id));
    const satnaSubmitters = new Set<number>(satnaSubmissions.map((s) => s.user_id));
    const idpSubmitters = new Set<number>(idpSubmissions.map((s) => s.user_id));

    const groupLabelForUser = (u: User) => {
      const office = String(u.office || "").trim();
      const service = String(u.service || "").trim();
      const division = String(u.division_province || "").trim();
      return office || service || division || "Unknown";
    };

    const missingByGroupMap = new Map<string, { group: string; total: number; missingCli: number; missingSatna: number; missingIdp: number }>();

    studentUsers.forEach((u) => {
      const userId = Number(u.id);
      if (!Number.isFinite(userId)) return;

      const group = groupLabelForUser(u);
      const entry = missingByGroupMap.get(group) || { group, total: 0, missingCli: 0, missingSatna: 0, missingIdp: 0 };
      entry.total += 1;

      if (!cliSubmitters.has(userId)) entry.missingCli += 1;
      if (!satnaSubmitters.has(userId)) entry.missingSatna += 1;
      if (!idpSubmitters.has(userId)) entry.missingIdp += 1;

      missingByGroupMap.set(group, entry);
    });

    const missingByGroup = Array.from(missingByGroupMap.values())
      .sort((a, b) => (b.missingCli + b.missingSatna + b.missingIdp) - (a.missingCli + a.missingSatna + a.missingIdp));

    const topMissingStudents = studentUsers
      .map((u) => {
        const userId = Number(u.id);
        const missingCli = !cliSubmitters.has(userId);
        const missingSatna = !satnaSubmitters.has(userId);
        const missingIdp = !idpSubmitters.has(userId);
        return {
          id: userId,
          name: `${u.first_name} ${u.last_name}`.trim(),
          group: groupLabelForUser(u),
          missingCli,
          missingSatna,
          missingIdp,
          missingCount: Number(missingCli) + Number(missingSatna) + Number(missingIdp),
        };
      })
      .filter((r) => r.missingCount > 0)
      .sort((a, b) => b.missingCount - a.missingCount)
      .slice(0, 10);

    return {
      uniqueAssessedUsers,
      cliCount: cliSubmissions.length,
      satnaCount: satnaSubmissions.length,
      idpCount: idpSubmissions.length,
      pendingIdp,
      approvedIdp,
      rejectedIdp,
      cliCareerPaths,
      satnaWithDifficulties,
      satnaWithDifficultFunctions,
      satnaWithTrainingSuggestions,
      satnaTotalRespondents,
      satnaRespondentsByTopic,
      satnaTopicDistribution,
      satnaRespondentsByGroup,
      satnaTopTrainings,
      satnaLeastTrainings,
      satnaAverageTrainingsSelected,
      satnaMostCommonSkillGaps,
      idpGoalCounts,
      idpTotal,
      cliTotal,
      satnaTotal,
      idpGoalsChartData,
      cliChartData,
      satnaGroupedChartData,
      smartInsights,
      smartAlerts,
      completeness,
      missingByGroup,
      topMissingStudents,
    };
  }, [cliSubmissions, satnaSubmissions, idpSubmissions, studentUsers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assessment Intelligence</h1>
              <p className="text-sm text-muted-foreground mt-1">Simple monitoring counts and percentages for CLI, SATNA, and IDP</p>
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mb-8"
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Compliance Tracking (Missing Submissions)</h3>
            {assessmentLoading ? (
              <div className="text-sm text-muted-foreground">Loading compliance data...</div>
            ) : studentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No student roster data available.</div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-border">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left">Office / Service / Division</th>
                        <th className="border border-border p-2 text-right">Total</th>
                        <th className="border border-border p-2 text-right">Missing CLI</th>
                        <th className="border border-border p-2 text-right">Missing SATNA</th>
                        <th className="border border-border p-2 text-right">Missing IDP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentSummary.missingByGroup.slice(0, 10).map((row) => (
                        <tr key={row.group}>
                          <td className="border border-border p-2">{row.group}</td>
                          <td className="border border-border p-2 text-right">{row.total}</td>
                          <td className="border border-border p-2 text-right">{row.missingCli}</td>
                          <td className="border border-border p-2 text-right">{row.missingSatna}</td>
                          <td className="border border-border p-2 text-right">{row.missingIdp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-3">Top 10 users with missing submissions</div>
                  {assessmentSummary.topMissingStudents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Everyone has submitted all assessments.</div>
                  ) : (
                    <div className="space-y-2">
                      {assessmentSummary.topMissingStudents.map((row) => (
                        <div key={row.id} className="rounded-md border border-border bg-secondary/10 px-3 py-2 text-sm flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-foreground">{row.name}</div>
                            <div className="text-xs text-muted-foreground">{row.group}</div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {row.missingCli ? "CLI " : ""}
                            {row.missingSatna ? "SATNA " : ""}
                            {row.missingIdp ? "IDP" : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-4">Grouping uses the student’s Office first, then Service, then Division/Province. If none exist, it shows as Unknown.</div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-muted-foreground font-medium">Assessed Employees</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {assessmentLoading ? "..." : assessmentSummary.uniqueAssessedUsers}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-muted-foreground font-medium">CLI Responses</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {assessmentLoading ? "..." : assessmentSummary.cliCount}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-muted-foreground font-medium">SATNA Responses</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {assessmentLoading ? "..." : assessmentSummary.satnaCount}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-red-600" />
              <p className="text-sm text-muted-foreground font-medium">IDP Responses</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {assessmentLoading ? "..." : assessmentSummary.idpCount}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12 space-y-4"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Assessment Statistics</h3>
              <p className="text-sm text-muted-foreground">Counts and percentages of student responses for {currentYear}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => fetchAssessmentAnalytics()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => onNavigate("admin-career-leverage")}>View assessments</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-base font-semibold text-foreground mb-4">Individual Development Plan Breakdown</h4>
              <div className="space-y-4">
                {!assessmentLoading && assessmentSummary.idpCount > 0 ? (
                  <>
                    <div className="flex h-12 rounded-md overflow-hidden">
                      {[
                        {
                          key: "meetCurrentPosition",
                          label: "Meet Competencies of Current Position",
                          value: assessmentSummary.idpGoalCounts.meetCurrentPosition,
                          color: "#5b9bd5",
                        },
                        {
                          key: "meetNextHigherPosition",
                          label: "Meet Competencies of Next Higher Position",
                          value: assessmentSummary.idpGoalCounts.meetNextHigherPosition,
                          color: "#70ad47",
                        },
                        {
                          key: "increaseCurrentPosition",
                          label: "Increase Competency in Current Position",
                          value: assessmentSummary.idpGoalCounts.increaseCurrentPosition,
                          color: "#ffc000",
                        },
                        {
                          key: "acquireNewCompetencies",
                          label: "Acquire New Competencies Across Functions/Position",
                          value: assessmentSummary.idpGoalCounts.acquireNewCompetencies,
                          color: "#ed7d31",
                        },
                      ].map((item) => {
                        const percentage = Math.round((item.value / assessmentSummary.idpTotal) * 100);
                        return percentage > 0 ? (
                          <div
                            key={item.key}
                            className="flex items-center justify-center text-white font-semibold text-sm"
                            style={{ width: `${percentage}%`, backgroundColor: item.color }}
                          >
                            {percentage}%
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        {
                          key: "meetCurrentPosition",
                          label: "Meet Competencies of Current Position",
                          value: assessmentSummary.idpGoalCounts.meetCurrentPosition,
                          color: "#5b9bd5",
                        },
                        {
                          key: "meetNextHigherPosition",
                          label: "Meet Competencies of Next Higher Position",
                          value: assessmentSummary.idpGoalCounts.meetNextHigherPosition,
                          color: "#70ad47",
                        },
                        {
                          key: "increaseCurrentPosition",
                          label: "Increase Competency in Current Position",
                          value: assessmentSummary.idpGoalCounts.increaseCurrentPosition,
                          color: "#ffc000",
                        },
                        {
                          key: "acquireNewCompetencies",
                          label: "Acquire New Competencies Across Functions/Position",
                          value: assessmentSummary.idpGoalCounts.acquireNewCompetencies,
                          color: "#ed7d31",
                        },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-sm mt-0.5" style={{ backgroundColor: item.color }} />
                          <div className="flex-1">
                            <div className="text-foreground">{item.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No IDP submissions yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-base font-semibold text-foreground mb-4">Career Leverage Overview</h4>
              <div className="space-y-4">
                {!assessmentLoading && assessmentSummary.cliCount > 0 ? (
                  <>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assessmentSummary.cliChartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {assessmentSummary.cliChartData.map((_, idx) => (
                              <Cell
                                key={`cli-cell-${idx}`}
                                fill={[
                                  "#1f4e79",
                                  "#2f7ea4",
                                  "#4fb0c6",
                                  "#2f7ea4",
                                  "#bfe9df",
                                ][idx % 5]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 text-sm">
                      {assessmentSummary.cliCareerPaths.map((item, idx) => {
                        const percentage = Math.round((item.count / assessmentSummary.cliTotal) * 100);
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: [
                                  "#1f4e79",
                                  "#2f7ea4",
                                  "#4fb0c6",
                                  "#2f7ea4",
                                  "#bfe9df",
                                ][idx % 5],
                              }}
                            />
                            <span className="flex-1 text-foreground">{item.label}</span>
                            <span className="font-semibold text-foreground">{percentage}%</span>
                            <span className="text-muted-foreground">{item.count} people</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No CLI submissions yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="text-base font-semibold text-foreground mb-4">Skill Audit Overview</h4>
              {assessmentLoading ? (
                <div className="text-sm text-muted-foreground">Loading analytics...</div>
              ) : assessmentSummary.satnaTotalRespondents === 0 ? (
                <div className="text-sm text-muted-foreground">No SATNA submissions yet.</div>
              ) : (
                <div className="space-y-3">
                  {assessmentSummary.satnaTopicDistribution.slice(0, 8).map(([topic, count]: any) => {
                    const percentage = Math.round((count / assessmentSummary.satnaTotal) * 100);
                    return (
                      <div key={topic} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{topic}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">{count}</span>
                            <span className="text-muted-foreground w-10 text-right">{percentage}%</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </motion.div>

              </div>
    </div>
  );
};

export default AdminDashboard;
