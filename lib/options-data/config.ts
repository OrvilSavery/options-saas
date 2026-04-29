export type ConfiguredOptionsDataProvider = "mock" | "tradier";
export type TradierEnvironment = "sandbox" | "production";

export function getConfiguredOptionsDataProvider(): ConfiguredOptionsDataProvider {
  const value = (process.env.OPTIONS_DATA_PROVIDER ?? "mock").trim().toLowerCase();

  if (value === "tradier") {
    return "tradier";
  }

  return "mock";
}

export function getTradierApiToken(): string {
  const token = process.env.TRADIER_API_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "TRADIER_API_TOKEN is required when OPTIONS_DATA_PROVIDER=tradier"
    );
  }

  return token;
}

export function getTradierEnvironment(): TradierEnvironment {
  const env = (process.env.TRADIER_ENV ?? "sandbox").trim().toLowerCase();

  if (env === "production") {
    return "production";
  }

  return "sandbox";
}

export function getTradierBaseUrl(): string {
  const env = getTradierEnvironment();

  return env === "production"
    ? "https://api.tradier.com/v1"
    : "https://sandbox.tradier.com/v1";
}