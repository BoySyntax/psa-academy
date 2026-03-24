import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminService, User } from "@/services/admin";

interface TrainerListProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TrainerList = ({ user, onNavigate, onLogout }: TrainerListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "T";
  };

  const toggleCard = (key: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchTrainers = async () => {
    setLoading(true);
    const result = await adminService.getUsersByType("teacher");
    if (result.success) {
      setTrainers(result.users);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch trainers",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const filteredTrainers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return trainers;

    return trainers.filter((trainer) => {
      const fullName = `${trainer.first_name} ${trainer.last_name}`.toLowerCase();
      return (
        fullName.includes(query) ||
        trainer.email.toLowerCase().includes(query) ||
        (trainer.present_position || "").toLowerCase().includes(query) ||
        (trainer.office || "").toLowerCase().includes(query) ||
        (trainer.division_province || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery, trainers]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6" />
                Trainers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">View all trainer profiles without ratings or feedback</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trainers by name, position, office, or region..."
            />
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="text-sm text-muted-foreground">Total Trainers</div>
            <div className="text-2xl font-bold text-foreground">{filteredTrainers.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading trainers...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No trainers found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredTrainers.map((trainer) => {
              const key = trainer.id;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="[perspective:1200px] h-[480px] max-w-[220px] mx-auto w-full">
                    <div
                      className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flippedCards[key] ? "[transform:rotateY(180deg)]" : ""}`}
                    >
                      <Card
                        className="absolute inset-0 h-full overflow-hidden cursor-pointer [backface-visibility:hidden]"
                        onClick={() => toggleCard(key)}
                      >
                        <div className="h-[380px] bg-muted">
                          {trainer.profile_image_url ? (
                            <img
                              src={trainer.profile_image_url}
                              alt={`${trainer.first_name} ${trainer.last_name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center bg-secondary">
                              <Avatar className="h-24 w-24">
                                <AvatarImage src={trainer.profile_image_url || undefined} />
                                <AvatarFallback className="text-2xl">{getInitials(trainer.first_name, trainer.last_name)}</AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                        <CardContent className="pt-3 space-y-2">
                          <div>
                            <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                              {trainer.first_name} {trainer.last_name}
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-xs leading-snug line-clamp-2">
                              {trainer.present_position || "Trainer"}
                            </CardDescription>
                          </div>
                          <div className="text-xs text-muted-foreground leading-snug line-clamp-2">
                            {trainer.office || "No office assigned"}
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className="absolute inset-0 h-full overflow-hidden cursor-pointer [transform:rotateY(180deg)] [backface-visibility:hidden]"
                        onClick={() => toggleCard(key)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{trainer.first_name} {trainer.last_name}</CardTitle>
                          <CardDescription>Introduction</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Present Position</div>
                            <div className="font-medium leading-snug line-clamp-2">{trainer.present_position || "Trainer"}</div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Office/Affiliation</div>
                            <div className="font-medium leading-snug line-clamp-2">{trainer.office || "—"}</div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Region</div>
                            <div className="font-medium leading-snug line-clamp-2">{trainer.division_province || "—"}</div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Email</div>
                            <div className="font-medium leading-snug line-clamp-2 break-all">{trainer.email}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerList;
