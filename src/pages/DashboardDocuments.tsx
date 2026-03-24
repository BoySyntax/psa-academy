import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, Trash2 } from "lucide-react";

interface DashboardDocumentsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DashboardDocuments = ({ onNavigate }: DashboardDocumentsProps) => {
  const documents = [
    { id: 1, name: "Quarterly Report Q4 2025", type: "PDF", size: "2.4 MB", date: "Jan 15, 2026" },
    { id: 2, name: "Project Proposal 2026", type: "PDF", size: "1.8 MB", date: "Jan 10, 2026" },
    { id: 3, name: "Budget Spreadsheet", type: "XLSX", size: "542 KB", date: "Jan 8, 2026" },
    { id: 4, name: "Meeting Notes", type: "DOCX", size: "125 KB", date: "Jan 5, 2026" },
    { id: 5, name: "Contract Agreement", type: "PDF", size: "3.2 MB", date: "Dec 28, 2025" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Documents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your files and downloads</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Documents</h2>
          <p className="text-muted-foreground">Manage and download your files</p>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/75 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left - Document Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{doc.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right - Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Storage Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-lg border border-border bg-secondary/30"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Storage Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Used: 8.1 GB / 50 GB</span>
              <span className="text-muted-foreground">16.2%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "16.2%" }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/30 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          © 2026 PSA Academy. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardDocuments;
