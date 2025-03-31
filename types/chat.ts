import { Message as OriginalMessage } from "@inference-gateway/sdk";

export interface Message extends OriginalMessage {
  id: string;
  model?: string;
  reasoning_content?: string;
}
