import { Message as OriginalMessage } from "./chat";

export interface Message extends OriginalMessage {
  id: string;
  model?: string;
}
