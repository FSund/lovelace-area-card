import { html } from 'lit';
import { HomeAssistantExt } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function evalTemplate(entity: string | null, template: string, hass: HomeAssistantExt): any {
  const trimmed = template.trim();
  if (!(trimmed.startsWith('${') && trimmed.endsWith('}'))) {
    return template;
  }
  let func = trimmed.slice(2, -1);
  if (!func.toLocaleLowerCase().startsWith('return')) {
    func = `return ${func}`;
  }

  try {
    return new Function('hass', 'state', 'html', `'use strict'; ${func}`).call(
      null,
      hass,
      entity != null ? hass.states[entity].state : null,
      html,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const funcTrimmed = func.length <= 100 ? func.trim() : `${func.substring(0, 98)}...`;
    e.message = `${e.name}: ${e.message} in '${funcTrimmed}'`;
    e.name = 'MinimalistAreaCardJSTemplateError';
    throw e;
  }
}
