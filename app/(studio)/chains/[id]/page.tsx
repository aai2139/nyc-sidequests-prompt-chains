import Link from "next/link";
import { notFound } from "next/navigation";
import { createStep, deleteChain, deleteStep, moveStep, updateChain, updateStep } from "@/app/actions";
import { RunForm } from "@/components/run-form";
import { getChain, getRuns } from "@/lib/data";

export default async function ChainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [chain, runs] = await Promise.all([getChain(id), getRuns(id)]);
  if (!chain) notFound();
  const steps = chain.prompt_chain_steps ?? [];
  return <main className="page-wrap">
    <Link href="/chains" className="back-link">← All chains</Link>
    <section className="editor-heading"><div><p className="eyebrow">Chain editor</p><h1>{chain.name}</h1><p>Each numbered step receives the previous step&apos;s output automatically.</p></div><span className="slug">/{chain.slug}</span></section>
    <div className="editor-layout"><section className="editor-main">
      <form action={updateChain} className="panel settings-form"><input type="hidden" name="id" value={chain.id} />
        <div className="panel-title"><div><span className="panel-number">A</span><h2>Chain settings</h2></div><button className="button subtle">Save changes</button></div>
        <div className="field-grid"><label>Name<input name="name" defaultValue={chain.name} required /></label><label>Starting input<select name="inputType" defaultValue={chain.input_type}><option value="text">Text</option><option value="image">Image</option><option value="text_and_image">Text + image</option></select></label></div>
        <label>Description<textarea name="description" rows={2} defaultValue={chain.description ?? ""} /></label>
        <label className="check-row"><input name="isActive" type="checkbox" defaultChecked={chain.is_active} /> Active and ready to run</label>
      </form>
      <section className="steps-section"><div className="section-title"><div><p className="eyebrow">Sequence</p><h2>{steps.length} chain steps</h2></div></div>
        <div className="steps-list">{steps.map((step, index) => <article className="step-card" key={step.id}>
          <div className="step-rail"><span>{String(index + 1).padStart(2, "0")}</span>{index < steps.length - 1 && <i />}</div>
          <form action={updateStep} className="step-form"><input type="hidden" name="id" value={step.id} /><input type="hidden" name="chainId" value={chain.id} />
            <div className="step-toolbar"><span className={`output-badge ${step.output_type}`}>{step.output_type} output</span><div>
              <button formAction={moveStep} name="direction" value="up" disabled={index === 0} title="Move up">↑</button><input type="hidden" name="stepId" value={step.id} />
              <button formAction={moveStep} name="direction" value="down" disabled={index === steps.length - 1} title="Move down">↓</button>
            </div></div>
            <label>Step name<input name="name" defaultValue={step.name} required /></label>
            <label>Instruction<textarea name="template" rows={5} defaultValue={step.template} required /></label>
            <div className="field-grid"><label>Output<select name="outputType" defaultValue={step.output_type}><option value="text">Text</option><option value="image">Image</option></select></label><label>Model override<input name="modelName" defaultValue={step.model_name ?? ""} placeholder="Use environment default" /></label></div>
            <div className="form-actions"><button className="button subtle">Save step</button><button className="text-button danger" formAction={deleteStep}>Delete</button></div>
          </form>
        </article>)}</div>
        <details className="add-step"><summary>＋ Add another step</summary><form action={createStep} className="panel"><input type="hidden" name="chainId" value={chain.id} />
          <div className="field-grid"><label>Step name<input name="name" placeholder="Write five captions" required /></label><label>Output<select name="outputType"><option value="text">Text</option><option value="image">Image</option></select></label></div>
          <label>Instruction<textarea name="template" rows={4} placeholder="Describe exactly what this step should do with the previous output…" required /></label>
          <label>Model override <span className="muted">optional</span><input name="modelName" placeholder="Use environment default" /></label>
          <button className="button primary">Add step</button>
        </form></details>
      </section>
    </section><aside className="editor-side">
      <section className="panel run-panel"><p className="eyebrow">Test bench</p><h2>Run this chain</h2><p>Execute all {steps.length} steps and inspect every intermediate output.</p><RunForm chainId={chain.id} inputType={chain.input_type} /></section>
      <section className="panel recent-runs"><div className="panel-title"><h2>Recent runs</h2><Link href={`/runs?chain=${chain.id}`}>View all</Link></div>{runs.slice(0, 5).map((run) => <Link href={`/runs/${run.id}`} key={run.id}><span className={`run-status ${run.status}`} /> <span>{new Date(run.started_at).toLocaleString()}</span><b>{run.status}</b></Link>)}{!runs.length && <p className="muted">No runs yet.</p>}</section>
      <form action={deleteChain} className="danger-zone"><input type="hidden" name="id" value={chain.id} /><button className="text-button danger">Delete this chain</button></form>
    </aside></div>
  </main>;
}
