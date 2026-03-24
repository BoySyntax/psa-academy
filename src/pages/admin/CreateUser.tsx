import { useState } from "react";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { adminService, CreateUserData } from "@/services/admin";
import { USER_TYPE_OPTIONS, UserType } from "@/constants/userTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEX_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const BLOOD_TYPE_OPTIONS = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

const CIVIL_STATUS_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
];

const DISABILITY_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Physical", value: "physical" },
  { label: "Visual", value: "visual" },
  { label: "Hearing", value: "hearing" },
  { label: "Mental", value: "mental" },
];

const RELIGION_OPTIONS = [
  { label: "Catholic", value: "catholic" },
  { label: "Protestant", value: "protestant" },
  { label: "Islam", value: "islam" },
  { label: "Buddhism", value: "buddhism" },
  { label: "Other", value: "other" },
];

const TYPE_OF_EMPLOYMENT_OPTIONS = [
  { label: "Government", value: "government" },
  { label: "Private", value: "private" },
  { label: "Self-employed", value: "self-employed" },
  { label: "Unemployed", value: "unemployed" },
];

const CIVIL_SERVICE_ELIGIBILITY_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Sub-professional", value: "sub-professional" },
  { label: "Professional", value: "professional" },
];

const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  { label: "Elementary", value: "elementary" },
  { label: "High School", value: "high-school" },
  { label: "College", value: "college" },
  { label: "Master's Degree", value: "masters" },
  { label: "PhD", value: "phd" },
];

interface CreateUserProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CreateUser = ({ onNavigate }: CreateUserProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    user_type: "student",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    date_of_birth: "",
    sex: "",
    blood_type: "",
    civil_status: "",
    type_of_disability: "",
    religion: "",
    educational_attainment: "",
    house_no_and_street: "",
    barangay: "",
    municipality: "",
    province: "",
    region: "",
    cellphone_number: "",
    type_of_employment: "",
    civil_service_eligibility_level: "",
    salary_grade: "",
    present_position: "",
    office: "",
    service: "",
    division_province: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_address: "",
    emergency_contact_number: "",
    emergency_contact_email: "",
  });

  const normalizeDateOfBirth = (value: string) => {
    const v = (value || "").trim();
    if (!v) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return v;
    }

    const mmddyyyy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const mm = mmddyyyy[1].padStart(2, "0");
      const dd = mmddyyyy[2].padStart(2, "0");
      const yyyy = mmddyyyy[3];
      return `${yyyy}-${mm}-${dd}`;
    }

    return v;
  };

  const update = (key: keyof CreateUserData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    const required: (keyof CreateUserData)[] = [
      "username",
      "email",
      "password",
      "user_type",
      "first_name",
      "last_name",
      "date_of_birth",
      "sex",
      "civil_status",
      "educational_attainment",
      "house_no_and_street",
      "barangay",
      "municipality",
      "province",
      "region",
      "cellphone_number",
    ];

    for (const field of required) {
      const v = form[field];
      if (!v || `${v}`.trim() === "") {
        toast({
          title: "Missing field",
          description: `Please fill: ${field}`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);
    const payload: CreateUserData = {
      ...form,
      date_of_birth: normalizeDateOfBirth(form.date_of_birth),
    };
    const result = await adminService.createUser(payload);
    setLoading(false);

    if (result.success) {
      toast({
        title: "User created",
        description: "User was created successfully.",
      });
      onNavigate("users");
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Create User
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Add a new user and assign a role
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("users")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <Accordion type="multiple" className="w-full space-y-2">
            {/* Personal Information */}
            <AccordionItem value="personal-info">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Personal Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Middle Name</label>
                    <Input
                      className="mt-1"
                      value={form.middle_name || ""}
                      onChange={(e) => update("middle_name", e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Suffix</label>
                    <Input
                      className="mt-1"
                      value={form.suffix || ""}
                      onChange={(e) => update("suffix", e.target.value)}
                      placeholder="Jr., Sr., III, etc."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) => update("date_of_birth", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sex <span className="text-red-500">*</span></label>
                    <Select value={form.sex} onValueChange={(v) => update("sex", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEX_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Blood Type</label>
                    <Select
                      value={form.blood_type || ""}
                      onValueChange={(v) => update("blood_type", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Civil Status <span className="text-red-500">*</span></label>
                    <Select
                      value={form.civil_status}
                      onValueChange={(v) => update("civil_status", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select civil status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CIVIL_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Type of Disability</label>
                    <Select
                      value={form.type_of_disability || ""}
                      onValueChange={(v) => update("type_of_disability", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type of disability" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Religion</label>
                    <Select
                      value={form.religion || ""}
                      onValueChange={(v) => update("religion", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELIGION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Educational Attainment <span className="text-red-500">*</span></label>
                    <Select
                      value={form.educational_attainment}
                      onValueChange={(v) => update("educational_attainment", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select educational attainment" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATIONAL_ATTAINMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Address */}
            <AccordionItem value="address">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Address
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">House No. and Street <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.house_no_and_street}
                      onChange={(e) => update("house_no_and_street", e.target.value)}
                      placeholder="Enter house number and street"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Barangay <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.barangay}
                      onChange={(e) => update("barangay", e.target.value)}
                      placeholder="Enter barangay"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Municipality <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.municipality}
                      onChange={(e) => update("municipality", e.target.value)}
                      placeholder="Enter municipality"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Province <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.province}
                      onChange={(e) => update("province", e.target.value)}
                      placeholder="Enter province"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Region <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.region}
                      onChange={(e) => update("region", e.target.value)}
                      placeholder="Enter region"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contact Information */}
            <AccordionItem value="contact-info">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Contact Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">Cellphone Number <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      type="tel"
                      value={form.cellphone_number}
                      onChange={(e) => update("cellphone_number", e.target.value)}
                      placeholder="0917 123 4567"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Employment Details */}
            <AccordionItem value="employment">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Employment Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">Type of Employment</label>
                    <Select
                      value={form.type_of_employment || ""}
                      onValueChange={(v) => update("type_of_employment", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type of employment" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OF_EMPLOYMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Civil Service Eligibility Level</label>
                    <Select
                      value={form.civil_service_eligibility_level || ""}
                      onValueChange={(v) => update("civil_service_eligibility_level", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select civil service eligibility level" />
                      </SelectTrigger>
                      <SelectContent>
                        {CIVIL_SERVICE_ELIGIBILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Salary Grade</label>
                    <Input
                      className="mt-1"
                      value={form.salary_grade || ""}
                      onChange={(e) => update("salary_grade", e.target.value)}
                      placeholder="SG-1, SG-2, etc."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Present Position</label>
                    <Input
                      className="mt-1"
                      value={form.present_position || ""}
                      onChange={(e) => update("present_position", e.target.value)}
                      placeholder="Enter present position"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Office</label>
                    <Input
                      className="mt-1"
                      value={form.office || ""}
                      onChange={(e) => update("office", e.target.value)}
                      placeholder="Enter office"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Service</label>
                    <Input
                      className="mt-1"
                      value={form.service || ""}
                      onChange={(e) => update("service", e.target.value)}
                      placeholder="Enter service"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Division/Province</label>
                    <Input
                      className="mt-1"
                      value={form.division_province || ""}
                      onChange={(e) => update("division_province", e.target.value)}
                      placeholder="Enter division/province"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Emergency Contact */}
            <AccordionItem value="emergency-contact">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Emergency Contact
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">Name of Contact Person</label>
                    <Input
                      className="mt-1"
                      value={form.emergency_contact_name || ""}
                      onChange={(e) => update("emergency_contact_name", e.target.value)}
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Relationship</label>
                    <Input
                      className="mt-1"
                      value={form.emergency_contact_relationship || ""}
                      onChange={(e) => update("emergency_contact_relationship", e.target.value)}
                      placeholder="Enter relationship"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Contact Address</label>
                    <Input
                      className="mt-1"
                      value={form.emergency_contact_address || ""}
                      onChange={(e) => update("emergency_contact_address", e.target.value)}
                      placeholder="Enter contact address"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Contact Number</label>
                    <Input
                      className="mt-1"
                      type="tel"
                      value={form.emergency_contact_number || ""}
                      onChange={(e) => update("emergency_contact_number", e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input
                      className="mt-1"
                      type="email"
                      value={form.emergency_contact_email || ""}
                      onChange={(e) => update("emergency_contact_email", e.target.value)}
                      placeholder="Enter contact email"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Account Details */}
            <AccordionItem value="account-details">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Account Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium">Username <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                    <Input
                      className="mt-1"
                      type="password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Create password"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">User Type / Role <span className="text-red-500">*</span></label>
                    <Select
                      value={form.user_type}
                      onValueChange={(v) => update("user_type", v as UserType)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCreate} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
