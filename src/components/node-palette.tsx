"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Webhook, Send, Mail, MessageSquare, GitBranch, Repeat } from "lucide-react"

interface NodeTemplate {
  id: string
  label: string
  type: "trigger" | "action" | "logic"
  nodeType: string
  description: string
  icon: React.ReactNode,
  outputs:number
}

const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    id: "manual-trigger",
    label: "Manual Trigger",
    type: "trigger",
    nodeType: "manual",
    description: "Manually start the workflow",
    icon: <Play className="h-4 w-4" />,
    outputs:1
  },
  {
    id: "cron-trigger",
    label: "Cron Trigger",
    type: "trigger",
    nodeType: "cron",
    description: "Schedule workflow execution",
    icon: <Clock className="h-4 w-4" />,
      outputs:1
  },
  {
    id: "webhook-trigger",
    label: "Webhook Trigger",
    type: "trigger",
    nodeType: "webhook",
    description: "Trigger via HTTP webhook",
    icon: <Webhook className="h-4 w-4" />,
      outputs:1
  },
  // Actions
  {
    id: "telegram-action",
    label: "Send Telegram",
    type: "action",
    nodeType: "telegram",
    description: "Send message to Telegram",
    icon: <Send className="h-4 w-4" />,
      outputs:1
  },
  {
    id: "email-action",
    label: "Send Email",
    type: "action",
    nodeType: "email",
    description: "Send email message",
    icon: <Mail className="h-4 w-4" />,
      outputs:1
  },
  {
    id: "llm-action",
    label: "LLM Query",
    type: "action",
    nodeType: "llm",
    description: "Query language model",
    icon: <MessageSquare className="h-4 w-4" />,
      outputs:1
  },
  // Logic
  {
    id: "if-logic",
    label: "If Condition",
    type: "logic",
    nodeType: "if",
    description: "Conditional branching",
    icon: <GitBranch className="h-4 w-4" />,
    outputs:2
  },
  {
    id: "loop-logic",
    label: "Loop",
    type: "logic",
    nodeType: "loop",
    description: "Repeat actions",
    icon: <Repeat className="h-4 w-4" />,
      outputs:1
   
  },
]

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

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    event.dataTransfer.setData("application/reactflow", "workflow")
    event.dataTransfer.setData(
      "application/nodedata",
      JSON.stringify({
        label: nodeTemplate.label,
        type: nodeTemplate.type,
        nodeType: nodeTemplate.nodeType,
        description: nodeTemplate.description,
      }),
    )
    event.dataTransfer.effectAllowed = "move"
  }

  const groupedNodes = nodeTemplates.reduce(
    (acc, node) => {
      if (!acc[node.type]) acc[node.type] = []
      acc[node.type].push(node)
      return acc
    },
    {} as Record<string, NodeTemplate[]>,
  )

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">Node Palette</h2>

      {Object.entries(groupedNodes).map(([type, nodes]) => (
        <Card key={type} className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize text-card-foreground">{type}s</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(event) => onDragStart(event, node)}
                className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-ring cursor-grab active:cursor-grabbing transition-colors bg-card"
              >
                <div className={`p-1.5 rounded ${getNodeColor(node.type)}`}>{node.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-card-foreground truncate">{node.label}</h3>
                  <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
