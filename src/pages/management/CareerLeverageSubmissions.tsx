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
      title="Career Leverage Inventory Submissions"
      description="View submitted CLI totals and question responses"
      roleLabel="Management"
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      fetchSubmissions={careerLeverageInventoryService.fetchManagement}
    />
  );
};

export default CareerLeverageSubmissions;
