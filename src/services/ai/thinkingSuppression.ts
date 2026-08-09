import type { ReasoningConfig } from "../BaseReasoningService";
import { getCloudModel, getLocalModel } from "../../models/ModelRegistry";
import { detectEndpointDialect, suppressThinking } from "./thinkingSuppressionDialects";

export function applyThinkingSuppression(
  requestBody: Record<string, unknown>,
  model: string,
  provider: string,
  config: ReasoningConfig,
  baseUrl?: string
): void {
  // A known endpoint host wins over the generic provider dialect.
  const providerKey = detectEndpointDialect(baseUrl)?.key ?? provider.toLowerCase();
  const cloudModel = getCloudModel(model);

  if (cloudModel?.disableThinking && providerKey === "groq") {
    suppressThinking(requestBody, providerKey, model);
    return;
  }

  if (config.disableThinking !== true) return;

  // GPT-5 models before 5.1 default to medium reasoning and do not accept
  // "none". They are absent from the legacy supportsThinking metadata, but
  // still need the provider-specific minimal setting below.
  const isPre51Gpt5 = providerKey === "openai" && /^gpt-5(?:-mini|-nano)?$/.test(model);

  const localModel = getLocalModel(model);
  const knownModel = cloudModel || localModel;
  if (knownModel && !knownModel.supportsThinking && !isPre51Gpt5) return;

  suppressThinking(requestBody, providerKey, model);
}
