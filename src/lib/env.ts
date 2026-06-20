const REQUIRED_SERVER_ENV = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_WS_URL",
] as const;

export type ServerEnvKey = (typeof REQUIRED_SERVER_ENV)[number];

export function getRequiredEnv(name: ServerEnvKey): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function validateServerEnv() {
  for (const key of REQUIRED_SERVER_ENV) {
    getRequiredEnv(key);
  }
}
