import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Bug,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const initialDefects = [
  {
    id: "DEF-001",
    title: "Login fails with special characters in password",
    severity: "critical",
    priority: "p1",
    status: "open",
    assignee: "John Doe",
    reportedBy: "Jane Smith",
    reportedAt: "2025-01-15",
  },
  {
    id: "DEF-002",
    title: "Cart total calculation incorrect with discounts",
    severity: "major",
    priority: "p2",
    status: "in_progress",
    assignee: "Alice Brown",
    reportedBy: "Bob Wilson",
    reportedAt: "2025-01-14",
  },
  {
    id: "DEF-003",
    title: "UI alignment issue on mobile devices",
    severity: "minor",
    priority: "p3",
    status: "resolved",
    assignee: "Charlie Davis",
    reportedBy: "Jane Smith",
    reportedAt: "2025-01-12",
  },
  {
    id: "DEF-004",
    title: "Session timeout not working correctly",
    severity: "major",
    priority: "p2",
    status: "open",
    assignee: "John Doe",
    reportedBy: "Alice Brown",
    reportedAt: "2025-01-16",
  },
];

const severityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  major: "bg-chart-4 text-foreground",
  minor: "bg-chart-1 text-foreground",
  trivial: "bg-muted text-muted-foreground",
};

const priorityLabels: Record<string, string> = {
  p1: "P1 - Urgent",
  p2: "P2 - High",
  p3: "P3 - Medium",
  p4: "P4 - Low",
};

const statusColors: Record<string, string> = {
  new: "border-chart-3 text-chart-3",
  open: "border-destructive text-destructive",
  in_progress: "border-chart-4 text-chart-4",
  resolved: "border-chart-1 text-chart-1",
  closed: "border-muted text-muted-foreground",
};

export default function Defects() {
  const [defects, setDefects] = useState(initialDefects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const filteredDefects = defects.filter((defect) => {
    const matchesSearch = defect.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || defect.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDefect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDefect = {
      id: `DEF-${String(defects.length + 1).padStart(3, "0")}`,
      title: formData.get("title") as string,
      severity: formData.get("severity") as string,
      priority: formData.get("priority") as string,
      status: "new",
      assignee: formData.get("assignee") as string,
      reportedBy: "Demo User",
      reportedAt: new Date().toISOString().split("T")[0],
    };
    setDefects([newDefect, ...defects]);
    setIsCreateOpen(false);
    toast({
      title: "Defect created",
      description: `${newDefect.id} has been created successfully.`,
    });
  };

  const stats = {
    total: defects.length,
    open: defects.filter((d) => d.status === "open" || d.status === "new").length,
    inProgress: defects.filter((d) => d.status === "in_progress").length,
    resolved: defects.filter((d) => d.status === "resolved" || d.status === "closed").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Workspaces</span>
          <ChevronRight className="h-4 w-4" />
          <span>Projects</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Defects</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive">
                <Bug className="h-6 w-6 text-destructive-foreground" />
              </div>
              Defects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and track software defects
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Defect
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateDefect}>
                <DialogHeader>
                  <DialogTitle>Report New Defect</DialogTitle>
                  <DialogDescription>
                    Create a new defect report
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Brief description of the defect"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Detailed description of the defect"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="steps">Steps to Reproduce</Label>
                    <Textarea
                      id="steps"
                      name="steps"
                      placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select name="severity" defaultValue="major">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="trivial">Trivial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority" defaultValue="p2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="p1">P1 - Urgent</SelectItem>
                          <SelectItem value="p2">P2 - High</SelectItem>
                          <SelectItem value="p3">P3 - Medium</SelectItem>
                          <SelectItem value="p4">P4 - Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select name="assignee" defaultValue="John Doe">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Alice Brown">Alice Brown</SelectItem>
                        <SelectItem value="Charlie Davis">Charlie Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Defect</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Defects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.open}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-chart-4" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-chart-1" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Fixed</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search defects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Defects Table */}
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDefects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No defects found matching your filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDefects.map((defect) => (
                  <TableRow key={defect.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {defect.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{defect.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", severityColors[defect.severity])}>
                        {defect.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {priorityLabels[defect.priority]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusColors[defect.status])}
                      >
                        {defect.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{defect.assignee}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {defect.reportedAt}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
