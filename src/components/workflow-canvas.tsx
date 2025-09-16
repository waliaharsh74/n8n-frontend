"use client"

import type React from "react"

import { useCallback, useState, useEffect } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { WorkflowNode } from "./workflow-node"
import { NodePalette } from "./node-palette"
import { NodeInspector } from "./node-inspector"
import { useWorkflow } from "./workflow-provider"

const nodeTypes = {
  workflow: WorkflowNode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "workflow",
    position: { x: 250, y: 100 },
    data: {
      label: "Manual Trigger",
      type: "trigger",
      nodeType: "manual",
      description: "Manually trigger this workflow",
    },
  },
]

const initialEdges: Edge[] = []

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const { currentWorkflow, setCurrentWorkflow } = useWorkflow()

  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes.length > 0 ? currentWorkflow.nodes : initialNodes)
      setEdges(currentWorkflow.edges)
    }
  }, [currentWorkflow, setNodes, setEdges])

  useEffect(() => {
    if (currentWorkflow) {
      const updatedWorkflow = {
        ...currentWorkflow,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      }
      setCurrentWorkflow(updatedWorkflow)
    }
  }, [nodes, edges, currentWorkflow, setCurrentWorkflow])

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onNodeUpdate = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node)),
      )
    },
    [setNodes],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const nodeData = JSON.parse(event.dataTransfer.getData("application/nodedata"))

      if (typeof type === "undefined" || !type) {
        return
      }

      const reactFlowBounds = (event.target as Element).getBoundingClientRect()
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${Date.now()}`,
        type: "workflow",
        position,
        data: nodeData,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes],
  )

  return (
    <div className="flex h-full">
      <NodePalette />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Controls className="bg-card border-border" />
          <MiniMap className="bg-card border-border" nodeColor="#164e63" maskColor="rgba(16, 185, 129, 0.1)" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
      <NodeInspector selectedNode={selectedNode} onNodeUpdate={onNodeUpdate} onClose={() => setSelectedNode(null)} />
    </div>
  )
}
