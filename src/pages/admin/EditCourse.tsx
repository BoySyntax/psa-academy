import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { courseService, CreateCourseData, CourseStatus } from "@/services/courses";

interface EditCourseProps {
  onNavigate: (page: string) => void;
  courseId: string;
}

const EditCourse = ({ onNavigate, courseId }: EditCourseProps) => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [coreCompetency, setCoreCompetency] = useState<string>("");
  const [leadershipCompetency, setLeadershipCompetency] = useState<string>("");
  const [technicalCompetency, setTechnicalCompetency] = useState<string>("");
  const [formData, setFormData] = useState<CreateCourseData>({
    course_code: "",
    course_name: "",
    description: "",
    category: "",
    subcategory: "",
    duration_hours: undefined,
    max_students: undefined,
    status: "draft",
    thumbnail_url: "",
  });

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      const result = await courseService.getCourseById(courseId);
      if (result.success && result.course) {
        const c = result.course as any;
        const subcatRaw = String(c.subcategory || "");
        const parsed = subcatRaw.match(/^Core:\s*(.*?)\s*\|\s*Leadership:\s*(.*?)\s*\|\s*Technical:\s*(.*)$/);
        if (parsed) {
          setCoreCompetency((parsed[1] || "").trim());
          setLeadershipCompetency((parsed[2] || "").trim());
          setTechnicalCompetency((parsed[3] || "").trim());
        } else {
          setCoreCompetency("");
          setLeadershipCompetency("");
          setTechnicalCompetency(subcatRaw);
        }
        setFormData({
          course_code: c.course_code || "",
          course_name: c.course_name || "",
          description: c.description || "",
          category: c.category || "",
          subcategory: subcatRaw,
          duration_hours: c.duration_hours ? Number(c.duration_hours) : undefined,
          max_students: c.max_students ? Number(c.max_students) : undefined,
          status: (c.status || "draft") as CourseStatus,
          thumbnail_url: c.thumbnail_url || "",
        });
        setImagePreview(c.thumbnail_url || "");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load course",
          variant: "destructive",
        });
        onNavigate("course-management");
      }
      setInitialLoading(false);
    };

    load();
  }, [courseId, onNavigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "duration_hours" | "max_students"
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value ? parseInt(value) : undefined,
    }));
  };

  const handleStatusChange = (value: CourseStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const updateCombinedSubcategory = (
    nextCore: string,
    nextLeadership: string,
    nextTechnical: string
  ) => {
    const combined = `Core: ${nextCore || ""} | Leadership: ${nextLeadership || ""} | Technical: ${nextTechnical || ""}`;
    setFormData((prev) => ({
      ...prev,
      subcategory: combined,
    }));
  };

  const handleCoreCompetencyChange = (value: string) => {
    setCoreCompetency(value);
    updateCombinedSubcategory(value, leadershipCompetency, technicalCompetency);
  };

  const handleLeadershipCompetencyChange = (value: string) => {
    setLeadershipCompetency(value);
    updateCombinedSubcategory(coreCompetency, value, technicalCompetency);
  };

  const handleTechnicalCompetencyChange = (value: string) => {
    setTechnicalCompetency(value);
    updateCombinedSubcategory(coreCompetency, leadershipCompetency, value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, GIF, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const uploadForm = new FormData();
    uploadForm.append("image", file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload-course-image.php`, {
        method: "POST",
        body: uploadForm,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          thumbnail_url: data.file_url,
        }));
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload image",
          variant: "destructive",
        });
        setImagePreview("");
      }
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      thumbnail_url: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.course_code || !formData.course_name) {
      toast({
        title: "Validation Error",
        description: "Course code and course name are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await courseService.updateCourse(courseId, formData);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message || "Course updated successfully",
      });
      onNavigate("course-management");
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update course",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (initialLoading) {
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
      <div className="bg-sidebar-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("course-management")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_code">
                    Course Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="course_code"
                    name="course_code"
                    value={formData.course_code}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_name">
                    Course Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="course_name"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="e.g., Computer Science" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Statistical">Statistical</SelectItem>
                      <SelectItem value="Civil Registration">Civil Registration</SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Administrative & Support">Administrative & Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="core_competency">Core Competencies</Label>
                  <Select value={coreCompetency} onValueChange={handleCoreCompetencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select core competency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="Exemplifying Integrity">Exemplifying Integrity</SelectItem>
                      <SelectItem value="Results Orientation">Results Orientation</SelectItem>
                      <SelectItem value="Quality Service Orientation">Quality Service Orientation</SelectItem>
                      <SelectItem value="Teamwork and Developing Partnerships">Teamwork and Developing Partnerships</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadership_competency">Leadership Competencies</Label>
                  <Select value={leadershipCompetency} onValueChange={handleLeadershipCompetencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leadership competency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="Policy lnterpretation and lmplementation">Policy lnterpretation and lmplementation</SelectItem>
                      <SelectItem value="Planning Organizing and Delivery">Planning Organizing and Delivery</SelectItem>
                      <SelectItem value="Strategic and Creative Thinking">Strategic and Creative Thinking</SelectItem>
                      <SelectItem value="Application of Technical Knowledge">Application of Technical Knowledge</SelectItem>
                      <SelectItem value="Programming and Systems Analysis">Programming and Systems Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="technical_competency">Technical Competencies</Label>
                  <Select value={technicalCompetency} onValueChange={handleTechnicalCompetencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technical competency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="Transaction Processing">Transaction Processing</SelectItem>
                      <SelectItem value="Accounts Reconciliation">Accounts Reconciliation</SelectItem>
                      <SelectItem value="Maintaining Effective Audit Services">Maintaining Effective Audit Services</SelectItem>
                      <SelectItem value="Preparation and Interpretation of Financial Statements">Preparation and Interpretation of Financial Statements</SelectItem>
                      <SelectItem value="Generating Reports and Documentation">Generating Reports and Documentation</SelectItem>
                      <SelectItem value="Application of Technical Knowledge and Skills">Application of Technical Knowledge and Skills</SelectItem>
                      <SelectItem value="Presentation Skills">Presentation Skills</SelectItem>
                      <SelectItem value="Communication Skills">Communication Skills</SelectItem>
                      <SelectItem value="Facilitation Skills">Facilitation Skills</SelectItem>
                      <SelectItem value="Data Management">Data Management</SelectItem>
                      <SelectItem value="Computer Skills">Computer Skills</SelectItem>
                      <SelectItem value="Programming and System Analysis">Programming and System Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    name="duration_hours"
                    type="number"
                    min="0"
                    value={formData.duration_hours || ""}
                    onChange={(e) => handleNumberChange(e, "duration_hours")}
                    placeholder="e.g., 40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_students">Max Students</Label>
                  <Input
                    id="max_students"
                    name="max_students"
                    type="number"
                    min="0"
                    value={formData.max_students || ""}
                    onChange={(e) => handleNumberChange(e, "max_students")}
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter course description..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="thumbnail_image">Course Thumbnail Image</Label>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Course thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        id="thumbnail_image"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="thumbnail_image" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          {uploadingImage ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">JPG, PNG, GIF or WEBP (max 5MB)</div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-[160px]">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditCourse;
