import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { ChainRun, ChainStep, PromptChain } from "@/lib/types";

export async function getChains() {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("prompt_chains")
    .select("*, prompt_chain_steps(id)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Array<PromptChain & { prompt_chain_steps: Array<{ id: string }> }>;
}

export async function getChain(id: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("prompt_chains")
    .select("*, prompt_chain_steps(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const chain = data as PromptChain;
  chain.prompt_chain_steps = (chain.prompt_chain_steps ?? []).sort(
    (a: ChainStep, b: ChainStep) => a.step_order - b.step_order,
  );
  return chain as PromptChain & { prompt_chain_steps: ChainStep[] };
}

export async function getRuns(chainId?: string) {
  const admin = createAdminSupabaseClient();
  let query = admin.from("prompt_chain_runs").select("*").order("started_at", { ascending: false }).limit(100);
  if (chainId) query = query.eq("chain_id", chainId);
  const { data, error } = await query;
  if (error) throw error;
  return data as ChainRun[];
}

export async function getRun(id: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("prompt_chain_runs")
    .select("*, prompt_chain_run_steps(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const paths = [data.input_media_path, data.final_output_media_path,
    ...(data.prompt_chain_run_steps ?? []).flatMap((step: { input_media_path?: string; output_media_path?: string }) => [step.input_media_path, step.output_media_path])]
    .filter((value): value is string => Boolean(value));
  const signed = new Map<string, string>();
  await Promise.all([...new Set(paths)].map(async (path) => {
    const { data: url } = await admin.storage.from("prompt-chain-media").createSignedUrl(path, 3600);
    if (url?.signedUrl) signed.set(path, url.signedUrl);
  }));
  return {
    ...data,
    input_media_url: data.input_media_path ? signed.get(data.input_media_path) : null,
    final_output_media_url: data.final_output_media_path ? signed.get(data.final_output_media_path) : null,
    prompt_chain_run_steps: (data.prompt_chain_run_steps ?? [])
      .sort((a: { step_order: number }, b: { step_order: number }) => a.step_order - b.step_order)
      .map((step: { input_media_path?: string; output_media_path?: string }) => ({
        ...step,
        input_media_url: step.input_media_path ? signed.get(step.input_media_path) : null,
        output_media_url: step.output_media_path ? signed.get(step.output_media_path) : null,
      })),
  };
}
