
import { WorkflowCanvas } from "./workflow-canvas"
import { WorkflowToolbar } from "./workflow-toolbar"
import { WorkflowProvider } from "./workflow-provider"
import { AuthProvider } from "./auth-provider"
import { AuthGuard } from "./auth-guard"

export default function Home() {
    return (
        <AuthProvider>
            <AuthGuard>
                <WorkflowProvider>
                    <div className="h-screen w-full bg-background flex flex-col">
                        <WorkflowToolbar />
                        <div className="flex-1">
                            <WorkflowCanvas />
                        </div>
                    </div>
                </WorkflowProvider>
            </AuthGuard>
        </AuthProvider>
    )
}