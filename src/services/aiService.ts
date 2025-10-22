/**
 * AI Service (OpenAI API Integration)
 *
 * Per product spec:
 * - Small model for cost efficiency (gpt-3.5-turbo or similar)
 * - Event summarization (150-250 chars, facts only)
 * - Impact estimation (outlook pill + reasoning)
 * - Guardrails: forbidden words, numeric consistency
 * - Failsafe: fallback to fixed message on failure
 */

/**
 * AI service configuration
 */
export interface AIConfig {
  /** OpenAI API key */
  apiKey: string;
  /** Model to use (default: gpt-3.5-turbo for cost) */
  model?: string;
  /** Temperature (0 for deterministic) */
  temperature?: number;
  /** Maximum tokens */
  maxTokens?: number;
}

/**
 * AI completion request
 */
export interface AICompletionRequest {
  /** System prompt */
  systemPrompt: string;
  /** User message */
  userMessage: string;
  /** Model override */
  model?: string;
  /** Temperature override */
  temperature?: number;
  /** Max tokens override */
  maxTokens?: number;
}

/**
 * AI completion response
 */
export interface AICompletionResponse {
  /** Generated text */
  text: string;
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model used */
  model: string;
}

/**
 * Default AI configuration
 * Per product spec: small model for cost efficiency
 */
const DEFAULT_CONFIG: Partial<AIConfig> = {
  model: 'gpt-3.5-turbo',
  temperature: 0,
  maxTokens: 500,
};

let globalConfig: AIConfig | null = null;

/**
 * Initialize AI service with configuration
 *
 * @param config - AI configuration
 */
export function initializeAI(config: AIConfig): void {
  globalConfig = { ...DEFAULT_CONFIG, ...config } as AIConfig;
}

/**
 * Get current configuration
 */
function getConfig(): AIConfig {
  if (!globalConfig) {
    throw new Error('AI service not initialized. Call initializeAI() first.');
  }
  return globalConfig;
}

/**
 * Call OpenAI Chat Completion API
 *
 * @param request - Completion request
 * @returns Completion response
 */
export async function callOpenAI(
  request: AICompletionRequest,
): Promise<AICompletionResponse> {
  const config = getConfig();

  const model = request.model || config.model || 'gpt-3.5-turbo';
  const temperature = request.temperature ?? config.temperature ?? 0;
  const maxTokens = request.maxTokens || config.maxTokens || 500;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: request.systemPrompt,
          },
          {
            role: 'user',
            content: request.userMessage,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();

    return {
      text: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
    };
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

/**
 * Call OpenAI with retry logic
 * Per product spec: handle failures gracefully
 *
 * @param request - Completion request
 * @param maxRetries - Maximum retry attempts (default: 2)
 * @returns Completion response
 */
export async function callOpenAIWithRetry(
  request: AICompletionRequest,
  maxRetries = 2,
): Promise<AICompletionResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callOpenAI(request);
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `OpenAI API attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        error,
      );

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
  }

  throw lastError || new Error('OpenAI API failed after retries');
}

/**
 * Check if AI service is initialized
 */
export function isAIInitialized(): boolean {
  return globalConfig !== null;
}

/**
 * Get failsafe message
 * Per product spec: fallback message when AI fails
 */
export function getFailsafeMessage(): string {
  return '一次情報の更新。詳細は出典へ';
}
