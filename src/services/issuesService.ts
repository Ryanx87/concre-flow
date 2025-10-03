export interface IssueInfo {
  id: string;
  type: 'Delivery' | 'Quality' | 'Safety' | 'Equipment' | 'Driver' | 'Site Access' | 'Weather' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Escalated';
  title: string;
  description: string;
  orderId?: string;
  deliveryId?: string;
  truckId?: string;
  driverId?: string;
  projectName: string;
  location: string;
  reportedBy: string;
  reportedByRole: 'Admin' | 'Site Agent' | 'Driver' | 'Quality Inspector' | 'Other';
  assignedTo?: string;
  assignedToRole?: 'Admin' | 'Site Agent' | 'Quality Team' | 'Dispatch' | 'Maintenance' | 'Other';
  estimatedResolution?: string;
  actualResolution?: string;
  resolutionNotes?: string;
  photos?: string[];
  attachments?: string[];
  tags?: string[];
  comments?: IssueComment[];
  relatedIssues?: string[];
  escalationLevel?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: string;
}

export interface IssueTemplate {
  id: string;
  type: IssueInfo['type'];
  title: string;
  description: string;
  severity: IssueInfo['severity'];
  tags: string[];
  commonResolution?: string;
  estimatedTime?: number; // minutes
}

export interface IssueStatistics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  escalatedIssues: number;
  averageResolutionTime: number; // hours
  issuesByType: Record<IssueInfo['type'], number>;
  issuesBySeverity: Record<IssueInfo['severity'], number>;
  monthlyTrend: {
    month: string;
    issues: number;
    resolved: number;
  }[];
  topIssueTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

class IssuesService {
  private static instance: IssuesService;
  private issues: IssueInfo[] = [];
  private comments: IssueComment[] = [];
  private templates: IssueTemplate[] = [];

  private constructor() {
    this.initializeMockData();
    this.initializeTemplates();
  }

  static getInstance(): IssuesService {
    if (!IssuesService.instance) {
      IssuesService.instance = new IssuesService();
    }
    return IssuesService.instance;
  }

  private initializeMockData(): void {
    this.issues = [
      {
        id: 'ISS-001',
        type: 'Delivery',
        severity: 'High',
        status: 'In Progress',
        title: 'Late Delivery - TRK-002',
        description: 'Truck TRK-002 is running 45 minutes late due to traffic congestion on N1 Highway. Customer has been notified.',
        orderId: 'ORD-001',
        deliveryId: 'DEL-001',
        truckId: 'TRK-002',
        driverId: 'DRV-002',
        projectName: 'Housing Project A',
        location: '123 Main Street, Cape Town',
        reportedBy: 'Mike Johnson',
        reportedByRole: 'Driver',
        assignedTo: 'Dispatch Center',
        assignedToRole: 'Dispatch',
        estimatedResolution: '2025-10-03T11:30:00',
        tags: ['traffic', 'delay', 'customer-impact'],
        escalationLevel: 1,
        createdAt: '2025-10-03T09:15:00',
        updatedAt: '2025-10-03T09:45:00'
      },
      {
        id: 'ISS-002',
        type: 'Quality',
        severity: 'Critical',
        status: 'Open',
        title: 'Concrete Temperature Exceeding Limits',
        description: 'Concrete temperature measured at 35°C, exceeding the maximum allowable limit of 32°C. Immediate action required.',
        orderId: 'ORD-002',
        deliveryId: 'DEL-002',
        truckId: 'TRK-003',
        projectName: 'Commercial Complex',
        location: '456 Oak Avenue, Johannesburg',
        reportedBy: 'Quality Inspector',
        reportedByRole: 'Quality Inspector',
        assignedTo: 'Quality Team',
        assignedToRole: 'Quality Team',
        tags: ['temperature', 'compliance', 'urgent'],
        escalationLevel: 2,
        createdAt: '2025-10-03T10:30:00',
        updatedAt: '2025-10-03T10:30:00'
      },
      {
        id: 'ISS-003',
        type: 'Safety',
        severity: 'Medium',
        status: 'Resolved',
        title: 'Site Access Restriction',
        description: 'Site security denying truck access due to missing permit documentation. Issue resolved after providing proper documentation.',
        orderId: 'ORD-003',
        truckId: 'TRK-001',
        projectName: 'Bridge Construction',
        location: '789 Bridge Road, Durban',
        reportedBy: 'John Smith',
        reportedByRole: 'Driver',
        assignedTo: 'Site Manager',
        assignedToRole: 'Site Agent',
        actualResolution: '2025-10-02T14:30:00',
        resolutionNotes: 'Permit documentation provided. Site access granted. Driver briefed on proper documentation requirements.',
        tags: ['access', 'documentation', 'security'],
        createdAt: '2025-10-02T13:45:00',
        updatedAt: '2025-10-02T14:30:00',
        resolvedAt: '2025-10-02T14:30:00'
      },
      {
        id: 'ISS-004',
        type: 'Equipment',
        severity: 'Low',
        status: 'Closed',
        title: 'Minor Hydraulic Leak - TRK-004',
        description: 'Small hydraulic fluid leak detected during pre-delivery inspection. Truck taken out of service for maintenance.',
        truckId: 'TRK-004',
        projectName: 'General Maintenance',
        location: 'Concre-tek Plant',
        reportedBy: 'Maintenance Team',
        reportedByRole: 'Other',
        assignedTo: 'Maintenance Team',
        assignedToRole: 'Maintenance',
        actualResolution: '2025-10-01T16:00:00',
        resolutionNotes: 'Hydraulic line replaced. System tested and operational. Truck back in service.',
        tags: ['maintenance', 'hydraulic', 'preventive'],
        createdAt: '2025-10-01T08:00:00',
        updatedAt: '2025-10-01T16:00:00',
        resolvedAt: '2025-10-01T16:00:00'
      }
    ];

    this.comments = [
      {
        id: 'COM-001',
        issueId: 'ISS-001',
        content: 'Currently stuck in traffic at N1/M5 interchange. Will update ETA in 15 minutes.',
        authorId: 'mike.johnson',
        authorName: 'Mike Johnson',
        authorRole: 'Driver',
        isInternal: false,
        createdAt: '2025-10-03T09:20:00'
      },
      {
        id: 'COM-002',
        issueId: 'ISS-001',
        content: 'Customer notified of delay. They can accommodate delivery until 12:00 PM.',
        authorId: 'dispatch.center',
        authorName: 'Dispatch Center',
        authorRole: 'Dispatch',
        isInternal: true,
        createdAt: '2025-10-03T09:45:00'
      },
      {
        id: 'COM-003',
        issueId: 'ISS-002',
        content: 'Immediate cooling measures initiated. Adding ice to mix. Temperature now at 33°C.',
        authorId: 'quality.inspector',
        authorName: 'Quality Inspector',
        authorRole: 'Quality Inspector',
        isInternal: false,
        createdAt: '2025-10-03T10:45:00'
      }
    ];
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'TPL-001',
        type: 'Delivery',
        title: 'Late Delivery',
        description: 'Delivery is running behind schedule. Please provide reason and updated ETA.',
        severity: 'Medium',
        tags: ['delay', 'delivery'],
        commonResolution: 'Contact customer to inform of delay and provide updated ETA',
        estimatedTime: 30
      },
      {
        id: 'TPL-002',
        type: 'Quality',
        title: 'Wrong Mix Delivered',
        description: 'Concrete grade or specifications do not match order requirements.',
        severity: 'High',
        tags: ['quality', 'specifications'],
        commonResolution: 'Stop pour, contact plant for correct mix, arrange replacement delivery',
        estimatedTime: 120
      },
      {
        id: 'TPL-003',
        type: 'Quality',
        title: 'Slump Test Failure',
        description: 'Concrete slump test results outside acceptable range.',
        severity: 'High',
        tags: ['slump', 'testing', 'quality'],
        commonResolution: 'Reject load, contact plant for investigation, arrange replacement',
        estimatedTime: 90
      },
      {
        id: 'TPL-004',
        type: 'Safety',
        title: 'Site Access Issue',
        description: 'Unable to access delivery site due to restrictions or obstacles.',
        severity: 'Medium',
        tags: ['access', 'safety', 'site'],
        commonResolution: 'Contact site manager, verify access permissions, coordinate alternative route',
        estimatedTime: 45
      },
      {
        id: 'TPL-005',
        type: 'Equipment',
        title: 'Truck Breakdown',
        description: 'Mechanical failure preventing delivery completion.',
        severity: 'Critical',
        tags: ['breakdown', 'mechanical', 'urgent'],
        commonResolution: 'Emergency maintenance, arrange backup truck, notify all affected deliveries',
        estimatedTime: 180
      },
      {
        id: 'TPL-006',
        type: 'Weather',
        title: 'Weather Unsuitable for Pour',
        description: 'Weather conditions not suitable for concrete pouring (rain, extreme temperature, etc.)',
        severity: 'High',
        tags: ['weather', 'conditions', 'postpone'],
        commonResolution: 'Postpone pour, reschedule delivery, monitor weather conditions',
        estimatedTime: 60
      }
    ];
  }

  // Get all issues
  async getIssues(): Promise<IssueInfo[]> {
    return [...this.issues];
  }

  // Get issue by ID
  async getIssueById(id: string): Promise<IssueInfo | null> {
    return this.issues.find(issue => issue.id === id) || null;
  }

  // Get issues by status
  async getIssuesByStatus(status: IssueInfo['status']): Promise<IssueInfo[]> {
    return this.issues.filter(issue => issue.status === status);
  }

  // Get issues by type
  async getIssuesByType(type: IssueInfo['type']): Promise<IssueInfo[]> {
    return this.issues.filter(issue => issue.type === type);
  }

  // Get issues by severity
  async getIssuesBySeverity(severity: IssueInfo['severity']): Promise<IssueInfo[]> {
    return this.issues.filter(issue => issue.severity === severity);
  }

  // Create new issue
  async createIssue(issueData: Omit<IssueInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<IssueInfo> {
    const newIssue: IssueInfo = {
      ...issueData,
      id: `ISS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.issues.push(newIssue);
    return newIssue;
  }

  // Update issue
  async updateIssue(id: string, updates: Partial<IssueInfo>): Promise<boolean> {
    const issueIndex = this.issues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) return false;

    this.issues[issueIndex] = {
      ...this.issues[issueIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If status changed to resolved, set resolvedAt
    if (updates.status === 'Resolved' || updates.status === 'Closed') {
      this.issues[issueIndex].resolvedAt = new Date().toISOString();
    }

    return true;
  }

  // Escalate issue
  async escalateIssue(id: string, escalationNotes?: string): Promise<boolean> {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) return false;

    issue.escalationLevel = (issue.escalationLevel || 0) + 1;
    issue.status = 'Escalated';
    issue.updatedAt = new Date().toISOString();

    // Add escalation comment
    if (escalationNotes) {
      await this.addComment(id, {
        content: `Issue escalated to level ${issue.escalationLevel}. ${escalationNotes}`,
        authorId: 'system',
        authorName: 'System',
        authorRole: 'System',
        isInternal: true
      });
    }

    return true;
  }

  // Add comment to issue
  async addComment(issueId: string, commentData: Omit<IssueComment, 'id' | 'issueId' | 'createdAt'>): Promise<IssueComment> {
    const newComment: IssueComment = {
      ...commentData,
      id: `COM-${Date.now()}`,
      issueId,
      createdAt: new Date().toISOString()
    };

    this.comments.push(newComment);

    // Update issue's updatedAt timestamp
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.updatedAt = new Date().toISOString();
    }

    return newComment;
  }

  // Get comments for issue
  async getIssueComments(issueId: string): Promise<IssueComment[]> {
    return this.comments.filter(comment => comment.issueId === issueId);
  }

  // Search issues
  async searchIssues(query: string): Promise<IssueInfo[]> {
    const searchTerm = query.toLowerCase();
    return this.issues.filter(issue =>
      issue.id.toLowerCase().includes(searchTerm) ||
      issue.title.toLowerCase().includes(searchTerm) ||
      issue.description.toLowerCase().includes(searchTerm) ||
      issue.projectName.toLowerCase().includes(searchTerm) ||
      issue.location.toLowerCase().includes(searchTerm) ||
      issue.orderId?.toLowerCase().includes(searchTerm) ||
      issue.truckId?.toLowerCase().includes(searchTerm) ||
      issue.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get issue templates
  async getIssueTemplates(): Promise<IssueTemplate[]> {
    return [...this.templates];
  }

  // Get issue statistics
  async getIssueStatistics(): Promise<IssueStatistics> {
    const totalIssues = this.issues.length;
    const openIssues = this.issues.filter(i => i.status === 'Open').length;
    const inProgressIssues = this.issues.filter(i => i.status === 'In Progress').length;
    const resolvedIssues = this.issues.filter(i => i.status === 'Resolved').length;
    const closedIssues = this.issues.filter(i => i.status === 'Closed').length;
    const escalatedIssues = this.issues.filter(i => i.status === 'Escalated').length;

    // Calculate average resolution time
    const resolvedWithTime = this.issues.filter(i => i.resolvedAt && i.createdAt);
    const resolutionTimes = resolvedWithTime.map(i => {
      const created = new Date(i.createdAt);
      const resolved = new Date(i.resolvedAt!);
      return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
    });
    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    // Issues by type
    const issuesByType: Record<IssueInfo['type'], number> = {
      'Delivery': 0,
      'Quality': 0,
      'Safety': 0,
      'Equipment': 0,
      'Driver': 0,
      'Site Access': 0,
      'Weather': 0,
      'Other': 0
    };
    this.issues.forEach(issue => {
      issuesByType[issue.type]++;
    });

    // Issues by severity
    const issuesBySeverity: Record<IssueInfo['severity'], number> = {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Critical': 0
    };
    this.issues.forEach(issue => {
      issuesBySeverity[issue.severity]++;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM
      
      const monthIssues = this.issues.filter(issue => 
        issue.createdAt.startsWith(monthStr)
      ).length;
      
      const monthResolved = this.issues.filter(issue => 
        issue.resolvedAt && issue.resolvedAt.startsWith(monthStr)
      ).length;

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        issues: monthIssues,
        resolved: monthResolved
      });
    }

    // Top issue types
    const topIssueTypes = Object.entries(issuesByType)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalIssues > 0 ? (count / totalIssues) * 100 : 0
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      escalatedIssues,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      issuesByType,
      issuesBySeverity,
      monthlyTrend,
      topIssueTypes
    };
  }

  // Get issues for specific delivery
  async getIssuesForDelivery(deliveryId: string): Promise<IssueInfo[]> {
    return this.issues.filter(issue => issue.deliveryId === deliveryId);
  }

  // Get issues for specific order
  async getIssuesForOrder(orderId: string): Promise<IssueInfo[]> {
    return this.issues.filter(issue => issue.orderId === orderId);
  }

  // Assign issue to user
  async assignIssue(issueId: string, assignedTo: string, assignedToRole: string): Promise<boolean> {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.assignedTo = assignedTo;
    issue.assignedToRole = assignedToRole as any;
    issue.status = 'In Progress';
    issue.updatedAt = new Date().toISOString();

    // Add assignment comment
    await this.addComment(issueId, {
      content: `Issue assigned to ${assignedTo} (${assignedToRole})`,
      authorId: 'system',
      authorName: 'System',
      authorRole: 'System',
      isInternal: true
    });

    return true;
  }

  // Resolve issue
  async resolveIssue(issueId: string, resolutionData: {
    resolutionNotes: string;
    actualResolution?: string;
  }): Promise<boolean> {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.status = 'Resolved';
    issue.resolutionNotes = resolutionData.resolutionNotes;
    issue.actualResolution = resolutionData.actualResolution || new Date().toISOString();
    issue.resolvedAt = new Date().toISOString();
    issue.updatedAt = new Date().toISOString();

    // Add resolution comment
    await this.addComment(issueId, {
      content: `Issue resolved: ${resolutionData.resolutionNotes}`,
      authorId: 'system',
      authorName: 'System',
      authorRole: 'System',
      isInternal: false
    });

    return true;
  }

  // Close issue
  async closeIssue(issueId: string, closeNotes?: string): Promise<boolean> {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return false;

    issue.status = 'Closed';
    issue.updatedAt = new Date().toISOString();

    if (closeNotes) {
      await this.addComment(issueId, {
        content: `Issue closed: ${closeNotes}`,
        authorId: 'system',
        authorName: 'System',
        authorRole: 'System',
        isInternal: false
      });
    }

    return true;
  }
}

export const issuesService = IssuesService.getInstance();