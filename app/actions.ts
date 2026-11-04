"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { InputType, OutputType } from "@/lib/types";

const inputTypes = new Set<InputType>(["text", "image", "text_and_image"]);
const outputTypes = new Set<OutputType>(["text", "image"]);
const clean = (value: FormDataEntryValue | null, max = 5000) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const uuid = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) throw new Error("Invalid record identifier.");
  return text;
};

export async function createChain(formData: FormData) {
  const user = await requireSuperadmin();
  const name = clean(formData.get("name"), 100);
  const description = clean(formData.get("description"), 500);
  const inputType = clean(formData.get("inputType")) as InputType;
  if (name.length < 2 || !inputTypes.has(inputType)) throw new Error("Enter a chain name and valid input type.");
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "chain";
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.from("prompt_chains").insert({
    name, description: description || null, input_type: inputType,
    slug: `${slugBase}-${crypto.randomUUID().slice(0, 6)}`, created_by: user.id,
  }).select("id").single();
  if (error) throw error;
  redirect(`/chains/${data.id}`);
}

export async function updateChain(formData: FormData) {
  await requireSuperadmin();
  const id = uuid(formData.get("id"));
  const name = clean(formData.get("name"), 100);
  const inputType = clean(formData.get("inputType")) as InputType;
  if (name.length < 2 || !inputTypes.has(inputType)) throw new Error("Enter a chain name and valid input type.");
  const { error } = await createAdminSupabaseClient().from("prompt_chains").update({
    name, description: clean(formData.get("description"), 500) || null,
    input_type: inputType, is_active: formData.get("isActive") === "on", updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
  revalidatePath(`/chains/${id}`);
  revalidatePath("/chains");
}

export async function deleteChain(formData: FormData) {
  await requireSuperadmin();
  const id = uuid(formData.get("id"));
  const { error } = await createAdminSupabaseClient().from("prompt_chains").delete().eq("id", id);
  if (error) throw error;
  redirect("/chains");
}

export async function createStep(formData: FormData) {
  await requireSuperadmin();
  const chainId = uuid(formData.get("chainId"));
  const name = clean(formData.get("name"), 100);
  const template = String(formData.get("template") ?? "").trim().slice(0, 10000);
  const outputType = clean(formData.get("outputType")) as OutputType;
  if (name.length < 2 || template.length < 3 || !outputTypes.has(outputType)) throw new Error("Complete the step name, instruction, and output type.");
  const admin = createAdminSupabaseClient();
  const { data: last } = await admin.from("prompt_chain_steps").select("step_order").eq("chain_id", chainId).order("step_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await admin.from("prompt_chain_steps").insert({
    chain_id: chainId, step_order: (last?.step_order ?? 0) + 1, name, template,
    output_type: outputType, model_name: clean(formData.get("modelName"), 120) || null,
  });
  if (error) throw error;
  revalidatePath(`/chains/${chainId}`);
}

export async function updateStep(formData: FormData) {
  await requireSuperadmin();
  const id = uuid(formData.get("id"));
  const chainId = uuid(formData.get("chainId"));
  const outputType = clean(formData.get("outputType")) as OutputType;
  if (!outputTypes.has(outputType)) throw new Error("Invalid output type.");
  const { error } = await createAdminSupabaseClient().from("prompt_chain_steps").update({
    name: clean(formData.get("name"), 100), template: String(formData.get("template") ?? "").trim().slice(0, 10000),
    output_type: outputType, model_name: clean(formData.get("modelName"), 120) || null, updated_at: new Date().toISOString(),
  }).eq("id", id).eq("chain_id", chainId);
  if (error) throw error;
  revalidatePath(`/chains/${chainId}`);
}

export async function deleteStep(formData: FormData) {
  await requireSuperadmin();
  const id = uuid(formData.get("id"));
  const chainId = uuid(formData.get("chainId"));
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("prompt_chain_steps").delete().eq("id", id).eq("chain_id", chainId);
  if (error) throw error;
  const { data: steps } = await admin.from("prompt_chain_steps").select("id").eq("chain_id", chainId).order("step_order");
  if (steps?.length) await admin.rpc("reorder_prompt_chain_steps", { target_chain_id: chainId, ordered_step_ids: steps.map((step) => step.id) });
  revalidatePath(`/chains/${chainId}`);
}

export async function moveStep(formData: FormData) {
  await requireSuperadmin();
  const chainId = uuid(formData.get("chainId"));
  const stepId = uuid(formData.get("stepId"));
  const direction = clean(formData.get("direction"));
  const admin = createAdminSupabaseClient();
  const { data: steps, error } = await admin.from("prompt_chain_steps").select("id").eq("chain_id", chainId).order("step_order");
  if (error) throw error;
  const ids = (steps ?? []).map((step) => step.id);
  const index = ids.indexOf(stepId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index >= 0 && target >= 0 && target < ids.length) [ids[index], ids[target]] = [ids[target], ids[index]];
  const { error: reorderError } = await admin.rpc("reorder_prompt_chain_steps", { target_chain_id: chainId, ordered_step_ids: ids });
  if (reorderError) throw reorderError;
  revalidatePath(`/chains/${chainId}`);
}
