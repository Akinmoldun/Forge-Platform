import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { normalizeEmail } from "../authCheck";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordProvider = Password({
  id: "password",
  profile(params) {
    const email = normalizeEmail(String(params.email ?? ""));
    if (!EMAIL_PATTERN.test(email)) throw new ConvexError("Enter a valid email");
    return { email };
  },
  validatePasswordRequirements(password: string) {
    if (password.length < MIN_PASSWORD_LENGTH)
      throw new ConvexError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    if (password.length > MAX_PASSWORD_LENGTH)
      throw new ConvexError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
  },
});
