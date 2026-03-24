import { ComponentType, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, ClipboardList, Clock, Mail, Phone, User, XCircle } from "lucide-react";
import { getImageUrl } from "@/lib/apiHelper";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService, AdminCliSubmission, AdminIdpSubmission, AdminSatnaSubmission } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import { careerLeverageItems, careerLeverageResponseOptions, careerLeverageScoreGroups, computeCareerLeverageScores } from "@/data/careerLeverageInventory";

interface CombinedAssessmentRecord {
  user_id: number;
  student: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    cellphone_number?: string;
    profile_image_url?: string;
  };
  cli?: AdminCliSubmission;
  satna?: AdminSatnaSubmission;
  idp?: AdminIdpSubmission;
}

interface AdminAssessmentsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminAssessments = ({ user, onNavigate, onLogout }: AdminAssessmentsProps) => {
  const { toast } = useToast();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState<number>(currentYear);
  const [loadingCli, setLoadingCli] = useState(true);
  const [loadingSatna, setLoadingSatna] = useState(true);
  const [loadingIdp, setLoadingIdp] = useState(true);
  const [cliSubmissions, setCliSubmissions] = useState<AdminCliSubmission[]>([]);
  const [satnaSubmissions, setSatnaSubmissions] = useState<AdminSatnaSubmission[]>([]);
  const [idpSubmissions, setIdpSubmissions] = useState<AdminIdpSubmission[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CombinedAssessmentRecord | null>(null);

  const getInitials = (firstName: string, lastName: string) => `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadCli = async (selectedYear: number) => {
    setLoadingCli(true);
    const result = await adminService.fetchCareerLeverageInventory(selectedYear);
    if (result.success) {
      setCliSubmissions(result.submissions);
    } else {
      toast({ title: "Error", description: result.message || "Failed to fetch CLI results", variant: "destructive" });
    }
    setLoadingCli(false);
  };

  const loadSatna = async (selectedYear: number) => {
    setLoadingSatna(true);
    const result = await adminService.fetchSkillAudits(selectedYear);
    if (result.success) {
      setSatnaSubmissions(result.audits);
    } else {
      toast({ title: "Error", description: result.message || "Failed to fetch SATNA submissions", variant: "destructive" });
    }
    setLoadingSatna(false);
  };

  const loadIdp = async () => {
    setLoadingIdp(true);
    const result = await adminService.fetchIdps("all");
    if (result.success) {
      setIdpSubmissions(result.idps);
    } else {
      toast({ title: "Error", description: result.message || "Failed to fetch IDPs", variant: "destructive" });
    }
    setLoadingIdp(false);
  };

  useEffect(() => {
    loadCli(year);
    loadSatna(year);
    loadIdp();
  }, [year]);

  const combinedRecords = useMemo<CombinedAssessmentRecord[]>(() => {
    const map = new Map<number, CombinedAssessmentRecord>();

    cliSubmissions.forEach((submission) => {
      const existing = map.get(submission.user_id);
      map.set(submission.user_id, {
        user_id: submission.user_id,
        student: existing?.student || submission.student,
        cli: submission,
        satna: existing?.satna,
        idp: existing?.idp,
      });
    });

    satnaSubmissions.forEach((submission) => {
      const existing = map.get(submission.user_id);
      map.set(submission.user_id, {
        user_id: submission.user_id,
        student: existing?.student || submission.student,
        cli: existing?.cli,
        satna: submission,
        idp: existing?.idp,
      });
    });

    idpSubmissions.forEach((submission) => {
      const existing = map.get(submission.user_id);
      map.set(submission.user_id, {
        user_id: submission.user_id,
        student: existing?.student || submission.student,
        cli: existing?.cli,
        satna: existing?.satna,
        idp: submission,
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      const aName = `${a.student.first_name} ${a.student.last_name}`.toLowerCase();
      const bName = `${b.student.first_name} ${b.student.last_name}`.toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [cliSubmissions, satnaSubmissions, idpSubmissions]);

  const renderDesiredTrainings = (audit: any) => {
    if (!audit?.desired_trainings) return <span className="text-sm text-muted-foreground">—</span>;

    const grouped: Record<string, { label: string; rank: string }[]> = {};
    Object.entries(audit.desired_trainings).forEach(([key, val]: [string, any]) => {
      if (val?.selected && val?.rank && val.rank !== "") {
        const [topic, item] = key.split("::");
        if (!grouped[topic]) grouped[topic] = [];
        grouped[topic].push({ label: item, rank: val.rank });
      }
    });

    if (Object.keys(grouped).length === 0) return <span className="text-sm text-muted-foreground">—</span>;

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([topic, items]) => (
          <div key={topic}>
            <div className="text-sm font-semibold mb-2">{topic}</div>
            <ul className="space-y-1 text-sm">
              {items.sort((a, b) => Number(a.rank) - Number(b.rank)).map(({ label, rank }) => (
                <li key={`${topic}-${label}`} className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">Rank {rank}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderComputerLiteracy = (audit: any) => {
    const literacy = audit?.computer_literacy || {};
    const rows = [
      { label: "Word Processing Software (MS Word, OpenOffice, etc.)", key: "word_processing" },
      { label: "Spreadsheet Software (MS Excel, OpenOffice, etc.)", key: "spreadsheet" },
      { label: "Accounting System (FRS, in-house Accounting System, Quickbox, etc.)", key: "accounting" },
      { label: "Database (MS Access, dBase, Foxbase, SQL, etc.)", key: "database" },
      { label: "Graphics and Animation (Adobe Illustrator, Photoshop, Paintshop, etc.)", key: "graphics" },
      { label: "Statistical Analysis Software", key: "statistical_analysis" },
      { label: "Internet Browsing", key: "internet_browsing" },
      { label: "Email Software", key: "email" },
      { label: "Other Software", key: "other_software_proficiency" },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-border">
          <thead>
            <tr className="bg-secondary">
              <th className="border border-border p-2 text-left">Type of Software</th>
              <th className="border border-border p-2 text-left">Level of Proficiency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rawValue = literacy[row.key];
              const prof = typeof rawValue === "object" && rawValue !== null ? rawValue.proficiency || "NA" : rawValue || "NA";
              const otherLabel = row.key === "other_software_proficiency" ? literacy?.other_software_name || "" : "";
              return (
                <tr key={row.key}>
                  <td className="border border-border p-2">
                    {row.label}
                    {row.key === "other_software_proficiency" && otherLabel && <div className="mt-1 font-normal">{otherLabel}</div>}
                  </td>
                  <td className="border border-border p-2">{prof}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEmpty = (label: string, icon: ComponentType<any>) => {
    const Icon = icon;
    return (
      <div className="text-center py-12">
        <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No {label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Assessments</h1>
              <p className="text-sm text-muted-foreground mt-1">Open one employee and see CLI, SATNA, and IDP together</p>
            </div>
            <HeaderProfileMenu user={user} roleLabel="Admin" onNavigate={onNavigate} onLogout={onLogout} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="text-sm font-medium text-muted-foreground">Year</div>
            <Input className="w-32" type="number" value={year} onChange={(e) => setYear(Number(e.target.value || currentYear))} />
            <Button variant="outline" onClick={() => { loadCli(year); loadSatna(year); loadIdp(); }}>Refresh</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loadingCli || loadingSatna || loadingIdp ? (
          <div className="text-center py-12 text-muted-foreground">Loading employee assessments...</div>
        ) : combinedRecords.length === 0 ? (
          renderEmpty("assessment records", ClipboardList)
        ) : (
          <div className="space-y-4">
            {combinedRecords.map((record) => {
              const cliScore = record.cli?.cli?.scores || computeCareerLeverageScores(record.cli?.cli?.answers || {});
              return (
                <motion.div
                  key={record.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getImageUrl(record.student.profile_image_url) || undefined} />
                        <AvatarFallback>{getInitials(record.student.first_name, record.student.last_name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">
                          {record.student.first_name} {record.student.middle_name || ""} {record.student.last_name}
                        </h4>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{record.student.email}</span>
                          </div>
                          {record.student.cellphone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{record.student.cellphone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <div className="text-xs text-muted-foreground">CLI</div>
                        <div className="mt-1 font-semibold">{record.cli ? "Available" : "No submission"}</div>
                        {record.cli && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Highest: {cliScore.highestList && cliScore.highestList.length > 0
                              ? cliScore.highestList.map((h: any) => h.label).join(" / ")
                              : cliScore.highest?.label || "—"}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <div className="text-xs text-muted-foreground">SATNA</div>
                        <div className="mt-1 font-semibold">{record.satna ? "Available" : "No submission"}</div>
                        {record.satna && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Year: {record.satna.year}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <div className="text-xs text-muted-foreground">IDP</div>
                        <div className="mt-1 font-semibold">{record.idp ? record.idp.status.toUpperCase() : "No submission"}</div>
                        {record.idp?.submitted_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(record.idp.submitted_at)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:w-32">
                      <Button onClick={() => setSelectedRecord(record)} variant="outline" size="sm" className="flex-1 lg:flex-none">
                        View All
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Assessment Details</DialogTitle>
            <DialogDescription>
              {selectedRecord ? `${selectedRecord.student.first_name} ${selectedRecord.student.last_name} • All available submissions together` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <Tabs defaultValue="cli" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cli">CLI</TabsTrigger>
                  <TabsTrigger value="satna">SATNA</TabsTrigger>
                  <TabsTrigger value="idp">IDP</TabsTrigger>
                </TabsList>

                <TabsContent value="cli" className="space-y-4 mt-4">
                  {!selectedRecord.cli ? (
                    <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">No CLI submission for this employee.</div>
                  ) : (
                    <>
                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="border-b border-border bg-background px-4 py-4">
                          <div className="text-xl font-bold tracking-wide">CAREER LEVERAGE SCORING</div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[700px] border-collapse">
                            <tbody>
                              {[
                                [3, 2, 1, 5, 4],
                                [8, 7, 6, 10, 9],
                                [13, 12, 11, 15, 14],
                                [18, 17, 16, 20, 19],
                                [23, 22, 21, 25, 24],
                                [28, 27, 26, 30, 29],
                                [33, 32, 31, 35, 34],
                              ].map((row, idx) => (
                                <tr key={idx}>
                                  {row.map((value) => (
                                    <td
                                      key={value}
                                      className="border border-border bg-sky-50 dark:bg-sky-950/30 p-6 text-center text-3xl font-extrabold text-sky-700 dark:text-sky-200"
                                    >
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              <tr className="bg-background">
                                {careerLeverageScoreGroups.map((group) => {
                                  const scoreResult = selectedRecord.cli?.cli?.scores || computeCareerLeverageScores(selectedRecord.cli?.cli?.answers || {});
                                  return (
                                    <td key={group.key} className="border border-border bg-secondary/40 p-4 text-center align-top">
                                      <div className="text-base font-extrabold uppercase tracking-wide text-foreground">{group.label}</div>
                                      <div className="mt-2 text-3xl font-extrabold text-foreground">{scoreResult.totals?.[group.key] ?? 0}</div>
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1100px] border-collapse">
                            <thead>
                              <tr className="bg-muted/70">
                                <th className="border border-border p-3 text-center text-sm font-bold w-[55%]">ITEMS</th>
                                {careerLeverageResponseOptions.map((option) => (
                                  <th key={option.value} className="border border-border p-2 text-center text-[11px] font-semibold align-middle w-[7.5%]">
                                    <div className="leading-tight">{option.label}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {careerLeverageItems.map((item, index) => {
                                const itemNumber = index + 1;
                                const answer = String(selectedRecord.cli?.cli?.answers?.[itemNumber] ?? "");
                                return (
                                  <tr key={itemNumber} className="align-top">
                                    <td className="border border-border p-3 text-sm font-medium leading-snug">{itemNumber}. {item}</td>
                                    {careerLeverageResponseOptions.map((option) => (
                                      <td key={`${itemNumber}-${option.value}`} className={`border border-border p-4 text-center text-lg font-bold ${answer === option.value ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>
                                        {answer === option.value ? option.short : ""}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="satna" className="space-y-4 mt-4">
                  {!selectedRecord.satna ? (
                    <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">No SATNA submission for this employee.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-border p-4"><div className="flex items-center gap-2 text-sm font-semibold mb-2"><User className="w-4 h-4" />Personal Information</div><div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"><div><span className="font-medium">Name:</span> {selectedRecord.satna?.audit?.personal?.name_of_employee || "—"}</div><div><span className="font-medium">Position:</span> {selectedRecord.satna?.audit?.personal?.present_position || "—"}</div><div><span className="font-medium">Age:</span> {selectedRecord.satna?.audit?.personal?.age || "—"}</div><div><span className="font-medium">Sex:</span> {selectedRecord.satna?.audit?.personal?.sex || "—"}</div><div><span className="font-medium">Province/Division/Unit:</span> {selectedRecord.satna?.audit?.personal?.province_division_unit || "—"}</div><div><span className="font-medium">Length of Service:</span> {selectedRecord.satna?.audit?.personal?.length_of_service_present_position || "—"}</div><div className="md:col-span-2"><span className="font-medium">Highest Educational Attainment:</span> {selectedRecord.satna?.audit?.personal?.highest_educational_attainment || "—"}</div></div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">II. Level of Computer Literacy</div>{renderComputerLiteracy(selectedRecord.satna?.audit)}</div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">III. Present Functions</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.satna?.audit?.present_functions || "—"}</div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">IV. Competent to Perform</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.satna?.audit?.competent_to_perform || "—"}</div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">V. Difficult to Perform</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.satna?.audit?.difficult_to_perform || "—"}</div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">VI. DESIRED TRAININGS (You are given sets of training categorized according to Main Topic. Please pick three top choices trainings and then among each set pick three top choices for each set applicable to your current position by ticking and ranking them accordingly Rank 1,2,3)</div>{renderDesiredTrainings(selectedRecord.satna?.audit)}</div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">Other Training Suggestions</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.satna?.audit?.other_training_suggestions || "—"}</div></div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="idp" className="space-y-4 mt-4">
                  {!selectedRecord.idp ? (
                    <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">No IDP submission for this employee.</div>
                  ) : (
                    <div className="space-y-4">
                      {selectedRecord.idp.status === "rejected" && (selectedRecord.idp.rejection_reason || selectedRecord.idp.management_message) && (
                        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
                          <div className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">Rejection / Message</div>
                          <div className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
                            {selectedRecord.idp.rejection_reason || selectedRecord.idp.management_message}
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">I. Employee Information</div><div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"><div><span className="font-medium">Surname:</span> {selectedRecord.idp?.idp?.employee_info?.surname || "—"}</div><div><span className="font-medium">First Name:</span> {selectedRecord.idp?.idp?.employee_info?.first_name || "—"}</div><div><span className="font-medium">Middle Name:</span> {selectedRecord.idp?.idp?.employee_info?.middle_name || "—"}</div><div><span className="font-medium">Section:</span> {selectedRecord.idp?.idp?.employee_info?.section || "—"}</div><div><span className="font-medium">Current Position:</span> {selectedRecord.idp?.idp?.employee_info?.current_position || "—"}</div><div><span className="font-medium">Unit/Service:</span> {selectedRecord.idp?.idp?.employee_info?.unit_service || "—"}</div><div><span className="font-medium">Salary Grade:</span> {selectedRecord.idp?.idp?.employee_info?.salary_grade || "—"}</div><div><span className="font-medium">Office:</span> {selectedRecord.idp?.idp?.employee_info?.office || "—"}</div><div><span className="font-medium">Years Current Position:</span> {selectedRecord.idp?.idp?.employee_info?.years_current_position || "—"}</div><div><span className="font-medium">Years in PSA:</span> {selectedRecord.idp?.idp?.employee_info?.years_in_psa || "—"}</div></div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">II. Purpose</div><div className="text-sm space-y-1"><div>• Meet competencies of current position: {selectedRecord.idp?.idp?.purpose?.meet_current_position ? "Yes" : "No"}</div><div>• Meet competencies of next higher position: {selectedRecord.idp?.idp?.purpose?.meet_next_higher_position ? "Yes" : "No"}</div><div>• Increase competency level of current position: {selectedRecord.idp?.idp?.purpose?.increase_current_position ? "Yes" : "No"}</div><div>• Acquire new competencies across functions/position: {selectedRecord.idp?.idp?.purpose?.acquire_new_competencies ? "Yes" : "No"}</div></div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">III. Career Development</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.idp?.idp?.career_development_required || "—"}</div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">IV. Long Term Career Goal</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.idp?.idp?.employee_goals_2026_2030 || "—"}</div></div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="text-sm font-semibold mb-2">Long Term Training</div>
                        {Array.isArray(selectedRecord.idp?.idp?.long_term_training) && selectedRecord.idp.idp.long_term_training.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse border border-border">
                              <thead>
                                <tr className="bg-secondary">
                                  <th className="border border-border p-2 text-left">Area for Development</th>
                                  <th className="border border-border p-2 text-left">Activity</th>
                                  <th className="border border-border p-2 text-left">Target Completion</th>
                                  <th className="border border-border p-2 text-left">Responsible</th>
                                  <th className="border border-border p-2 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedRecord.idp.idp.long_term_training.map((row: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="border border-border p-2">{row.area || "—"}</td>
                                    <td className="border border-border p-2">{row.activity || "—"}</td>
                                    <td className="border border-border p-2">{row.target_completion_date || "—"}</td>
                                    <td className="border border-border p-2">{row.responsible || "—"}</td>
                                    <td className="border border-border p-2">{row.status || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No long-term training entries</div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">V. Experience During This Year</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.idp?.idp?.experience_during_this_year || "—"}</div></div>
                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">VI. Short Term Goal</div><div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm"><div><span className="font-medium">Next Step Position:</span> {selectedRecord.idp?.idp?.short_term_goal?.next_step_position || "—"}</div><div><span className="font-medium">Operating Unit:</span> {selectedRecord.idp?.idp?.short_term_goal?.operating_unit || "—"}</div><div><span className="font-medium">Functional Type:</span> {selectedRecord.idp?.idp?.short_term_goal?.functional_type || "—"}</div><div><span className="font-medium">Ready In:</span> {selectedRecord.idp?.idp?.short_term_goal?.ready_in || "—"}</div></div></div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="text-sm font-semibold mb-2">Short Term Training (Next Year)</div>
                        {Array.isArray(selectedRecord.idp?.idp?.short_term_training_next_year) && selectedRecord.idp.idp.short_term_training_next_year.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse border border-border">
                              <thead>
                                <tr className="bg-secondary">
                                  <th className="border border-border p-2 text-left">Area</th>
                                  <th className="border border-border p-2 text-left">Priority for IDP</th>
                                  <th className="border border-border p-2 text-left">Activity</th>
                                  <th className="border border-border p-2 text-left">Target Completion</th>
                                  <th className="border border-border p-2 text-left">Responsible</th>
                                  <th className="border border-border p-2 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedRecord.idp.idp.short_term_training_next_year.map((row: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="border border-border p-2">{row.area || "—"}</td>
                                    <td className="border border-border p-2">{row.priority_for_idp || "—"}</td>
                                    <td className="border border-border p-2">{row.activity || "—"}</td>
                                    <td className="border border-border p-2">{row.target_completion_date || "—"}</td>
                                    <td className="border border-border p-2">{row.responsible || "—"}</td>
                                    <td className="border border-border p-2">{row.status || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No short-term training entries</div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border p-4"><div className="text-sm font-semibold mb-2">VII. Experience During Past Year</div><div className="text-sm whitespace-pre-wrap">{selectedRecord.idp?.idp?.experience_during_past_year || "—"}</div></div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="text-sm font-semibold mb-2">Electronic Certification</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                            <div className="font-medium text-blue-900 dark:text-blue-200">Employee Submission</div>
                            <div className="text-blue-700 dark:text-blue-300">
                              {selectedRecord.idp?.submitted_at ? (
                                <>Submitted on {formatDate(selectedRecord.idp.submitted_at)} by {selectedRecord.student.first_name} {selectedRecord.student.last_name}</>
                              ) : (
                                <>Not yet submitted</>
                              )}
                            </div>
                          </div>

                          {selectedRecord.idp?.status === "approved" && (
                            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                              <div className="font-medium text-green-900 dark:text-green-200">Management Approval</div>
                              <div className="text-green-700 dark:text-green-300">
                                Approved on {formatDate(selectedRecord.idp.approved_at)} by {selectedRecord.idp.approver ? `${selectedRecord.idp.approver.first_name} ${selectedRecord.idp.approver.last_name}` : "Management"}
                              </div>
                            </div>
                          )}

                          {selectedRecord.idp?.status === "rejected" && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
                              <div className="font-medium text-red-900 dark:text-red-200">Management Decision</div>
                              <div className="text-red-700 dark:text-red-300">
                                Rejected on {formatDate(selectedRecord.idp.approved_at)} by {selectedRecord.idp.approver ? `${selectedRecord.idp.approver.first_name} ${selectedRecord.idp.approver.last_name}` : "Management"}
                                {(selectedRecord.idp.rejection_reason || selectedRecord.idp.management_message) && (
                                  <div className="mt-1 italic">Reason: {selectedRecord.idp.rejection_reason || selectedRecord.idp.management_message}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedRecord.idp?.status === "pending" && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                              <div className="font-medium text-yellow-900 dark:text-yellow-200">Pending Approval</div>
                              <div className="text-yellow-700 dark:text-yellow-300">
                                This IDP is pending review by Management
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAssessments;
