/**
 * A2A validation and sanitization utilities
 */

import type { A2AAgent, A2AAgentDetails, A2ASkill, A2ACapabilities } from '@/types/a2a';

/**
 * Simple HTML sanitization - removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHTML(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove script tags and their content
  const withoutScripts = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove dangerous HTML attributes
  const withoutDangerousAttrs = withoutScripts.replace(
    /\s(?:on\w+|javascript:|vbscript:|data:)[^>]*(?=[>])/gi,
    ''
  );

  // Remove style attributes that might contain javascript
  const withoutStyles = withoutDangerousAttrs.replace(/\sstyle\s*=\s*[^>]*(?=[>])/gi, '');

  // Remove dangerous tags
  const withoutDangerousTags = withoutStyles.replace(
    /<(?:iframe|object|embed|form|input|button|textarea|select|option|script|style|link|meta|base)[^>]*>/gi,
    ''
  );

  return withoutDangerousTags.trim();
}

/**
 * Validates that a value is a string and sanitizes it
 */
export function validateAndSanitizeString(value: unknown, fallback: string = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  return sanitizeHTML(value);
}

/**
 * Validates and sanitizes an A2A skill object
 */
export function validateA2ASkill(skill: unknown): A2ASkill | null {
  if (!skill || typeof skill !== 'object') {
    return null;
  }

  const skillObj = skill as Record<string, unknown>;

  // Required fields
  if (!skillObj.id || typeof skillObj.id !== 'string') {
    return null;
  }
  if (!skillObj.name || typeof skillObj.name !== 'string') {
    return null;
  }
  if (!skillObj.description || typeof skillObj.description !== 'string') {
    return null;
  }

  const validatedSkill: A2ASkill = {
    id: validateAndSanitizeString(skillObj.id),
    name: validateAndSanitizeString(skillObj.name),
    description: validateAndSanitizeString(skillObj.description),
  };

  // Optional fields
  if (skillObj.examples && Array.isArray(skillObj.examples)) {
    validatedSkill.examples = skillObj.examples
      .filter(example => typeof example === 'string')
      .map(example => validateAndSanitizeString(example));
  }

  if (skillObj.inputModes && Array.isArray(skillObj.inputModes)) {
    validatedSkill.inputModes = skillObj.inputModes
      .filter(mode => typeof mode === 'string')
      .map(mode => validateAndSanitizeString(mode));
  }

  if (skillObj.outputModes && Array.isArray(skillObj.outputModes)) {
    validatedSkill.outputModes = skillObj.outputModes
      .filter(mode => typeof mode === 'string')
      .map(mode => validateAndSanitizeString(mode));
  }

  if (skillObj.tags && Array.isArray(skillObj.tags)) {
    validatedSkill.tags = skillObj.tags
      .filter(tag => typeof tag === 'string')
      .map(tag => validateAndSanitizeString(tag));
  }

  if (skillObj.input_schema && typeof skillObj.input_schema === 'object') {
    validatedSkill.input_schema = skillObj.input_schema as Record<string, unknown>;
  }

  if (skillObj.output_schema && typeof skillObj.output_schema === 'object') {
    validatedSkill.output_schema = skillObj.output_schema as Record<string, unknown>;
  }

  return validatedSkill;
}

/**
 * Validates and sanitizes A2A capabilities
 */
export function validateA2ACapabilities(capabilities: unknown): A2ACapabilities {
  if (!capabilities || typeof capabilities !== 'object') {
    return {};
  }

  const capabilitiesObj = capabilities as Record<string, unknown>;
  const validatedCapabilities: A2ACapabilities = {};

  if (capabilitiesObj.skills && Array.isArray(capabilitiesObj.skills)) {
    validatedCapabilities.skills = capabilitiesObj.skills
      .map(skill => validateA2ASkill(skill))
      .filter((skill): skill is A2ASkill => skill !== null);
  }

  if (capabilitiesObj.extensions && Array.isArray(capabilitiesObj.extensions)) {
    validatedCapabilities.extensions = capabilitiesObj.extensions
      .filter(ext => typeof ext === 'string')
      .map(ext => validateAndSanitizeString(ext));
  }

  if (typeof capabilitiesObj.pushNotifications === 'boolean') {
    validatedCapabilities.pushNotifications = capabilitiesObj.pushNotifications;
  }

  if (typeof capabilitiesObj.stateTransitionHistory === 'boolean') {
    validatedCapabilities.stateTransitionHistory = capabilitiesObj.stateTransitionHistory;
  }

  if (typeof capabilitiesObj.streaming === 'boolean') {
    validatedCapabilities.streaming = capabilitiesObj.streaming;
  }

  return validatedCapabilities;
}

/**
 * Validates and sanitizes an A2A agent object
 */
export function validateA2AAgent(agent: unknown): A2AAgent | null {
  if (!agent || typeof agent !== 'object') {
    return null;
  }

  const agentObj = agent as Record<string, unknown>;

  // Required fields
  if (!agentObj.id || typeof agentObj.id !== 'string') {
    return null;
  }
  if (!agentObj.name || typeof agentObj.name !== 'string') {
    return null;
  }
  if (!agentObj.description || typeof agentObj.description !== 'string') {
    return null;
  }
  if (!agentObj.url || typeof agentObj.url !== 'string') {
    return null;
  }

  const validatedAgent: A2AAgent = {
    id: validateAndSanitizeString(agentObj.id),
    name: validateAndSanitizeString(agentObj.name),
    description: validateAndSanitizeString(agentObj.description),
    url: validateAndSanitizeString(agentObj.url),
  };

  // Optional fields
  if (agentObj.version && typeof agentObj.version === 'string') {
    validatedAgent.version = validateAndSanitizeString(agentObj.version);
  }

  if (agentObj.capabilities) {
    validatedAgent.capabilities = validateA2ACapabilities(agentObj.capabilities);
  }

  if (agentObj.skills && Array.isArray(agentObj.skills)) {
    validatedAgent.skills = agentObj.skills
      .map(skill => validateA2ASkill(skill))
      .filter((skill): skill is A2ASkill => skill !== null);
  }

  if (agentObj.provider && typeof agentObj.provider === 'object') {
    const providerObj = agentObj.provider as Record<string, unknown>;
    if (providerObj.organization && typeof providerObj.organization === 'string' &&
        providerObj.url && typeof providerObj.url === 'string') {
      validatedAgent.provider = {
        organization: validateAndSanitizeString(providerObj.organization),
        url: validateAndSanitizeString(providerObj.url),
      };
    }
  }

  if (agentObj.defaultInputModes && Array.isArray(agentObj.defaultInputModes)) {
    validatedAgent.defaultInputModes = agentObj.defaultInputModes
      .filter(mode => typeof mode === 'string')
      .map(mode => validateAndSanitizeString(mode));
  }

  if (agentObj.defaultOutputModes && Array.isArray(agentObj.defaultOutputModes)) {
    validatedAgent.defaultOutputModes = agentObj.defaultOutputModes
      .filter(mode => typeof mode === 'string')
      .map(mode => validateAndSanitizeString(mode));
  }

  // Validate status
  if (agentObj.status && typeof agentObj.status === 'string') {
    const status = agentObj.status as string;
    if (['available', 'unavailable', 'error'].includes(status)) {
      validatedAgent.status = status as 'available' | 'unavailable' | 'error';
    }
  }

  if (agentObj.lastUpdated && typeof agentObj.lastUpdated === 'string') {
    validatedAgent.lastUpdated = validateAndSanitizeString(agentObj.lastUpdated);
  }

  if (agentObj.author && typeof agentObj.author === 'string') {
    validatedAgent.author = validateAndSanitizeString(agentObj.author);
  }

  if (agentObj.homepage && typeof agentObj.homepage === 'string') {
    validatedAgent.homepage = validateAndSanitizeString(agentObj.homepage);
  }

  if (agentObj.license && typeof agentObj.license === 'string') {
    validatedAgent.license = validateAndSanitizeString(agentObj.license);
  }

  return validatedAgent;
}

/**
 * Validates and sanitizes an A2A agent details response
 */
export function validateA2AAgentDetails(agentDetails: unknown): A2AAgentDetails | null {
  if (!agentDetails || typeof agentDetails !== 'object') {
    return null;
  }

  const detailsObj = agentDetails as Record<string, unknown>;

  if (!detailsObj.agent) {
    return null;
  }

  const validatedAgent = validateA2AAgent(detailsObj.agent);
  if (!validatedAgent) {
    return null;
  }

  const validatedDetails: A2AAgentDetails = {
    agent: validatedAgent,
    health_status: 'unknown',
  };

  // Validate health status
  if (detailsObj.health_status && typeof detailsObj.health_status === 'string') {
    const healthStatus = detailsObj.health_status as string;
    if (['healthy', 'unhealthy', 'unknown'].includes(healthStatus)) {
      validatedDetails.health_status = healthStatus as 'healthy' | 'unhealthy' | 'unknown';
    }
  }

  if (detailsObj.response_time_ms && typeof detailsObj.response_time_ms === 'number') {
    validatedDetails.response_time_ms = detailsObj.response_time_ms;
  }

  if (detailsObj.last_health_check && typeof detailsObj.last_health_check === 'string') {
    validatedDetails.last_health_check = validateAndSanitizeString(detailsObj.last_health_check);
  }

  return validatedDetails;
}

/**
 * Validates URL format (basic validation)
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}