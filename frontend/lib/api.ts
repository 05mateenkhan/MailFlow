export type Intent =
  | "invoice"
  | "support_query"
  | "meeting_request"
  | "spam"
  | "urgent_alert"
  | "general";

export type EmailLog = {
  id: number;
  email_id: string;
  from_addr: string;
  subject: string;
  intent: Intent;
  urgency: number;
  confidence: number;
  matched_rule_id: number | null;
  action_type: string;
  action_value: string | null;
  hitl_required: boolean;
  human_decision: string | null;
  action_result: string;
  created_at: string;
};

export type Rule = {
  id: number;
  user_id: string;
  name: string;
  description: string;
  intent_match: Intent;
  urgency_min: number | null;
  action_type: "reply" | "label" | "forward" | "escalate";
  action_value: string;
  require_hitl: boolean;
  created_at: string;
};

export type HitlItem = {
  id: number;
  email_id: string;
  subject: string;
  from_addr: string;
  classification: {
    intent?: Intent;
    urgency?: number;
    confidence?: number;
    summary?: string;
    [key: string]: unknown;
  };
  proposed_action: { type?: string; value?: string; [key: string]: unknown };
  status: "pending" | "approved" | "rejected" | "modified";
  human_action: Record<string, unknown> | null;
  created_at: string;
};

export type RuleInput = {
  name: string;
  description: string;
  intent_match: Intent;
  urgency_min: number | null;
  action_type: "reply" | "label" | "forward" | "escalate";
  action_value: string;
  require_hitl: boolean;
  user_id?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function getLogs(limit = 50): Promise<EmailLog[]> {
  return request<EmailLog[]>(`/logs?limit=${limit}`);
}

export function getPendingHitl(): Promise<HitlItem[]> {
  return request<HitlItem[]>("/hitl");
}

export function approveHitl(
  emailId: string,
  action?: { type: string; value: string },
) {
  return request<{ status: string }>(`/hitl/${emailId}/approve`, {
    method: "POST",
    body: JSON.stringify(action ? { action } : {}),
  });
}

export function rejectHitl(emailId: string) {
  return request<{ status: string }>(`/hitl/${emailId}/reject`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getRules(): Promise<Rule[]> {
  return request<Rule[]>("/rules");
}

export function createRule(payload: RuleInput) {
  return request<{ id: number }>("/rules", {
    method: "POST",
    body: JSON.stringify({ user_id: "default", ...payload }),
  });
}

export function updateRule(ruleId: number, payload: Partial<RuleInput>) {
  return request<{ status: string }>(`/rules/${ruleId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteRule(ruleId: number) {
  return request<{ status: string }>(`/rules/${ruleId}`, {
    method: "DELETE",
  });
}

export async function uploadKnowledgeBase(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ status: string; chunks: number }>("/kb/upload", {
    method: "POST",
    body: formData,
  });
}
