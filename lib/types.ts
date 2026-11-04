export type InputType = "text" | "image" | "text_and_image";
export type OutputType = "text" | "image";

export type ChainStep = {
  id: string;
  chain_id: string;
  step_order: number;
  name: string;
  template: string;
  output_type: OutputType;
  model_name: string | null;
};

export type PromptChain = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  input_type: InputType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prompt_chain_steps?: ChainStep[];
};

export type ChainRun = {
  id: string;
  chain_id: string | null;
  chain_name: string;
  status: "running" | "succeeded" | "failed";
  input_text: string | null;
  input_media_path: string | null;
  final_output_text: string | null;
  final_output_media_path: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
};
