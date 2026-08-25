import "server-only";

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseEnvironment() {
  return {
    url: requireEnvironmentVariable("SUPABASE_URL"),
    serviceRoleKey: requireEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getPriceSyncWebhookUrl(): string {
  return requireEnvironmentVariable("N8N_PRICE_SYNC_WEBHOOK_URL");
}
