declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<ConversionResult>;
}
