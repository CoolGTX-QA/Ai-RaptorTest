import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar, ArrowLeft, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ReportHeaderProps {
  title: string;
  description: string;
  onProjectChange?: (value: string) => void;
  onTimeRangeChange?: (value: string) => void;
  selectedProject?: string;
  selectedTimeRange?: string;
}

export function ReportHeader({
  title,
  description,
  onProjectChange,
  onTimeRangeChange,
  selectedProject = "all-projects",
  selectedTimeRange = "last-30",
}: ReportHeaderProps) {
  const handleExport = () => {
    toast.success("Report exported successfully", {
      description: "Your report has been downloaded as PDF.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/reports"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedProject} onValueChange={onProjectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-projects">All Projects</SelectItem>
              <SelectItem value="project-1">E-commerce Platform</SelectItem>
              <SelectItem value="project-2">Mobile App</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7">Last 7 days</SelectItem>
              <SelectItem value="last-30">Last 30 days</SelectItem>
              <SelectItem value="last-90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
