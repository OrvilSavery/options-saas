export class MarketDataConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataConfigError";
  }
}

export class MarketDataRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataRequestError";
  }
}

export class MarketDataResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataResponseError";
  }
}

export class MarketDataUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataUnavailableError";
  }
}