'use client';

import { ToolProcessor } from '@/types/tool';

// Each entry is a thunk that dynamic-imports exactly one processor module.
// Next.js/Turbopack splits each import() into its own chunk so heavy deps
// (sql-formatter, js-yaml) are only fetched when the matching tool page loads.
const processorLoaders: Record<string, () => Promise<ToolProcessor>> = {
  'json-formatter':           () => import('./json-formatter').then(m => m.jsonFormatterProcessor),
  'json-validator':           () => import('./json-validator').then(m => m.jsonValidatorProcessor),
  'json-minifier':            () => import('./json-minifier').then(m => m.jsonMinifierProcessor),
  'json-diff':                () => import('./json-diff').then(m => m.jsonDiffProcessor),
  'base64-encoder':           () => import('./base64-encoder').then(m => m.base64EncoderProcessor),
  'base64-decoder':           () => import('./base64-decoder').then(m => m.base64DecoderProcessor),
  'url-encoder':              () => import('./url-encoder').then(m => m.urlEncoderProcessor),
  'url-decoder':              () => import('./url-decoder').then(m => m.urlDecoderProcessor),
  'html-encoder':             () => import('./html-encoder').then(m => m.htmlEncoderProcessor),
  'html-decoder':             () => import('./html-decoder').then(m => m.htmlDecoderProcessor),
  'jwt-decoder':              () => import('./jwt-decoder').then(m => m.jwtDecoderProcessor),
  'uuid-generator':           () => import('./uuid-generator').then(m => m.uuidGeneratorProcessor),
  'uuid-validator':           () => import('./uuid-validator').then(m => m.uuidValidatorProcessor),
  'password-generator':       () => import('./password-generator').then(m => m.passwordGeneratorProcessor),
  'unix-timestamp-converter': () => import('./unix-timestamp-converter').then(m => m.unixTimestampConverterProcessor),
  'timestamp-to-date':        () => import('./timestamp-to-date').then(m => m.timestampToDateProcessor),
  'regex-tester':             () => import('./regex-tester').then(m => m.regexTesterProcessor),
  'sql-formatter':            () => import('./sql-formatter').then(m => m.sqlFormatterProcessor),
  'xml-formatter':            () => import('./xml-formatter').then(m => m.xmlFormatterProcessor),
  'yaml-formatter':           () => import('./yaml-formatter').then(m => m.yamlFormatterProcessor),
  'yaml-to-json':             () => import('./yaml-to-json').then(m => m.yamlToJsonProcessor),
  'json-to-csv':              () => import('./json-to-csv').then(m => m.jsonToCsvProcessor),
  'csv-to-json':              () => import('./csv-to-json').then(m => m.csvToJsonProcessor),
  'json-to-yaml':             () => import('./json-to-yaml').then(m => m.jsonToYamlProcessor),
  'json-to-xml':              () => import('./json-to-xml').then(m => m.jsonToXmlProcessor),
  'hash-generator':           () => import('./hash-generator').then(m => m.hashGeneratorProcessor),
  'html-formatter':           () => import('./html-formatter').then(m => m.htmlFormatterProcessor),
  'css-formatter':            () => import('./css-formatter').then(m => m.cssFormatterProcessor),
  'diff-checker':             () => import('./diff-checker').then(m => m.diffCheckerProcessor),
  'markdown-preview':         () => import('./markdown-preview').then(m => m.markdownPreviewProcessor),
  'word-counter':             () => import('./word-counter').then(m => m.wordCounterProcessor),
  'color-picker':             () => import('./color-picker').then(m => m.colorPickerProcessor),
};

export async function getProcessor(toolId: string): Promise<ToolProcessor | undefined> {
  const loader = processorLoaders[toolId];
  if (!loader) return undefined;
  return loader();
}
