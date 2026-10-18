/**
 * Error thrown by the in-memory demo store and demo mutations
 * when a guest attempts an operation that requires a real account.
 */
export class DemoAccountRequiredError extends Error {
  readonly code = "ACCOUNT_REQUIRED" as const;

  constructor(message = "Create an account to do this.") {
    super(message);
    this.name = "DemoAccountRequiredError";
    Object.setPrototypeOf(this, DemoAccountRequiredError.prototype);
  }
}
