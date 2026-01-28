import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  FolderOpen,
  MoreHorizontal,
  FileText,
  ChevronRight,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ImportWizardDialog } from "@/components/test-cases/import-wizard/ImportWizardDialog";

const folders = [
  { name: "All Tests", count: 20 },
  { name: "User Management", count: 10 },
  { name: "Shopping Cart", count: 5 },
  { name: "Checkout Process", count: 1 },
  { name: "Product Catalog", count: 4 },
];

const initialTestCases = [
  {
    id: "TR-1",
    name: "User Login Authentication",
    priority: "high",
    status: "active",
    type: "functional",
    createdBy: "User 1",
    updatedAt: "32 minutes ago",
  },
  {
    id: "TR-2",
    name: "Add Product to Cart",
    priority: "high",
    status: "under_review",
    type: "functional",
    createdBy: "User 1",
    updatedAt: "32 minutes ago",
  },
  {
    id: "TR-3",
    name: "Checkout Process",
    priority: "critical",
    status: "approved",
    type: "functional",
    createdBy: "User 1",
    updatedAt: "32 minutes ago",
  },
  {
    id: "TR-4",
    name: "Password Reset Function",
    priority: "medium",
    status: "draft",
    type: "functional",
    createdBy: "User 2",
    updatedAt: "1 hour ago",
  },
  {
    id: "TR-5",
    name: "API Response Time",
    priority: "medium",
    status: "approved",
    type: "performance",
    createdBy: "User 1",
    updatedAt: "2 hours ago",
  },
];

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-4 text-foreground",
  medium: "bg-chart-1 text-foreground",
  low: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  active: "border-chart-1 text-chart-1",
  under_review: "border-chart-4 text-chart-4",
  approved: "border-primary text-primary",
  draft: "border-muted text-muted-foreground",
  obsolete: "border-destructive text-destructive",
};

export default function TestRepository() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFolder, setSelectedFolder] = useState("All Tests");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [testCases, setTestCases] = useState(initialTestCases);
  const { toast } = useToast();

  const handleCreateTestCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTestCase = {
      id: `TR-${testCases.length + 1}`,
      name: formData.get("name") as string,
      priority: formData.get("priority") as string,
      status: "draft",
      type: formData.get("type") as string,
      createdBy: "Demo User",
      updatedAt: "Just now",
    };
    setTestCases([newTestCase, ...testCases]);
    setIsCreateOpen(false);
    toast({
      title: "Test case created",
      description: `"${newTestCase.name}" has been created successfully.`,
    });
  };

  const handleBulkImport = async (importedCases: Array<{
    title: string;
    description: string;
    priority: string;
    status: string;
    preconditions: string;
    expected_result: string;
    tags: string[];
  }>) => {
    const newTestCases = importedCases.map((tc, index) => ({
      id: `TR-${testCases.length + index + 1}`,
      name: tc.title,
      priority: tc.priority,
      status: tc.status,
      type: "functional",
      createdBy: "Demo User",
      updatedAt: "Just now",
    }));

    setTestCases([...newTestCases, ...testCases]);
  };

  const filteredTestCases = testCases.filter((tc) =>
    tc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Workspaces</span>
          <ChevronRight className="h-4 w-4" />
          <span>Projects</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Test Cases</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Repository</h1>
            <p className="text-muted-foreground">
              Manage and organize your test cases
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/ai-generation">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateTestCase}>
                  <DialogHeader>
                    <DialogTitle>Create New Test Case</DialogTitle>
                    <DialogDescription>
                      Add a new test case to your repository
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Test Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter a descriptive name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the purpose of this test case"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue="functional">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="functional">Functional</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="integration">Integration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Test Steps</Label>
                      <div className="rounded-md border border-border p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-sm font-medium text-muted-foreground">
                            <span>#</span>
                            <span>Action</span>
                            <span>Expected Result</span>
                            <span></span>
                          </div>
                          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                            <span className="text-sm text-muted-foreground">1</span>
                            <Input placeholder="Describe the action" />
                            <Input placeholder="What should happen?" />
                            <Button type="button" variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-3"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Step
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Test Case</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bulk Import Wizard */}
        <ImportWizardDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          onImport={handleBulkImport}
        />

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar - Folders */}
          <Card className="h-fit border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Test Suites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    selectedFolder === folder.name && "bg-accent text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <div className="flex items-center rounded-md border border-border">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Cases Table */}
            <Card className="border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestCases.map((testCase) => (
                    <TableRow key={testCase.id} className="cursor-pointer">
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {testCase.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{testCase.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "capitalize",
                            priorityColors[testCase.priority]
                          )}
                        >
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            statusColors[testCase.status]
                          )}
                        >
                          {testCase.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {testCase.createdBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {testCase.updatedAt}
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
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing 1 to {filteredTestCases.length} of {filteredTestCases.length} results
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
