export type AssistantConversationRole = "user" | "assistant";

export type AssistantConversationMessage = {
  role: AssistantConversationRole;
  text: string;
};

export type AssistantLinkAction = {
  href: string;
  label: string;
  external?: boolean;
};

export type AssistantResponseLink = {
  href: string;
  label?: string;
  title?: string;
  type?: string;
  cta?: string;
  description?: string;
  actions?: AssistantLinkAction[];
};

export type AssistantResponseData = {
  answer: string;
  links?: AssistantResponseLink[];
  suggestions?: string[];
};

export const ASSISTANT_MAX_MESSAGE_LENGTH = 280;
export const ASSISTANT_MAX_HISTORY_MESSAGES = 12;
export const ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH = 600;
export const ASSISTANT_MAX_HISTORY_CHARACTERS = 2_400;
export const ASSISTANT_MAX_STORED_MESSAGES = 16;
export const ASSISTANT_MAX_SUGGESTIONS = 3;
export const ASSISTANT_MAX_SUGGESTION_LENGTH = 84;
