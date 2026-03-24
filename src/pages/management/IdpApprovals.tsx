import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, ClipboardList, Calendar } from "lucide-react";
import { getImageUrl } from "@/lib/apiHelper";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { useToast } from "@/hooks/use-toast";
import { managementService, PendingIdp } from "@/services/management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IdpApprovalsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const IdpApprovals = ({ user, onNavigate, onLogout }: IdpApprovalsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingIdps, setPendingIdps] = useState<PendingIdp[]>([]);
  const [approvedIdps, setApprovedIdps] = useState<PendingIdp[]>([]);
  const [rejectedIdps, setRejectedIdps] = useState<PendingIdp[]>([]);
  const [selectedIdp, setSelectedIdp] = useState<PendingIdp | null>(null);
  const [viewIdp, setViewIdp] = useState<PendingIdp | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchIdps = async () => {
    setLoading(true);

    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      managementService.fetchIdps("pending"),
      managementService.fetchIdps("approved"),
      managementService.fetchIdps("rejected"),
    ]);

    if (pendingRes.success) setPendingIdps(pendingRes.idps);
    if (approvedRes.success) setApprovedIdps(approvedRes.idps);
    if (rejectedRes.success) setRejectedIdps(rejectedRes.idps);

    setLoading(false);
  };

  useEffect(() => {
    fetchIdps();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  };

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

  const handleApprove = async (idp: PendingIdp) => {
    setProcessing(true);
    const requestPayload = {
      user_id: idp.user_id,
      action: "approve" as const,
      management_user_id: user.id,
      management_message: "Your IDP has been approved.",
    };

    const result = await managementService.approveIdp(requestPayload);

    if (result.success) {
      toast({
        title: "IDP Approved",
        description: `${idp.student.first_name} ${idp.student.last_name}'s IDP has been approved.`,
      });
      await fetchIdps();
    } else {
      toast({
        title: "Approval Failed",
        description: result.message || "Failed to approve IDP",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const handleRejectClick = (idp: PendingIdp) => {
    setSelectedIdp(idp);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleViewClick = (idp: PendingIdp) => {
    setViewIdp(idp);
    setShowViewDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedIdp) return;

    setProcessing(true);
    const result = await managementService.approveIdp({
      user_id: selectedIdp.user_id,
      action: "reject",
      management_user_id: user.id,
      rejection_reason: rejectionReason,
      management_message: rejectionReason,
    });

    if (result.success) {
      toast({
        title: "IDP Rejected",
        description: `${selectedIdp.student.first_name} ${selectedIdp.student.last_name}'s IDP has been rejected.`,
      });
      setShowRejectDialog(false);
      setSelectedIdp(null);
      await fetchIdps();
    } else {
      toast({
        title: "Rejection Failed",
        description: result.message || "Failed to reject IDP",
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  const IdpCard = ({ idp, showActions = false }: { idp: PendingIdp; showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getImageUrl(idp.student.profile_image_url) || undefined} />
            <AvatarFallback>{getInitials(idp.student.first_name, idp.student.last_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">
              {idp.student.first_name} {idp.student.middle_name || ""} {idp.student.last_name}
            </h4>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{idp.student.email}</span>
              </div>
              {idp.student.cellphone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{idp.student.cellphone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Individual Development Plan</p>
              <p className="text-sm text-muted-foreground">Student ID: {idp.user_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Submitted: {formatDate(idp.submitted_at)}</span>
          </div>

          {idp.status === "rejected" && idp.rejection_reason && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">Rejection Reason:</p>
              <p className="text-xs text-red-700 dark:text-red-300">{idp.rejection_reason}</p>
            </div>
          )}

          {idp.approver && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>
                {idp.status === "approved" ? "Approved" : "Rejected"} by {idp.approver.first_name} {idp.approver.last_name}
                {idp.approved_at && ` on ${formatDate(idp.approved_at)}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex lg:flex-col gap-2 lg:w-32">
          <Button
            onClick={() => handleViewClick(idp)}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none"
          >
            View
          </Button>

        {showActions && (
          <>
            <Button
              onClick={() => handleApprove(idp)}
              disabled={processing}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleRejectClick(idp)}
              disabled={processing}
              variant="destructive"
              size="sm"
              className="flex-1 lg:flex-none"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </>
        )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">IDP Approvals</h1>
              <p className="text-sm text-muted-foreground mt-1">Review and approve student IDPs</p>
            </div>

            <HeaderProfileMenu user={user} roleLabel="Management" onNavigate={onNavigate} onLogout={onLogout} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingIdps.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedIdps.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedIdps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading pending IDPs...</div>
            ) : pendingIdps.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending IDPs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingIdps.map((idp) => (
                  <IdpCard key={idp.user_id} idp={idp} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading approved IDPs...</div>
            ) : approvedIdps.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved IDPs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedIdps.map((idp) => (
                  <IdpCard key={idp.user_id} idp={idp} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading rejected IDPs...</div>
            ) : rejectedIdps.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rejected IDPs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedIdps.map((idp) => (
                  <IdpCard key={idp.user_id} idp={idp} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject IDP</DialogTitle>
            <DialogDescription>Provide a reason for rejection. This will be sent to the student.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={processing || !rejectionReason.trim()}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>IDP Details</DialogTitle>
            <DialogDescription>
              {viewIdp
                ? `${viewIdp.student.first_name} ${viewIdp.student.last_name} • Status: ${viewIdp.status}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">I. Employee Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Surname:</span> {viewIdp?.idp?.employee_info?.surname || "—"}</div>
                <div><span className="font-medium">First Name:</span> {viewIdp?.idp?.employee_info?.first_name || "—"}</div>
                <div><span className="font-medium">Middle Name:</span> {viewIdp?.idp?.employee_info?.middle_name || "—"}</div>
                <div><span className="font-medium">Section:</span> {viewIdp?.idp?.employee_info?.section || "—"}</div>
                <div><span className="font-medium">Current Position:</span> {viewIdp?.idp?.employee_info?.current_position || "—"}</div>
                <div><span className="font-medium">Unit/Service:</span> {viewIdp?.idp?.employee_info?.unit_service || "—"}</div>
                <div><span className="font-medium">Salary Grade:</span> {viewIdp?.idp?.employee_info?.salary_grade || "—"}</div>
                <div><span className="font-medium">Office:</span> {viewIdp?.idp?.employee_info?.office || "—"}</div>
                <div><span className="font-medium">Years Current Position:</span> {viewIdp?.idp?.employee_info?.years_current_position || "—"}</div>
                <div><span className="font-medium">Years in PSA:</span> {viewIdp?.idp?.employee_info?.years_in_psa || "—"}</div>
                <div className="md:col-span-2"><span className="font-medium">Employment Status:</span> {viewIdp?.idp?.employee_info?.employment_status || "—"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">II. Purpose</div>
              <div className="text-sm space-y-1">
                <div>• Meet competencies of current position: {viewIdp?.idp?.purpose?.meet_current_position ? "Yes" : "No"}</div>
                <div>• Meet competencies of next higher position: {viewIdp?.idp?.purpose?.meet_next_higher_position ? "Yes" : "No"}</div>
                <div>• Increase competency level of current position: {viewIdp?.idp?.purpose?.increase_current_position ? "Yes" : "No"}</div>
                <div>• Acquire new competencies across functions/position: {viewIdp?.idp?.purpose?.acquire_new_competencies ? "Yes" : "No"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">III. Career Development</div>
              <div className="text-sm">
                <span className="font-medium">Career development required:</span> {viewIdp?.idp?.career_development_required || "—"}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">IV. Long Term Career Goal (Employee Goals 2026-2030)</div>
              <div className="text-sm whitespace-pre-wrap mb-3">{viewIdp?.idp?.employee_goals_2026_2030 || "—"}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
                <div><span className="font-medium">Long-term Position:</span> {viewIdp?.idp?.long_term_career_goal?.long_term_position || "—"}</div>
                <div><span className="font-medium">Operating Unit:</span> {viewIdp?.idp?.long_term_career_goal?.operating_unit || "—"}</div>
                {viewIdp?.idp?.long_term_career_goal?.operating_unit === "Service" && (
                  <div><span className="font-medium">Service:</span> {viewIdp?.idp?.long_term_career_goal?.service || "—"}</div>
                )}
                {viewIdp?.idp?.long_term_career_goal?.operating_unit === "Unit" && (
                  <div><span className="font-medium">Unit:</span> {viewIdp?.idp?.long_term_career_goal?.unit || "—"}</div>
                )}
                {viewIdp?.idp?.long_term_career_goal?.operating_unit === "Division" && (
                  <div><span className="font-medium">Division:</span> {viewIdp?.idp?.long_term_career_goal?.division || "—"}</div>
                )}
                <div><span className="font-medium">Functional Type:</span> {viewIdp?.idp?.long_term_career_goal?.functional_type || "—"}</div>
                <div><span className="font-medium">Ready In:</span> {viewIdp?.idp?.long_term_career_goal?.ready_in || "—"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">Long Term Training</div>
              {viewIdp?.idp?.long_term_training && viewIdp.idp.long_term_training.length > 0 ? (
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
                      {viewIdp.idp.long_term_training.map((row: any, idx: number) => (
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

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">V. Experience During This Year</div>
              <div className="text-sm whitespace-pre-wrap">{viewIdp?.idp?.experience_during_this_year || "—"}</div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">VI. Short Term Goal</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Next Step Position:</span> {viewIdp?.idp?.short_term_goal?.next_step_position || "—"}</div>
                <div><span className="font-medium">Operating Unit:</span> {viewIdp?.idp?.short_term_goal?.operating_unit || "—"}</div>
                {viewIdp?.idp?.short_term_goal?.operating_unit === "Service" && (
                  <div><span className="font-medium">Service:</span> {viewIdp?.idp?.short_term_goal?.service || "—"}</div>
                )}
                {viewIdp?.idp?.short_term_goal?.operating_unit === "Unit" && (
                  <div><span className="font-medium">Unit:</span> {viewIdp?.idp?.short_term_goal?.unit || "—"}</div>
                )}
                {viewIdp?.idp?.short_term_goal?.operating_unit === "Division" && (
                  <div><span className="font-medium">Division:</span> {viewIdp?.idp?.short_term_goal?.division || "—"}</div>
                )}
                <div><span className="font-medium">Functional Type:</span> {viewIdp?.idp?.short_term_goal?.functional_type || "—"}</div>
                <div><span className="font-medium">Ready In:</span> {viewIdp?.idp?.short_term_goal?.ready_in || "—"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">Short Term Training (Next Year)</div>
              {viewIdp?.idp?.short_term_training_next_year && viewIdp.idp.short_term_training_next_year.length > 0 ? (
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
                      {viewIdp.idp.short_term_training_next_year.map((row: any, idx: number) => (
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

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">VII. Experience During Past Year</div>
              <div className="text-sm whitespace-pre-wrap">{viewIdp?.idp?.experience_during_past_year || "—"}</div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">Electronic Certification</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900">Employee Submission</div>
                  <div className="text-blue-700">
                    {viewIdp?.submitted_at ? (
                      <>Submitted on {new Date(viewIdp.submitted_at).toLocaleDateString()} by {viewIdp.student?.first_name} {viewIdp.student?.last_name}</>
                    ) : (
                      <>Not yet submitted</>
                    )}
                  </div>
                </div>
                
                {viewIdp?.status === "approved" && viewIdp?.approved_at && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-900">Management Approval</div>
                    <div className="text-green-700">
                      Approved on {new Date(viewIdp.approved_at).toLocaleDateString()} by {viewIdp.approved_by || "Management"}
                    </div>
                  </div>
                )}
                
                {viewIdp?.status === "rejected" && viewIdp?.approved_at && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-900">Management Decision</div>
                    <div className="text-red-700">
                      Rejected on {new Date(viewIdp.approved_at).toLocaleDateString()} by {viewIdp.approved_by || "Management"}
                      {viewIdp.rejection_reason && (
                        <div className="mt-1 italic">Reason: {viewIdp.rejection_reason}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {viewIdp?.status === "pending" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-900">Pending Approval</div>
                    <div className="text-yellow-700">
                      This IDP is pending review by Management
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdpApprovals;
