import { SchemaMessage } from "@inference-gateway/sdk";

export interface Message extends SchemaMessage {
  id: string;
  model?: string;
}
