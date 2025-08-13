
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
import { Eye, MessageSquare, Terminal, Folder } from "lucide-react";

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
        return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
      case "running":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-slate-500 dark:text-slate-400">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity found</p>
                      <p className="text-sm">Start a chat or create a project to see your activity here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedItem.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Status</h4>
                <Badge className={getStatusColor(selectedItem.status)}>
                  {selectedItem.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Created</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Additional Details</h4>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm overflow-x-auto">
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
