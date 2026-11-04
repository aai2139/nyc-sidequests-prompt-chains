import Link from "next/link";
import { getRuns } from "@/lib/data";

export default async function RunsPage({ searchParams }: { searchParams: Promise<{ chain?: string }> }) {
  const { chain } = await searchParams;
  const runs = await getRuns(chain);
  return <main className="page-wrap"><section className="page-heading"><div><p className="eyebrow">Output archive</p><h1>Media & runs</h1><p>Review final media, text, failures, and the output from every step.</p></div></section>
    <section className="runs-table"><div className="table-head"><span>Chain</span><span>Started</span><span>Output</span><span>Status</span></div>{runs.map((run) => <Link href={`/runs/${run.id}`} className="run-row" key={run.id}><strong>{run.chain_name}</strong><span>{new Date(run.started_at).toLocaleString()}</span><span>{run.final_output_media_path ? "Image" : run.final_output_text ? "Text" : "—"}</span><span className={`status-label ${run.status}`}>{run.status}</span></Link>)}{!runs.length && <div className="empty-state"><h2>No runs yet</h2><p>Run a chain and its full history will appear here.</p></div>}</section>
  </main>;
}
