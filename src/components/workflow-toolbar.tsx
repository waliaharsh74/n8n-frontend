"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useWorkflow } from "./workflow-provider"
import { useAuth } from "./auth-provider"
import { Save, FolderOpen, Play, Loader2, FileText, Trash2, User, LogOut } from "lucide-react"

export function WorkflowToolbar() {
  const {
    currentWorkflow,
    workflows,
    workflowRuns,
    isRunning,
    saveWorkflow,
    loadWorkflow,
    deleteWorkflow,
    runWorkflow,
  } = useWorkflow()

  const { user, logout } = useAuth()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [logsDialogOpen, setLogsDialogOpen] = useState(false)
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || "")
  const [workflowDescription, setWorkflowDescription] = useState(currentWorkflow?.description || "")
  const [workflowOutputs, setWorkflowOutputs] = useState(currentWorkflow?.outputs || 1)

  const handleSave = () => {
    // Get current nodes and edges from the canvas
    // For now, we'll use empty arrays as placeholder
    const nodes: any[] = []
    const edges: any[] = []

    saveWorkflow(workflowName, workflowDescription, nodes, edges,workflowOutputs)
    setSaveDialogOpen(false)
  }

  const handleLoad = (workflowId: string) => {
    const workflow = loadWorkflow(workflowId)
    if (workflow) {
      setWorkflowName(workflow.name)
      setWorkflowDescription(workflow.description)
      setWorkflowOutputs(workflow?.outputs)
      setLoadDialogOpen(false)
    }
  }

  const handleRun = () => {
    if (currentWorkflow) {
      runWorkflow(currentWorkflow.id)
    }
  }

  const latestRun = workflowRuns
    .filter((run) => run.workflowId === currentWorkflow?.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]

  return (
    <div className="border-b border-border bg-card px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-card-foreground">
              {currentWorkflow?.name || "Untitled Workflow"}
            </h1>
            {currentWorkflow && (
              <Badge variant="outline" className="text-xs">
                {currentWorkflow.id}
              </Badge>
            )}
          </div>

          {latestRun && (
            <Badge
              variant={
                latestRun.status === "completed"
                  ? "default"
                  : latestRun.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {latestRun.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save Dialog */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Workflow</DialogTitle>
                <DialogDescription>Give your workflow a name and description.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Name</Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="My Workflow"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    placeholder="Describe what this workflow does..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!workflowName.trim()}>
                  Save Workflow
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Dialog */}
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Workflow</DialogTitle>
                <DialogDescription>Select a workflow to load.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {workflows.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No saved workflows</p>
                ) : (
                  workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{workflow.name}</h3>
                        <p className="text-xs text-muted-foreground">{workflow.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleLoad(workflow.id)}>
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWorkflow(workflow.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Run Button */}
          <Button
            onClick={handleRun}
            disabled={!currentWorkflow || isRunning}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run
              </>
            )}
          </Button>

          {/* Logs Dialog */}
          {workflowRuns.length > 0 && (
            <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Workflow Execution Logs</DialogTitle>
                  <DialogDescription>Recent workflow runs and their logs.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {workflowRuns
                    .filter((run) => run.workflowId === currentWorkflow?.id)
                    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                    .map((run) => (
                      <div key={run.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              run.status === "completed"
                                ? "default"
                                : run.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {run.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(run.startedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {run.logs.map((log, index) => (
                            <p key={index} className="text-xs font-mono bg-muted p-2 rounded">
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
