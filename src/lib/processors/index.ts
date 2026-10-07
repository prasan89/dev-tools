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
import { jwtDecoderProcessor } from './jwt-decoder';
import { uuidGeneratorProcessor } from './uuid-generator';
import { uuidValidatorProcessor } from './uuid-validator';
import { passwordGeneratorProcessor } from './password-generator';
import { unixTimestampConverterProcessor } from './unix-timestamp-converter';
import { timestampToDateProcessor } from './timestamp-to-date';
import { regexTesterProcessor } from './regex-tester';
import { sqlFormatterProcessor } from './sql-formatter';
import { xmlFormatterProcessor } from './xml-formatter';
import { yamlFormatterProcessor } from './yaml-formatter';
import { yamlToJsonProcessor } from './yaml-to-json';

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
  'jwt-decoder': jwtDecoderProcessor,
  'uuid-generator': uuidGeneratorProcessor,
  'uuid-validator': uuidValidatorProcessor,
  'password-generator': passwordGeneratorProcessor,
  'unix-timestamp-converter': unixTimestampConverterProcessor,
  'timestamp-to-date': timestampToDateProcessor,
  'regex-tester': regexTesterProcessor,
  'sql-formatter': sqlFormatterProcessor,
  'xml-formatter': xmlFormatterProcessor,
  'yaml-formatter': yamlFormatterProcessor,
  'yaml-to-json': yamlToJsonProcessor,
};

export function getProcessor(toolId: string): ToolProcessor | undefined {
  return processorRegistry[toolId];
}


