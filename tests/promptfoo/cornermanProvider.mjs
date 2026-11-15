// Custom Promptfoo Provider that invokes Ironclad's Cornerman companion engine
// (including section-level retrieval, citation validation, safety escalation, and outage fallback)
import {
  requestCornermanCompanion,
} from '../../src/services/cornermanEngine.ts';

export default class CornermanPromptfooProvider {
  id() {
    return 'ironclad-cornerman-companion';
  }

  async callApi(prompt, context) {
    const vars = context?.vars || {};
    const messages = Array.isArray(vars.messages)
      ? vars.messages
      : [{ role: 'user', text: String(prompt) }];

    const forceOutage = Boolean(vars.forceProviderUnavailable);
    const supabaseUrl = forceOutage
      ? 'http://127.0.0.1:59999' // Unreachable endpoint to test provider outage handling
      : '';

    const response = await requestCornermanCompanion({
      messages,
      streakDays: typeof vars.streakDays === 'number' ? vars.streakDays : 14,
      supabaseUrl,
      forceProviderUnavailable: forceOutage,
    });

    return {
      output: JSON.stringify(response),
    };
  }
}
