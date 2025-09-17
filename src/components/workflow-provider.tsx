"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Node, Edge } from "@xyflow/react"

interface Workflow {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
  outputs:number
  createdAt: string
  updatedAt: string
}

interface WorkflowRun {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  logs: string[]
  result?: any
}

interface WorkflowContextType {
  currentWorkflow: Workflow | null
  workflows: Workflow[]
  workflowRuns: WorkflowRun[]
  isRunning: boolean
  saveWorkflow: (name: string, description: string, nodes: Node[], edges: Edge[],outputs:number) => void
  loadWorkflow: (workflowId: string) => Workflow | null
  deleteWorkflow: (workflowId: string) => void
  runWorkflow: (workflowId: string) => void
  setCurrentWorkflow: (workflow: Workflow | null) => void
}

const WorkflowContext = createContext<WorkflowContextType | null>(null)

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const saveWorkflow = useCallback(
    (name: string, description: string, nodes: Node[], edges: Edge[],outputs:number) => {
      const now = new Date().toISOString()
      const workflow: Workflow = {
        id: currentWorkflow?.id || `workflow-${Date.now()}`,
        name,
        description,
        nodes,
        edges,
        outputs,
        createdAt: currentWorkflow?.createdAt || now,
        updatedAt: now,
      }

      setWorkflows((prev) => {
        const existing = prev.find((w) => w.id === workflow.id)
        if (existing) {
          return prev.map((w) => (w.id === workflow.id ? workflow : w))
        }
        return [...prev, workflow]
      })

      setCurrentWorkflow(workflow)

      // Save to localStorage for persistence
      const savedWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]")
      const existingIndex = savedWorkflows.findIndex((w: Workflow) => w.id === workflow.id)
      if (existingIndex >= 0) {
        savedWorkflows[existingIndex] = workflow
      } else {
        savedWorkflows.push(workflow)
      }
      localStorage.setItem("workflows", JSON.stringify(savedWorkflows))
    },
    [currentWorkflow],
  )

  const loadWorkflow = useCallback((workflowId: string) => {
    // Load from localStorage
    const savedWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]")
    const workflow = savedWorkflows.find((w: Workflow) => w.id === workflowId)

    if (workflow) {
      setCurrentWorkflow(workflow)
      setWorkflows((prev) => {
        const existing = prev.find((w) => w.id === workflowId)
        if (!existing) {
          return [...prev, workflow]
        }
        return prev
      })
      return workflow
    }
    return null
  }, [])

  const deleteWorkflow = useCallback(
    (workflowId: string) => {
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))

      // Remove from localStorage
      const savedWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]")
      const filtered = savedWorkflows.filter((w: Workflow) => w.id !== workflowId)
      localStorage.setItem("workflows", JSON.stringify(filtered))

      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null)
      }
    },
    [currentWorkflow],
  )

  const runWorkflow = useCallback(
    async (workflowId: string) => {
      const workflow = workflows.find((w) => w.id === workflowId)
      if (!workflow) return

      setIsRunning(true)

      const run: WorkflowRun = {
        id: `run-${Date.now()}`,
        workflowId,
        status: "running",
        startedAt: new Date().toISOString(),
        logs: [`Starting workflow: ${workflow.name}`],
      }

      setWorkflowRuns((prev) => [...prev, run])

      try {
        // Simulate workflow execution
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const completedRun: WorkflowRun = {
          ...run,
          status: "completed",
          completedAt: new Date().toISOString(),
          logs: [
            ...run.logs,
            "Executing nodes in sequence...",
            "All nodes completed successfully",
            "Workflow execution finished",
          ],
          result: { success: true, message: "Workflow completed successfully" },
        }

        setWorkflowRuns((prev) => prev.map((r) => (r.id === run.id ? completedRun : r)))
      } catch (error) {
        const failedRun: WorkflowRun = {
          ...run,
          status: "failed",
          completedAt: new Date().toISOString(),
          logs: [...run.logs, `Error: ${error}`],
        }

        setWorkflowRuns((prev) => prev.map((r) => (r.id === run.id ? failedRun : r)))
      } finally {
        setIsRunning(false)
      }
    },
    [workflows],
  )

  // Load workflows from localStorage on mount
  useState(() => {
    const savedWorkflows = JSON.parse(localStorage.getItem("workflows") || "[]")
    setWorkflows(savedWorkflows)
  })

  return (
    <WorkflowContext.Provider
      value={{
        currentWorkflow,
        workflows,
        workflowRuns,
        isRunning,
        saveWorkflow,
        loadWorkflow,
        deleteWorkflow,
        runWorkflow,
        setCurrentWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}
