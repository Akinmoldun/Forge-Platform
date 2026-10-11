/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as authCheck from "../authCheck.js";
import type * as collaboration from "../collaboration.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as email_index from "../email/index.js";
import type * as email_templates from "../email/templates.js";
import type * as emails from "../emails.js";
import type * as guestDemo from "../guestDemo.js";
import type * as guestDemo_constants from "../guestDemo/constants.js";
import type * as guestDemo_seed from "../guestDemo/seed.js";
import type * as http from "../http.js";
import type * as issues from "../issues.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_issueStatus from "../lib/issueStatus.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";
import type * as workflows from "../workflows.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  authCheck: typeof authCheck;
  collaboration: typeof collaboration;
  crons: typeof crons;
  email: typeof email;
  "email/index": typeof email_index;
  "email/templates": typeof email_templates;
  emails: typeof emails;
  guestDemo: typeof guestDemo;
  "guestDemo/constants": typeof guestDemo_constants;
  "guestDemo/seed": typeof guestDemo_seed;
  http: typeof http;
  issues: typeof issues;
  "lib/auth": typeof lib_auth;
  "lib/issueStatus": typeof lib_issueStatus;
  projects: typeof projects;
  users: typeof users;
  workflows: typeof workflows;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
