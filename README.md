# QA Test Management Platform (RaptorTest)

A comprehensive, enterprise-grade Quality Assurance and Test Management platform built with modern web technologies. Streamline your testing workflows, track defects, manage test cases, and generate insightful reports—all in one place.

![Built with React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

---

## 📸 Features & Screenshots

### 🔐 Authentication
Secure login and registration with a modern split-screen design.

<!-- Replace with your screenshot URL -->
<img width="1908" height="867" alt="image" src="https://github.com/user-attachments/assets/27d056ee-6515-4992-9ffa-f8cc438ecba8" />


---

### 📊 Dashboard
Get a comprehensive overview of your testing activities, projects, and key metrics.

- **Overview Analytics**: Bird's-eye view of testing activities
- **Project Summary**: Quick access to all projects
- **Activity Feed**: Track recent test executions and defect updates
- **Key Metrics**: Monitor pass rates, defect counts, and progress

<!-- Replace with your screenshot URL -->
<img width="1024" height="962" alt="image" src="https://github.com/user-attachments/assets/e2dbb5d9-e7a1-4f4f-a917-5640d4d3e291" />


---

### 🏢 Workspaces
Organize your projects with multi-tenant workspace management.

- **Multi-Workspace Support**: Organize by team, department, or client
- **Workspace Settings**: Configure workspace-specific settings
- **Member Management**: Invite and manage team members

<!-- Replace with your screenshot URL -->
<img width="1897" height="862" alt="image" src="https://github.com/user-attachments/assets/65814f0d-c61e-4bbf-90b6-3295ddcb962f" />


---

### 🗂️ Test Repository
Centralized test case management with tags, priorities, and versioning.

- **Test Case Management**: Create, organize, and maintain test cases
- **Tags & Categorization**: Organize with custom tags and priorities
- **Preconditions & Expected Results**: Comprehensive documentation
- **Bulk Operations**: Import/export and bulk edit capabilities

<!-- Replace with your screenshot URL -->
<img width="1880" height="864" alt="image" src="https://github.com/user-attachments/assets/b4a1792e-c548-42ab-a976-39d6e253be16" />


---

### ▶️ Test Execution
Run tests, track progress, and record results in real-time.

- **Test Runs**: Create and manage test execution cycles
- **Real-time Status Tracking**: Monitor test progress live
- **Execution Notes**: Add detailed notes during testing
- **Pass/Fail/Block Status**: Comprehensive status tracking

<!-- Replace with your screenshot URL -->
<img width="1884" height="852" alt="image" src="https://github.com/user-attachments/assets/bc0f3660-6023-4594-b65c-c4de017c9664" />


---

### 🐛 Defect Management
Log, track, and manage bugs throughout their lifecycle.

- **Defect Tracking**: Log and manage bugs and issues
- **Severity Levels**: Critical, High, Medium, Low categorization
- **Status Workflow**: Open → In Progress → Resolved → Closed
- **Assignment**: Assign defects to team members
- **Linking**: Connect defects to test executions

<!-- Replace with your screenshot URL -->
<img width="1920" height="957" alt="image" src="https://github.com/user-attachments/assets/f3cd7282-bb50-40e2-b02e-6852fa6ecacf" />


---

### ⚠️ Risk Assessment
Identify, analyze, and mitigate project risks.

- **Risk Identification**: Document potential risks
- **Risk Analysis**: Evaluate probability and impact
- **Mitigation Planning**: Create and track strategies
- **Risk Dashboard**: Visualize risk landscape

<!-- Replace with your screenshot URL -->
<img width="1795" height="1920" alt="image" src="https://github.com/user-attachments/assets/9b3c971c-c1c9-4337-a9f6-d37e4d65b2d5" />


---

### 🤖 AI Test Generation
AI-powered test case generation and smart suggestions.

- **AI-Powered Test Cases**: Generate test cases using AI
- **Smart Suggestions**: Intelligent recommendations for coverage
- **Natural Language Processing**: Convert requirements to test cases

<!-- Replace with your screenshot URL -->
<img width="1920" height="1202" alt="image" src="https://github.com/user-attachments/assets/63edf22f-fcac-4556-9635-b3e88824e9d8" />


---

### 📈 Reports & Analytics
Generate comprehensive reports with visual charts and insights.

| Report | Description |
|--------|-------------|
| **Test Execution Report** | Detailed statistics, pass/fail trends, execution time analysis |
| **Defect Leakage Report** | Track defects escaped to production, analyze patterns |
| **RCA Report** | Root cause analysis, categorization, trend analysis |
| **Traceability Matrix** | Map requirements to test cases, coverage analysis |
| **Test Analytics** | Comprehensive metrics, trend charts, team insights |
| **Advanced Reports** | Custom report builder, data export, scheduled reports |

<!-- Replace with your screenshot URL -->
<img width="1892" height="861" alt="image" src="https://github.com/user-attachments/assets/5918c1f6-a5b0-4a52-a98f-9e2c358aa25e" />


---

### 👥 Role-Based Access Control (RBAC)
Four distinct roles with granular permissions:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access - manage workspace, members, settings, all features |
| **Manager** | Create/manage projects, test runs, assign work, view reports |
| **Tester** | Execute tests, log defects, view assigned work |
| **Viewer** | Read-only access to projects and reports |

<!-- Replace with your screenshot URL -->
<img width="1556" height="301" alt="image" src="https://github.com/user-attachments/assets/88068b71-f627-4c59-b765-e076cee4421d" />


---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State Management** | TanStack React Query |
| **Routing** | React Router v6 |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (AppLayout, AppSidebar)
│   ├── reports/         # Report-specific components
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── useAuth.tsx      # Authentication hook
│   ├── useRBAC.tsx      # Role-based access control hook
│   └── use-toast.ts     # Toast notifications
├── integrations/
│   └── supabase/        # Supabase client & types
├── pages/
│   ├── reports/         # Report pages
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Defects.tsx      # Defect management
│   ├── TestExecution.tsx
│   ├── TestRepository.tsx
│   ├── RiskAssessment.tsx
│   ├── AIGeneration.tsx
│   ├── Workspaces.tsx
│   └── WorkspaceMembers.tsx
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-name>

# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5173
```

---

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `workspaces` | Multi-tenant workspace management |
| `workspace_members` | User-workspace associations with roles |
| `workspace_invites` | Pending invitations |
| `projects` | Projects within workspaces |
| `profiles` | User profile information |
| `test_cases` | Test case definitions |
| `test_runs` | Test execution cycles |
| `test_executions` | Individual test execution records |
| `defects` | Bug/defect tracking |
| `reports` | Saved report configurations |

---

## 🔒 Security Features

- **Row-Level Security (RLS)**: All tables protected with RLS policies
- **Workspace Isolation**: Users can only access their workspace data
- **Role-Based Permissions**: Granular access control
- **Secure Authentication**: Supabase Auth with secure sessions

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🤝 Support

For support and questions, please contact your system administrator.

---

Built with ❤️ Kuljeet using [Lovable](https://lovable.dev)
