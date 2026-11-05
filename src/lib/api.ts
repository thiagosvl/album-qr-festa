import { API_BASE_URL } from "@/constants";
import { supabase } from "@/integrations/supabase/client";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  requireAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, requireAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (requireAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string; error?: string })
    | null;

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || `Erro na requisição (${response.status})`;
    throw new Error(errorMessage);
  }

  return data as T;
}
