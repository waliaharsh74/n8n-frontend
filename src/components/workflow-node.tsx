"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Webhook, Send, Mail, MessageSquare, GitBranch, Repeat, Zap } from "lucide-react"

interface WorkflowNodeData {
  label: string
  type: "trigger" | "action" | "logic"
  nodeType: string
  description?: string
}

const getNodeIcon = (type: string, nodeType: string) => {
  if (type === "trigger") {
    switch (nodeType) {
      case "manual":
        return <Play className="h-4 w-4" />
      case "cron":
        return <Clock className="h-4 w-4" />
      case "webhook":
        return <Webhook className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  if (type === "action") {
    switch (nodeType) {
      case "telegram":
        return <Send className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "llm":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  if (type === "logic") {
    switch (nodeType) {
      case "if":
        return <GitBranch className="h-4 w-4" />
      case "loop":
        return <Repeat className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return <Zap className="h-4 w-4" />
}

const getNodeColor = (type: string) => {
  switch (type) {
    case "trigger":
      return "bg-accent text-accent-foreground"
    case "action":
      return "bg-primary text-primary-foreground"
    case "logic":
      return "bg-secondary text-secondary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  const { label, type, nodeType, description } = data

  return (
    <Card className="min-w-[200px] border-2 hover:border-ring transition-colors">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${getNodeColor(type)}`}>{getNodeIcon(type, nodeType)}</div>
          <div className="flex-1">
            <h3 className="font-medium text-sm text-foreground">{label}</h3>
            <Badge variant="outline" className="text-xs mt-1">
              {type}
            </Badge>
          </div>
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {/* Connection handles */}
      {type !== "trigger" && (
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-border border-2 border-background" />
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-border border-2 border-background" />
    </Card>
  )
}
