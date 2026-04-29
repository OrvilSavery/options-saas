import {
  OptionsDataResponseError,
  OptionsDataUnavailableError,
} from "@/lib/options-data/errors";

export function assertNonEmptyString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new OptionsDataResponseError(
      `Options response field ${fieldName} must be a non-empty string.`
    );
  }
}

export function assertFinitePositiveNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new OptionsDataResponseError(
      `Options response field ${fieldName} must be a positive number.`
    );
  }
}

export function assertArray<T>(
  value: T[] | undefined | null,
  fieldName: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new OptionsDataResponseError(
      `Options response field ${fieldName} must be an array.`
    );
  }
}

export function assertNonEmptyArray<T>(
  value: T[],
  fieldName: string
): void {
  if (value.length === 0) {
    throw new OptionsDataUnavailableError(
      `No usable values were returned for ${fieldName}.`
    );
  }
}