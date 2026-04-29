import type { Decision, EventRisk } from "@/types/analysis";
import type { DirectionalBias } from "@/lib/market-data/types";

export function assertNonEmptyString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid analyzer input: ${fieldName} must be a non-empty string`);
  }
}

export function assertFiniteNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid analyzer input: ${fieldName} must be a finite number`);
  }
}

export function assertPositiveNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid analyzer input: ${fieldName} must be a positive number`);
  }
}

export function assertNonNegativeNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid analyzer input: ${fieldName} must be a non-negative number`);
  }
}

export function assertArray(
  value: unknown,
  fieldName: string
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid analyzer input: ${fieldName} must be an array`);
  }
}

export function assertDecision(value: unknown, fieldName: string): asserts value is Decision {
  if (value !== "valid" && value !== "watchlist" && value !== "pass") {
    throw new Error(
      `Invalid analyzer input: ${fieldName} must be one of valid, watchlist, or pass`
    );
  }
}

export function assertEventRisk(
  value: unknown,
  fieldName: string
): asserts value is EventRisk {
  if (value !== "low" && value !== "medium" && value !== "high") {
    throw new Error(
      `Invalid analyzer input: ${fieldName} must be one of low, medium, or high`
    );
  }
}

export function assertRole(
  value: unknown,
  fieldName: string
): asserts value is "safer" | "balanced" | "aggressive" {
  if (value !== "safer" && value !== "balanced" && value !== "aggressive") {
    throw new Error(
      `Invalid analyzer input: ${fieldName} must be one of safer, balanced, or aggressive`
    );
  }
}

export function assertDirectionalBias(
  value: unknown,
  fieldName: string
): asserts value is DirectionalBias {
  if (value !== "bullish" && value !== "bearish" && value !== "neutral") {
    throw new Error(
      `Invalid analyzer input: ${fieldName} must be one of bullish, bearish, or neutral`
    );
  }
}