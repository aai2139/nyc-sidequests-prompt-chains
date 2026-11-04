import Link from "next/link";
import { createChain } from "@/app/actions";
import { getChains } from "@/lib/data";

export default async function ChainsPage() {
  const chains = await getChains();
  return <main className="page-wrap">
    <section className="page-heading"><div><p className="eyebrow">Workflow library</p><h1>Prompt chains</h1><p>Build repeatable sequences where every output becomes the next step&apos;s input.</p></div>
      <details className="create-popover"><summary className="button primary">New chain</summary><form action={createChain} className="popover-card">
        <label>Name<input name="name" placeholder="Caption machine" required /></label>
        <label>Description<textarea name="description" rows={3} placeholder="What this workflow produces" /></label>
        <label>Starting input<select name="inputType" defaultValue="text"><option value="text">Text</option><option value="image">Image</option><option value="text_and_image">Text + image</option></select></label>
        <button className="button primary">Create chain</button>
      </form></details>
    </section>
    <section className="chain-grid">{chains.length ? chains.map((chain) => <Link className="chain-card" href={`/chains/${chain.id}`} key={chain.id}>
      <div className="card-top"><span className={`status-dot ${chain.is_active ? "active" : ""}`} /> <span>{chain.is_active ? "Active" : "Paused"}</span><span className="input-pill">{chain.input_type.replaceAll("_", " + ")}</span></div>
      <h2>{chain.name}</h2><p>{chain.description || "No description yet."}</p>
      <footer><span>{chain.prompt_chain_steps?.length ?? 0} steps</span><span>Edited {new Date(chain.updated_at).toLocaleDateString()}</span></footer>
    </Link>) : <div className="empty-state"><span>01 → 02 → 03</span><h2>Build your first chain</h2><p>Create a workflow, add its instructions, and run it against text or an image.</p></div>}</section>
  </main>;
}
