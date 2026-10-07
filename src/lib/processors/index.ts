'use client';

import { ToolProcessor } from '@/types/tool';
import { jsonFormatterProcessor } from './json-formatter';
import { jsonValidatorProcessor } from './json-validator';
import { jsonMinifierProcessor } from './json-minifier';
import { jsonDiffProcessor } from './json-diff';

const processorRegistry: Record<string, ToolProcessor> = {
  'json-formatter': jsonFormatterProcessor,
  'json-validator': jsonValidatorProcessor,
  'json-minifier': jsonMinifierProcessor,
  'json-diff': jsonDiffProcessor,
};

export function getProcessor(toolId: string): ToolProcessor | undefined {
  return processorRegistry[toolId];
}
