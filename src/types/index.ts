export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'team_lead' | 'qa_tester' | 'dev';
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  leadTester: string;
  targetRelease: string;
  createdAt: Date;
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  preconditions: string;
  postconditions: string;
  steps: TestStep[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'functional' | 'performance' | 'security' | 'compatibility' | 'integration';
  status: 'draft' | 'in_review' | 'approved' | 'obsolete' | 'needs_update' | 'rejected';
  isAutomated: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  riskScore?: number;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  projectId: string;
  result: 'not_run' | 'pass' | 'fail' | 'blocked' | 'skipped' | 'in_progress' | 'retest';
  executedBy: string;
  executedAt: Date;
  comments?: string;
  attachments?: string[];
}

export interface Defect {
  id: string;
  testCaseId?: string;
  testExecutionId?: string;
  projectId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  actualResult: string;
  expectedResult: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  status: 'new' | 'open' | 'in_progress' | 'reopened' | 'resolved' | 'closed';
  assignee?: string;
  reportedBy: string;
  reportedAt: Date;
  environment: string;
}

export interface DashboardStats {
  totalWorkspaces: number;
  totalProjects: number;
  totalTestCases: number;
  executionRate: number;
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
}
