import {
  OptionsDataResponseError,
} from "@/lib/options-data/errors";
import type {
  RawOptionContractRow,
  TradierOptionRow,
  TradierOptionsChainResponse,
} from "@/lib/options-data/types";

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function extractIv(row: TradierOptionRow): number | null {
  const greeks = row.greeks;
  if (!greeks) return null;

  return (
    toNullableNumber(greeks.mid_iv) ??
    toNullableNumber(greeks.bid_iv) ??
    toNullableNumber(greeks.ask_iv)
  );
}

function normalizeTradierOptionRow(
  ticker: string,
  row: TradierOptionRow,
  index: number
): RawOptionContractRow {
  const optionType = row.option_type;
  const strike = Number(row.strike);
  const expiration = row.expiration_date;

  if (optionType !== "put" && optionType !== "call") {
    throw new OptionsDataResponseError(
      `Tradier option row ${index} for ${ticker} had an invalid option type.`
    );
  }

  if (!Number.isFinite(strike) || strike <= 0) {
    throw new OptionsDataResponseError(
      `Tradier option row ${index} for ${ticker} had an invalid strike.`
    );
  }

  if (typeof expiration !== "string" || expiration.trim() === "") {
    throw new OptionsDataResponseError(
      `Tradier option row ${index} for ${ticker} had an invalid expiration.`
    );
  }

  return {
    symbol: typeof row.symbol === "string" ? row.symbol : `${ticker}-${index}`,
    optionType,
    strike,
    expiration: expiration.trim(),
    bid: toNullableNumber(row.bid),
    ask: toNullableNumber(row.ask),
    last: toNullableNumber(row.last),
    volume: toNullableNumber(row.volume),
    openInterest: toNullableNumber(row.open_interest),
    delta: toNullableNumber(row.greeks?.delta),
    iv: extractIv(row),
  };
}

export function normalizeTradierOptionsChain(
  ticker: string,
  payload: TradierOptionsChainResponse
): RawOptionContractRow[] {
  const optionNode = payload?.options?.option;

  if (!optionNode) {
    throw new OptionsDataResponseError(
      `Tradier options chain response was empty for ${ticker}.`
    );
  }

  const rows = Array.isArray(optionNode) ? optionNode : [optionNode];

  if (rows.length === 0) {
    throw new OptionsDataResponseError(
      `Tradier options chain response was empty for ${ticker}.`
    );
  }

  return rows.map((row, index) => normalizeTradierOptionRow(ticker, row, index));
}