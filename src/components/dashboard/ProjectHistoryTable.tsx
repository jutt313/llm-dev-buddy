
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Eye, MessageSquare, Terminal, Folder, Activity } from "lucide-react";

interface ProjectHistoryItem {
  id: string;
  type: "chat" | "cli" | "project";
  title: string;
  description: string;
  status: string;
  created_at: string;
  metadata?: any;
}

interface ProjectHistoryTableProps {
  data: ProjectHistoryItem[];
}

const ProjectHistoryTable = ({ data }: ProjectHistoryTableProps) => {
  const [selectedItem, setSelectedItem] = useState<ProjectHistoryItem | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      case "cli":
        return <Terminal className="h-4 w-4" />;
      case "project":
        return <Folder className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30";
      case "pending":
      case "running":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-12 pl-6">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="text-muted-foreground/60">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-1">No recent activity found</p>
                      <p className="text-sm">Start a chat or create a project to see your activity here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="hover:bg-accent/5 cursor-pointer border-border/30 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-center p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                        {getTypeIcon(item.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground mb-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground/70 truncate max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(item.status)} font-medium`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Eye className="h-4 w-4 text-muted-foreground/60 hover:text-primary transition-colors" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedItem.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Status</h4>
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Created</h4>
                <p className="text-muted-foreground">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Additional Details</h4>
                  <pre className="bg-accent/50 p-3 rounded-lg text-sm overflow-x-auto border border-border/30">
                    {JSON.stringify(selectedItem.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectHistoryTable;
