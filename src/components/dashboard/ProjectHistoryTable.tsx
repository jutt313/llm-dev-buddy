
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
        return <MessageSquare className="h-4 w-4 text-cyan-400" />;
      case "cli":
        return <Terminal className="h-4 w-4 text-cyan-400" />;
      case "project":
        return <Folder className="h-4 w-4 text-cyan-400" />;
      default:
        return <Activity className="h-4 w-4 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending":
      case "running":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <>
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-white/10">
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="w-12 pl-6 text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Created</TableHead>
                <TableHead className="w-12 pr-6 text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="text-slate-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-1 text-white">No recent activity found</p>
                      <p className="text-sm">Start a chat or create a project to see your activity here</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="hover:bg-white/5 cursor-pointer border-white/10 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-center p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                        {getTypeIcon(item.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white mb-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-slate-400 truncate max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(item.status)} font-medium border`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Eye className="h-4 w-4 text-slate-400 hover:text-cyan-400 transition-colors" />
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
        <DialogContent className="max-w-2xl rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Description</h4>
                <p className="text-slate-400">{selectedItem.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Status</h4>
                <Badge className={`${getStatusColor(selectedItem.status)} border`}>
                  {selectedItem.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Created</h4>
                <p className="text-slate-400">
                  {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-2">Additional Details</h4>
                  <pre className="bg-white/5 p-3 rounded-lg text-sm overflow-x-auto border border-white/10 text-slate-300">
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
