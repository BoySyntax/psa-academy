import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, MessageSquare, Star, User } from "lucide-react";
import { getImageUrl } from "@/lib/apiHelper";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { managementService, TeacherRatingItem, TeacherRatingSummary } from "@/services/management";

interface TeacherRatingsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TeacherRatings = ({ user, onNavigate, onLogout }: TeacherRatingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<TeacherRatingSummary[]>([]);
  const [ratings, setRatings] = useState<TeacherRatingItem[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<TeacherRatingSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "T";
  };

  const renderStars = (avg: number) => {
    const rounded = Math.round(avg);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-4 h-4 ${n <= rounded ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    );
  };

  const toggleCard = (key: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchTeacherRatings = async () => {
    setLoading(true);
    const result = await managementService.fetchTeacherRatings();
    if (result.success) {
      setSummaries(result.summaries);
      setRatings(result.ratings);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch teacher ratings",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeacherRatings();
  }, []);

  const filteredRatings = useMemo(() => {
    if (!selectedSummary) return [];
    return ratings.filter(
      (item) => item.teacher_id === selectedSummary.teacher_id && item.course_id === selectedSummary.course_id
    );
  }, [ratings, selectedSummary]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teacher Ratings</h1>
              <p className="text-sm text-muted-foreground mt-1">Monitor course teacher ratings, averages, and feedback comments.</p>
            </div>

            <HeaderProfileMenu user={user} roleLabel="Management" onNavigate={onNavigate} onLogout={onLogout} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading teacher ratings...</div>
        ) : (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {summaries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No teacher ratings found yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {summaries.map((summary) => (
                    <motion.div key={`${summary.teacher_id}-${summary.course_id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="[perspective:1200px] h-[480px] max-w-[220px] mx-auto w-full">
                        <div
                          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flippedCards[`${summary.teacher_id}-${summary.course_id}`] ? "[transform:rotateY(180deg)]" : ""}`}
                        >
                          <Card
                            className="absolute inset-0 h-full overflow-hidden cursor-pointer [backface-visibility:hidden]"
                            onClick={() => toggleCard(`${summary.teacher_id}-${summary.course_id}`)}
                          >
                            <div className="h-[380px] bg-muted">
                              {getImageUrl(summary.teacher.profile_image_url) ? (
                                <img
                                  src={getImageUrl(summary.teacher.profile_image_url)!}
                                  alt={`${summary.teacher.first_name} ${summary.teacher.last_name}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="h-full flex items-center justify-center bg-secondary">
                                  <Avatar className="h-24 w-24">
                                    <AvatarFallback className="text-2xl">{getInitials(summary.teacher.first_name, summary.teacher.last_name)}</AvatarFallback>
                                  </Avatar>
                                </div>
                              )}
                            </div>
                            <CardContent className="pt-3 space-y-2">
                              <div>
                                <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                                  {summary.teacher.first_name} {summary.teacher.last_name}
                                </CardTitle>
                                <CardDescription className="mt-0.5 text-xs leading-snug line-clamp-2">
                                  <span className="font-medium">{summary.course.course_code}</span> • {summary.course.course_name}
                                </CardDescription>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-3">
                                  {renderStars(summary.average_rating)}
                                  <span className="font-medium">{summary.average_rating.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <BarChart3 className="w-4 h-4 text-primary" />
                                  <span>{summary.rating_count}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card
                            className="absolute inset-0 h-full overflow-hidden cursor-pointer [transform:rotateY(180deg)] [backface-visibility:hidden]"
                            onClick={() => toggleCard(`${summary.teacher_id}-${summary.course_id}`)}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">{summary.teacher.first_name} {summary.teacher.last_name}</CardTitle>
                              <CardDescription>Introduction</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Present Position</div>
                                <div className="font-medium leading-snug line-clamp-2">{summary.teacher.present_position || "Trainer"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Office/Affiliation</div>
                                <div className="font-medium leading-snug line-clamp-2">{summary.teacher.office || "—"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Region</div>
                                <div className="font-medium leading-snug line-clamp-2">{summary.teacher.division_province || "—"}</div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Trainer since</div>
                                  <div className="font-semibold">{summary.teacher.trainer_since || "—"}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Course Category</div>
                                  <div className="font-semibold line-clamp-2">{summary.course.category || "—"}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              {ratings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No teacher feedback submitted yet.</div>
              ) : (
                ratings.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-foreground">{item.teacher.first_name} {item.teacher.last_name}</div>
                            <div className="text-sm text-muted-foreground">{item.course.course_code} • {item.course.course_name}</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {item.rating}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {item.student.first_name} {item.student.last_name}
                        </div>

                        <div className="flex items-start gap-2 text-sm text-foreground">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <span>{item.comment?.trim() || "No comment provided."}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={showDetails} onOpenChange={(isOpen) => !isOpen && setShowDetails(false)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSummary ? `${selectedSummary.teacher.first_name} ${selectedSummary.teacher.last_name}` : "Teacher Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedSummary ? `${selectedSummary.course.course_code} • ${selectedSummary.course.course_name}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {filteredRatings.length === 0 ? (
              <div className="text-sm text-muted-foreground">No feedback available.</div>
            ) : (
              filteredRatings.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-medium text-foreground">
                        {item.student.first_name} {item.student.last_name}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {item.rating}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.student.email}</div>
                    <div className="text-sm text-foreground">{item.comment?.trim() || "No comment provided."}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherRatings;
