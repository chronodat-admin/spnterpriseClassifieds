import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IAiGenerateRequest,
  IAiGenerateResponse,
  IAiModerationResult,
  IListing
} from '../interfaces';
import { SettingRepository } from '../repositories/SettingRepository';
import { AI_SETTINGS_KEYS, TELEMETRY_EVENTS } from '../constants';
import { TelemetryService } from './TelemetryService';

interface AzureOpenAIChatResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

export class AiService {
  private _settingRepo: SettingRepository;
  private _telemetry: TelemetryService;

  constructor(context: WebPartContext) {
    this._settingRepo = new SettingRepository(context);
    this._telemetry = new TelemetryService(context);
  }

  private async getConfig(): Promise<{ endpoint: string; deployment: string; apiKey: string }> {
    const [endpointSetting, deploymentSetting, apiKeySetting] = await Promise.all([
      this._settingRepo.getByKey(AI_SETTINGS_KEYS.Endpoint),
      this._settingRepo.getByKey(AI_SETTINGS_KEYS.DeploymentName),
      this._settingRepo.getByKey(AI_SETTINGS_KEYS.ApiKeySecret)
    ]);

    const endpoint = endpointSetting?.value ?? '';
    const deployment = deploymentSetting?.value ?? '';
    const apiKey = apiKeySetting?.value ?? '';

    if (!endpoint || !deployment || !apiKey) {
      throw new Error('Azure OpenAI is not configured. Set endpoint, deployment, and API key in settings.');
    }

    return { endpoint: endpoint.replace(/\/$/, ''), deployment, apiKey };
  }

  private async isFeatureEnabled(key: string): Promise<boolean> {
    const setting = await this._settingRepo.getByKey(key);
    return setting?.value === 'true' || setting?.value === '1';
  }

  private async chatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    const { endpoint, deployment, apiKey } = await this.getConfig();
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI request failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as AzureOpenAIChatResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }

  public async generate(request: IAiGenerateRequest): Promise<IAiGenerateResponse> {
    if (!(await this.isFeatureEnabled(AI_SETTINGS_KEYS.EnableGeneration))) {
      throw new Error('AI generation is disabled.');
    }

    const systemPrompts: Record<IAiGenerateRequest['type'], string> = {
      title: 'Generate a concise marketplace listing title. Return only the title text.',
      description: 'Generate a professional marketplace listing description. Return only the description.',
      keywords: 'Generate comma-separated SEO keywords for a marketplace listing. Return only keywords.',
      category: 'Suggest the best category name for this listing. Return only the category name.',
      tags: 'Generate comma-separated tags for a marketplace listing. Return only tags.',
      improve: 'Improve the following marketplace listing text while preserving meaning. Return only the improved text.',
      rewrite: 'Rewrite the following marketplace listing text in a fresh style. Return only the rewritten text.',
      summarize: 'Summarize the following marketplace listing text concisely. Return only the summary.',
      translate: `Translate the following text to ${request.targetLanguage ?? 'English'}. Return only the translation.`
    };

    const systemPrompt = systemPrompts[request.type];
    const userPrompt = request.context
      ? `Context: ${request.context}\n\nContent:\n${request.content}`
      : request.content;

    const result = await this.chatCompletion(systemPrompt, userPrompt);

    this._telemetry.trackEvent({
      name: TELEMETRY_EVENTS.AiGenerationUsed,
      properties: { type: request.type }
    });

    const suggestions =
      request.type === 'tags' || request.type === 'keywords'
        ? result.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

    return { result, suggestions, confidence: 0.85 };
  }

  public async moderate(content: string): Promise<IAiModerationResult> {
    if (!(await this.isFeatureEnabled(AI_SETTINGS_KEYS.EnableModeration))) {
      return { isApproved: true, flags: [], score: 0 };
    }

    const systemPrompt =
      'You are a content moderation assistant. Analyze marketplace listing content for spam, fraud, hate speech, harassment, or inappropriate content. Respond with JSON only: {"isApproved":boolean,"flags":string[],"score":number,"reason":string}. Score is 0-100 where higher means more problematic.';
    const result = await this.chatCompletion(systemPrompt, content);

    try {
      const parsed = JSON.parse(result) as IAiModerationResult;
      return {
        isApproved: parsed.isApproved ?? true,
        flags: parsed.flags ?? [],
        score: parsed.score ?? 0,
        reason: parsed.reason
      };
    } catch {
      const lower = result.toLowerCase();
      const flagged = lower.includes('inappropriate') || lower.includes('spam') || lower.includes('fraud');
      return {
        isApproved: !flagged,
        flags: flagged ? ['manual_review'] : [],
        score: flagged ? 75 : 10,
        reason: flagged ? result : undefined
      };
    }
  }

  public async detectDuplicate(
    listing: Pick<IListing, 'title' | 'description' | 'sellerId'>,
    candidates: IListing[]
  ): Promise<{ isDuplicate: boolean; matches: Array<{ id: number; title: string; score: number }> }> {
    if (!(await this.isFeatureEnabled(AI_SETTINGS_KEYS.EnableDuplicateDetection))) {
      return { isDuplicate: false, matches: [] };
    }

    if (candidates.length === 0) {
      return { isDuplicate: false, matches: [] };
    }

    const candidateSummary = candidates
      .slice(0, 10)
      .map(c => `ID:${c.id} Title:${c.title} Description:${c.description.substring(0, 200)}`)
      .join('\n');

    const systemPrompt =
      'Compare a new marketplace listing against existing listings. Respond with JSON only: {"isDuplicate":boolean,"matches":[{"id":number,"title":string,"score":number}]}. Score is 0-100 similarity.';
    const userPrompt = `New listing:\nTitle: ${listing.title}\nDescription: ${listing.description}\nSeller: ${listing.sellerId}\n\nExisting listings:\n${candidateSummary}`;

    const result = await this.chatCompletion(systemPrompt, userPrompt);

    try {
      const parsed = JSON.parse(result) as {
        isDuplicate: boolean;
        matches: Array<{ id: number; title: string; score: number }>;
      };
      return {
        isDuplicate: parsed.isDuplicate ?? false,
        matches: parsed.matches ?? []
      };
    } catch {
      const titleMatches = candidates
        .filter(c => c.title.toLowerCase() === listing.title.toLowerCase())
        .map(c => ({ id: c.id, title: c.title, score: 100 }));
      return {
        isDuplicate: titleMatches.length > 0,
        matches: titleMatches
      };
    }
  }
}
