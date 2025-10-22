"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { runCompleteDiagnostics, checkMacOSSpecificIssues } from "@/lib/supabase/diagnostics";

export function SupabaseDiagnostics(): JSX.Element {
    const [isRunning, setIsRunning] = useState(false);

    const handleRunDiagnostics = async (): Promise<void> => {
        setIsRunning(true);
        try {
            console.clear();
            console.log("🚀 Starting Supabase Upload Diagnostics...");

            await runCompleteDiagnostics();
            await checkMacOSSpecificIssues();

            console.log("\n✅ Diagnostics completed! Check console for detailed results.");
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
                Run comprehensive diagnostics to identify upload issues. Results will appear in the browser console.
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
