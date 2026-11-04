/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRun } from "@/lib/data";

type RunStep = {
  id: string; step_order: number; step_name: string; model_name: string;
  latency_ms: number | null; output_type: string; input_text: string | null;
  output_text: string | null; input_media_url?: string | null; output_media_url?: string | null;
};

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const run = await getRun(id); if (!run) notFound();
  return <main className="page-wrap"><Link href="/runs" className="back-link">← Media & runs</Link>
    <section className="editor-heading"><div><p className="eyebrow">Execution detail</p><h1>{run.chain_name}</h1><p>{new Date(run.started_at).toLocaleString()} · {run.prompt_chain_run_steps.length} steps</p></div><span className={`status-label ${run.status}`}>{run.status}</span></section>
    {run.error_message && <div className="error-banner"><strong>Run failed</strong><p>{run.error_message}</p></div>}
    <section className="result-hero"><div><p className="eyebrow">Final output</p>{run.final_output_text ? <pre>{run.final_output_text}</pre> : <p className="muted">No text output.</p>}</div>{run.final_output_media_url && <img src={run.final_output_media_url} alt="Final generated output" />}</section>
    <section className="run-timeline"><p className="eyebrow">Step trace</p>{run.prompt_chain_run_steps.map((step: RunStep) => <article key={step.id} className="trace-card"><div className="trace-number">{String(step.step_order).padStart(2, "0")}</div><div className="trace-content"><header><div><h2>{step.step_name}</h2><span>{step.model_name}</span></div><b>{step.latency_ms ? `${(step.latency_ms / 1000).toFixed(1)}s` : "—"}</b></header><div className="trace-columns"><div><h3>Input</h3>{step.input_text && <pre>{step.input_text}</pre>}{step.input_media_url && <img src={step.input_media_url} alt={`Input for ${step.step_name}`} />}{!step.input_text && !step.input_media_url && <p className="muted">No input</p>}</div><div><h3>{step.output_type} output</h3>{step.output_text && <pre>{step.output_text}</pre>}{step.output_media_url && <img src={step.output_media_url} alt={`Output from ${step.step_name}`} />}</div></div></div></article>)}</section>
  </main>;
}
