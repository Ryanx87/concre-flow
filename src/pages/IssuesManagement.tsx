import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Activity,
  PlusCircle,
  ArrowUpCircle,
  Download,
  MessageSquare,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { issuesService, IssueInfo, IssueStatistics, IssueComment } from '@/services/issuesService';

const IssuesManagement = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [issues, setIssues] = useState<IssueInfo[]>([]);
  const [statistics, setStatistics] = useState<IssueStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<IssueInfo | null>(null);
  const [issueComments, setIssueComments] = useState<IssueComment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // New Issue Form State
  const [newIssue, setNewIssue] = useState({
    type: 'Delivery' as IssueInfo['type'],
    severity: 'Medium' as IssueInfo['severity'],
    title: '',
    description: '',
    projectName: '',
    location: '',
    orderId: '',
    reportedByRole: role === 'admin' ? 'Admin' as const : 'Site Agent' as const
  });

  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issuesData, statsData] = await Promise.all([
        issuesService.getIssues(),
        issuesService.getIssueStatistics()
      ]);
      setIssues(issuesData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIssueComments = async (issueId: string) => {
    try {
      const comments = await issuesService.getIssueComments(issueId);
      setIssueComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateIssue = async () => {
    try {
      await issuesService.createIssue({
        ...newIssue,
        reportedBy: role === 'admin' ? 'Admin User' : 'Site Agent User',
        status: 'Open' as const
      });
      await loadData();
      setShowCreateDialog(false);
      setNewIssue({
        type: 'Delivery',
        severity: 'Medium',
        title: '',
        description: '',
        projectName: '',
        location: '',
        orderId: '',
        reportedByRole: role === 'admin' ? 'Admin' : 'Site Agent'
      });
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleResolveIssue = async () => {
    if (!selectedIssue) return;
    try {
      await issuesService.resolveIssue(selectedIssue.id, {
        resolutionNotes,
        actualResolution: new Date().toISOString()
      });
      await loadData();
      setShowResolveDialog(false);
      setResolutionNotes('');
      setSelectedIssue(null);
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  const handleEscalateIssue = async (issueId: string) => {
    try {
      await issuesService.escalateIssue(issueId, 'Issue escalated by user request');
      await loadData();
    } catch (error) {
      console.error('Error escalating issue:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !newComment.trim()) return;
    try {
      await issuesService.addComment(selectedIssue.id, {
        content: newComment,
        authorId: 'current-user',
        authorName: role === 'admin' ? 'Admin User' : 'Site Agent User',
        authorRole: role === 'admin' ? 'Admin' : 'Site Agent',
        isInternal: false
      });
      await loadIssueComments(selectedIssue.id);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Issues Management</h1>
                <p className="text-muted-foreground">Track and resolve delivery and quality issues</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                      <p className="text-3xl font-bold text-red-600">{statistics.openIssues}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600">{statistics.inProgressIssues}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{statistics.resolvedIssues}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Escalated</p>
                      <p className="text-3xl font-bold text-purple-600">{statistics.escalatedIssues}</p>
                    </div>
                    <ArrowUpCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.averageResolutionTime}h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Issues Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Issues ({filteredIssues.length})
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-60">
                            {issue.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{issue.type}</Badge></TableCell>
                      <TableCell><Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge></TableCell>
                      <TableCell><Badge className={getStatusColor(issue.status)}>{issue.status}</Badge></TableCell>
                      <TableCell>{issue.projectName}</TableCell>
                      <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  loadIssueComments(issue.id);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Issue Details - {issue.id}</DialogTitle>
                              </DialogHeader>
                              <IssueDetailsView 
                                issue={issue} 
                                comments={issueComments}
                                newComment={newComment}
                                onCommentChange={setNewComment}
                                onAddComment={handleAddComment}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          {issue.status !== 'Resolved' && issue.status !== 'Closed' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setShowResolveDialog(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEscalateIssue(issue.id)}
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Create Issue Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Issue Type *</label>
                    <Select 
                      value={newIssue.type} 
                      onValueChange={(value) => setNewIssue(prev => ({ ...prev, type: value as IssueInfo['type'] }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity *</label>
                    <Select 
                      value={newIssue.severity} 
                      onValueChange={(value) => setNewIssue(prev => ({ ...prev, severity: value as IssueInfo['severity'] }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Project Name *</label>
                    <Input
                      value={newIssue.projectName}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="Project name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      value={newIssue.location}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Site location"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateIssue} 
                    className="flex-1"
                    disabled={!newIssue.title || !newIssue.description || !newIssue.projectName || !newIssue.location}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Issue
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Resolve Issue Dialog */}
          <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Mark issue {selectedIssue?.id} as resolved?</p>
                <div>
                  <label className="text-sm font-medium">Resolution Notes *</label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the issue was resolved..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleResolveIssue} 
                    className="flex-1"
                    disabled={!resolutionNotes}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Issue
                  </Button>
                  <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};

// Issue Details Component
const IssueDetailsView = ({ 
  issue, 
  comments, 
  newComment, 
  onCommentChange, 
  onAddComment 
}: { 
  issue: IssueInfo;
  comments: IssueComment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Issue Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{issue.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Severity:</span>
              <Badge className={`${issue.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                               issue.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                               'bg-yellow-100 text-yellow-800'}`}>
                {issue.severity}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={`${issue.status === 'Open' ? 'bg-red-100 text-red-800' : 
                               issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                               'bg-orange-100 text-orange-800'}`}>
                {issue.status}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Project Details</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Project:</span> {issue.projectName}</div>
            <div><span className="text-muted-foreground">Location:</span> {issue.location}</div>
            <div><span className="text-muted-foreground">Reported by:</span> {issue.reportedBy}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-sm bg-muted/50 p-3 rounded">{issue.description}</p>
      </div>

      {/* Comments */}
      <div>
        <h3 className="font-medium mb-2">Comments ({comments.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-muted/30 p-3 rounded text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
        
        {/* Add Comment */}
        <div className="flex gap-2 mt-3">
          <Input
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button size="sm" onClick={onAddComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssuesManagement;