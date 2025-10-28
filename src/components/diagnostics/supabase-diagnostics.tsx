"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { runSilentDiagnostics, checkMacOSSpecificIssuesSilent } from "@/lib/supabase/diagnostics";

export function SupabaseDiagnostics(): JSX.Element {
    const [isRunning, setIsRunning] = useState(false);

    const handleRunDiagnostics = async (): Promise<void> => {
        setIsRunning(true);
        try {
            console.clear();
            console.log("🚀 Starting Supabase Upload Diagnostics...");

            const results = await runSilentDiagnostics();
            const macosResults = await checkMacOSSpecificIssuesSilent();

            // Display results in console
            console.log("📊 DIAGNOSTIC RESULTS:");
            console.log("Environment:", results.environment ? "✅" : "❌");
            console.log("Supabase Connection:", results.supabaseConnection ? "✅" : "❌");
            console.log("Storage Access:", results.storageAccess ? "✅" : "❌");
            console.log("Network Config:", results.networkConfig ? "✅" : "❌");
            console.log("Browser Capabilities:", results.browserCapabilities ? "✅" : "❌");
            console.log("File Upload:", results.fileUpload ? "✅" : "❌");
            console.log("macOS Network:", macosResults ? "✅" : "❌");
            
            if (results.criticalIssues.length > 0) {
                console.log("🚨 Critical Issues:", results.criticalIssues);
            }
            if (results.warnings.length > 0) {
                console.log("⚠️ Warnings:", results.warnings);
            }
            if (results.recommendations.length > 0) {
                console.log("💡 Recommendations:", results.recommendations);
            }

            console.log("\n✅ Diagnostics completed!");
        } catch (error) {
            console.error("❌ Diagnostics failed:", error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔍 Supabase Upload Diagnostics
            </h3>
            <p className="text-yellow-700 mb-4">
                Run comprehensive diagnostics to identify upload issues. The improved diagnostics will show a clear summary with critical issues, warnings, and recommendations. Results will appear in the browser console.
            </p>
            <Button
                onClick={handleRunDiagnostics}
                disabled={isRunning}
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
                {isRunning ? "Running Diagnostics..." : "🚀 Run Full Diagnostics"}
            </Button>
            <p className="text-sm text-yellow-600 mt-2">
                Open Developer Tools (F12) → Console tab to see detailed results
            </p>
        </div>
    );
}
