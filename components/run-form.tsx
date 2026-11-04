"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InputType } from "@/lib/types";

export function RunForm({ chainId, inputType }: { chainId: string; inputType: InputType }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <form className="run-form" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch(`/api/chains/${chainId}/run`, { method: "POST", body: new FormData(event.currentTarget) });
    const result = await response.json() as { runId?: string; error?: string };
    if (result.runId) router.push(`/runs/${result.runId}`);
    else { setError(result.error || "Run failed."); setBusy(false); }
  }}>
    {(inputType === "text" || inputType === "text_and_image") && <label>Text input<textarea name="text" rows={5} placeholder="Enter the starting prompt or content…" required /></label>}
    {(inputType === "image" || inputType === "text_and_image") && <label>Image input<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required /></label>}
    {error && <p className="error" role="alert">{error}</p>}
    <button className="button primary" disabled={busy}>{busy ? "Running chain…" : "Run prompt chain"}</button>
  </form>;
}
