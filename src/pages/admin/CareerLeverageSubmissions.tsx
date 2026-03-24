import CareerLeverageSubmissionsView from "@/components/CareerLeverageSubmissionsView";
import { careerLeverageInventoryService } from "@/services/careerLeverageInventory";

interface CareerLeverageSubmissionsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CareerLeverageSubmissions = ({ user, onNavigate, onLogout }: CareerLeverageSubmissionsProps) => {
  return (
    <CareerLeverageSubmissionsView
      title="Career Leverage Inventory Results"
      description="Admin view of submitted CLI totals and question responses"
      roleLabel="Admin"
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      fetchSubmissions={careerLeverageInventoryService.fetchAdmin}
    />
  );
};

export default CareerLeverageSubmissions;
