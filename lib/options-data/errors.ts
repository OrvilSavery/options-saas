export class OptionsDataConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptionsDataConfigError";
  }
}

export class OptionsDataRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptionsDataRequestError";
  }
}

export class OptionsDataResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptionsDataResponseError";
  }
}

export class OptionsDataUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptionsDataUnavailableError";
  }
}