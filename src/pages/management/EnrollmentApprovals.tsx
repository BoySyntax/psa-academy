import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, BookOpen, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { useToast } from "@/hooks/use-toast";
import { managementService, PendingEnrollment } from "@/services/management";
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

interface EnrollmentApprovalsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const EnrollmentApprovals = ({ user, onNavigate, onLogout }: EnrollmentApprovalsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState<PendingEnrollment[]>([]);
  const [rejectedEnrollments, setRejectedEnrollments] = useState<PendingEnrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<PendingEnrollment | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchEnrollments = async () => {
    setLoading(true);
    
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      managementService.fetchEnrollments('pending'),
      managementService.fetchEnrollments('enrolled'),
      managementService.fetchEnrollments('rejected')
    ]);

    if (pendingRes.success) {
      setPendingEnrollments(pendingRes.enrollments);
    }
    if (approvedRes.success) {
      setApprovedEnrollments(approvedRes.enrollments);
    }
    if (rejectedRes.success) {
      setRejectedEnrollments(rejectedRes.enrollments);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleApprove = async (enrollment: PendingEnrollment) => {
    setProcessing(true);
    const result = await managementService.approveEnrollment({
      enrollment_id: enrollment.enrollment_id,
      action: 'approve',
      management_user_id: user.id,
      management_message: `Your enrollment in ${enrollment.course.course_name} has been approved.`
    });

    if (result.success) {
      toast({
        title: "Enrollment Approved",
        description: `${enrollment.student.first_name} ${enrollment.student.last_name} has been enrolled in ${enrollment.course.course_name}`,
      });
      await fetchEnrollments();
    } else {
      toast({
        title: "Approval Failed",
        description: result.message || "Failed to approve enrollment",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const handleRejectClick = (enrollment: PendingEnrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedEnrollment) return;

    setProcessing(true);
    const result = await managementService.approveEnrollment({
      enrollment_id: selectedEnrollment.enrollment_id,
      action: 'reject',
      management_user_id: user.id,
      rejection_reason: rejectionReason,
      management_message: rejectionReason,
    });

    if (result.success) {
      toast({
        title: "Enrollment Rejected",
        description: `Application from ${selectedEnrollment.student.first_name} ${selectedEnrollment.student.last_name} has been rejected`,
      });
      setShowRejectDialog(false);
      setSelectedEnrollment(null);
      await fetchEnrollments();
    } else {
      toast({
        title: "Rejection Failed",
        description: result.message || "Failed to reject enrollment",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EnrollmentCard = ({ enrollment, showActions = false }: { enrollment: PendingEnrollment; showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={enrollment.student.profile_image_url || undefined} />
            <AvatarFallback>
              {getInitials(enrollment.student.first_name, enrollment.student.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">
              {enrollment.student.first_name} {enrollment.student.middle_name || ''} {enrollment.student.last_name}
            </h4>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{enrollment.student.email}</span>
              </div>
              {enrollment.student.cellphone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{enrollment.student.cellphone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{enrollment.course.course_name}</p>
              <p className="text-sm text-muted-foreground">{enrollment.course.course_code}</p>
              {enrollment.course.category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {enrollment.course.category} {enrollment.course.subcategory ? `• ${enrollment.course.subcategory}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Applied: {formatDate(enrollment.enrollment_date)}</span>
          </div>

          {enrollment.status === 'rejected' && enrollment.rejection_reason && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">Rejection Reason:</p>
              <p className="text-xs text-red-700 dark:text-red-300">{enrollment.rejection_reason}</p>
            </div>
          )}

          {enrollment.approver && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>
                {enrollment.status === 'enrolled' ? 'Approved' : 'Rejected'} by {enrollment.approver.first_name} {enrollment.approver.last_name}
                {enrollment.approved_at && ` on ${formatDate(enrollment.approved_at)}`}
              </span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex lg:flex-col gap-2 lg:w-32">
            <Button
              onClick={() => handleApprove(enrollment)}
              disabled={processing}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleRejectClick(enrollment)}
              disabled={processing}
              variant="destructive"
              size="sm"
              className="flex-1 lg:flex-none"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Enrollment Approvals</h1>
              <p className="text-sm text-muted-foreground mt-1">Review and approve student applications</p>
            </div>

            <HeaderProfileMenu
              user={user}
              roleLabel="Management"
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Enrollment Applications</h2>
          <p className="text-muted-foreground">Manage course enrollment requests</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedEnrollments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading pending enrollments...</div>
            ) : pendingEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending enrollments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.enrollment_id} enrollment={enrollment} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading approved enrollments...</div>
            ) : approvedEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved enrollments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.enrollment_id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading rejected enrollments...</div>
            ) : rejectedEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rejected enrollments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rejectedEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.enrollment_id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this enrollment application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={processing}>
              {processing ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentApprovals;
