'use client';

import { ToolProcessor } from '@/types/tool';
import { jsonFormatterProcessor } from './json-formatter';
import { jsonValidatorProcessor } from './json-validator';
import { jsonMinifierProcessor } from './json-minifier';
import { jsonDiffProcessor } from './json-diff';
import { base64EncoderProcessor } from './base64-encoder';
import { base64DecoderProcessor } from './base64-decoder';
import { urlEncoderProcessor } from './url-encoder';
import { urlDecoderProcessor } from './url-decoder';
import { htmlEncoderProcessor } from './html-encoder';
import { htmlDecoderProcessor } from './html-decoder';

const processorRegistry: Record<string, ToolProcessor> = {
  'json-formatter': jsonFormatterProcessor,
  'json-validator': jsonValidatorProcessor,
  'json-minifier': jsonMinifierProcessor,
  'json-diff': jsonDiffProcessor,
  'base64-encoder': base64EncoderProcessor,
  'base64-decoder': base64DecoderProcessor,
  'url-encoder': urlEncoderProcessor,
  'url-decoder': urlDecoderProcessor,
  'html-encoder': htmlEncoderProcessor,
  'html-decoder': htmlDecoderProcessor,
};

export function getProcessor(toolId: string): ToolProcessor | undefined {
  return processorRegistry[toolId];
}
