import { useState, useEffect } from "react"
import type { Node } from "@xyflow/react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Settings } from "lucide-react"

interface NodeInspectorProps {
  selectedNode: Node | null
  onNodeUpdate: (nodeId: string, newData: any) => void
  onClose: () => void
}

interface NodeConfig {
  [key: string]: any
}

export function NodeInspector({ selectedNode, onNodeUpdate, onClose }: NodeInspectorProps) {
  const [config, setConfig] = useState<NodeConfig>({})

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {})
    }
  }, [selectedNode])

  if (!selectedNode) {
    return (
      <div className="w-80 bg-card border-l border-border p-4">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a node to configure</p>
          </div>
        </div>
      </div>
    )
  }

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onNodeUpdate(selectedNode.id, { config: newConfig })
  }

  const handleLabelChange = (newLabel: string) => {
    onNodeUpdate(selectedNode.id, { label: newLabel })
  }

  const renderConfigFields = () => {
    const { type, nodeType } = selectedNode.data

    switch (nodeType) {
      case "cron":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cron-expression">Cron Expression</Label>
              <Input
                id="cron-expression"
                placeholder="0 0 * * *"
                value={config.cronExpression || ""}
                onChange={(e) => handleConfigChange("cronExpression", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Example: "0 9 * * 1-5" (9 AM on weekdays)</p>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={config.timezone || "UTC"} onValueChange={(value) => handleConfigChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "webhook":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-path">Webhook Path</Label>
              <Input
                id="webhook-path"
                placeholder="/webhook/my-workflow"
                value={config.webhookPath || ""}
                onChange={(e) => handleConfigChange("webhookPath", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="http-method">HTTP Method</Label>
              <Select
                value={config.httpMethod || "POST"}
                onValueChange={(value) => handleConfigChange("httpMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "telegram":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bot-token">Bot Token</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="Your Telegram bot token"
                value={config.botToken || ""}
                onChange={(e) => handleConfigChange("botToken", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="chat-id">Chat ID</Label>
              <Input
                id="chat-id"
                placeholder="Chat or channel ID"
                value={config.chatId || ""}
                onChange={(e) => handleConfigChange("chatId", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message-template">Message Template</Label>
              <Textarea
                id="message-template"
                placeholder="Hello! The workflow has completed."
                value={config.messageTemplate || ""}
                onChange={(e) => handleConfigChange("messageTemplate", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
                value={config.smtpHost || ""}
                onChange={(e) => handleConfigChange("smtpHost", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={config.smtpPort || ""}
                onChange={(e) => handleConfigChange("smtpPort", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="sender@example.com"
                value={config.fromEmail || ""}
                onChange={(e) => handleConfigChange("fromEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to-email">To Email</Label>
              <Input
                id="to-email"
                type="email"
                placeholder="recipient@example.com"
                value={config.toEmail || ""}
                onChange={(e) => handleConfigChange("toEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Workflow Notification"
                value={config.emailSubject || ""}
                onChange={(e) => handleConfigChange("emailSubject", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                placeholder="The workflow has completed successfully."
                value={config.emailBody || ""}
                onChange={(e) => handleConfigChange("emailBody", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case "llm":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="llm-provider">Provider</Label>
              <Select
                value={config.provider || "openai"}
                onValueChange={(value) => handleConfigChange("provider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="llm-model">Model</Label>
              <Input
                id="llm-model"
                placeholder="gpt-4"
                value={config.model || ""}
                onChange={(e) => handleConfigChange("model", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="llm-prompt">Prompt Template</Label>
              <Textarea
                id="llm-prompt"
                placeholder="Analyze the following data: {{input}}"
                value={config.promptTemplate || ""}
                onChange={(e) => handleConfigChange("promptTemplate", e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                placeholder="1000"
                value={config.maxTokens || ""}
                onChange={(e) => handleConfigChange("maxTokens", Number.parseInt(e.target.value))}
              />
            </div>
          </div>
        )

      case "if":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition-field">Field to Check</Label>
              <Input
                id="condition-field"
                placeholder="data.status"
                value={config.conditionField || ""}
                onChange={(e) => handleConfigChange("conditionField", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="condition-operator">Operator</Label>
              <Select
                value={config.operator || "equals"}
                onValueChange={(value) => handleConfigChange("operator", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition-value">Value</Label>
              <Input
                id="condition-value"
                placeholder="success"
                value={config.conditionValue || ""}
                onChange={(e) => handleConfigChange("conditionValue", e.target.value)}
              />
            </div>
          </div>
        )

      case "loop":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="loop-array">Array Field</Label>
              <Input
                id="loop-array"
                placeholder="data.items"
                value={config.arrayField || ""}
                onChange={(e) => handleConfigChange("arrayField", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="loop-variable">Item Variable Name</Label>
              <Input
                id="loop-variable"
                placeholder="item"
                value={config.itemVariable || "item"}
                onChange={(e) => handleConfigChange("itemVariable", e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">No configuration options for this node type.</p>
          </div>
        )
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Node Inspector</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {selectedNode.data.type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {selectedNode.data.nodeType}
          </Badge>
        </div>

        <div>
          <Label htmlFor="node-label">Node Label</Label>
          <Input id="node-label" value={selectedNode.data.label} onChange={(e) => handleLabelChange(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="node-description">Description</Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description || ""}
            onChange={(e) => onNodeUpdate(selectedNode.id, { description: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Configuration</Label>
          <div className="mt-2">{renderConfigFields()}</div>
        </div>
      </CardContent>
    </div>
  )
}
