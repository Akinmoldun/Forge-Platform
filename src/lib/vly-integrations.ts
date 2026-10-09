// VLY Integrations Configuration
// See /integrations.md for usage documentation

import { createVlyIntegrations } from '@vly-ai/integrations';

export const vly = createVlyIntegrations({
  deploymentToken: (typeof process !== 'undefined' && process.env?.VLY_INTEGRATION_KEY) || '',
  debug: false
});
