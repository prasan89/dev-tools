import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// A minimal in-process processor to test the abstraction end-to-end
// ---------------------------------------------------------------------------

const echoProcessor: ToolProcessor = {
  inputLabel: 'Input',
  inputPlaceholder: 'Type something…',
  autoProcess: true,
  process(input: ToolInput): ToolResult {
    if (!input.value.trim()) {
      return { error: 'Input is empty' };
    }
    return {
      output: {
        value: input.value,
        type: 'text',
        label: 'Output',
        copyable: true,
        downloadFilename: 'output.txt',
        downloadMime: 'text/plain',
      },
    };
  },
};

const errorProcessor: ToolProcessor = {
  process(): ToolResult {
    throw new Error('Processor crashed');
  },
};

const warningProcessor: ToolProcessor = {
  process(input: ToolInput): ToolResult {
    return {
      output: { value: input.value.toUpperCase(), type: 'text', label: 'Upper' },
      warnings: [{ message: 'Input was converted to uppercase' }],
      meta: { characters: input.value.length },
    };
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ToolProcessor abstraction', () => {
  describe('echoProcessor', () => {
    it('returns the input value in the output', () => {
      const result = echoProcessor.process({ value: 'hello' });
      expect(result.output?.value).toBe('hello');
      expect(result.error).toBeUndefined();
    });

    it('returns an error when input is empty', () => {
      const result = echoProcessor.process({ value: '' });
      expect(result.error).toBeDefined();
      expect(result.output).toBeUndefined();
    });

    it('output has correct type', () => {
      const result = echoProcessor.process({ value: 'test' });
      expect(result.output?.type).toBe('text');
    });

    it('output is copyable', () => {
      const result = echoProcessor.process({ value: 'test' });
      expect(result.output?.copyable).toBe(true);
    });

    it('output has downloadFilename', () => {
      const result = echoProcessor.process({ value: 'test' });
      expect(result.output?.downloadFilename).toBe('output.txt');
    });

    it('has expected metadata fields', () => {
      expect(echoProcessor.inputLabel).toBe('Input');
      expect(echoProcessor.autoProcess).toBe(true);
    });
  });

  describe('error handling', () => {
    it('processor throwing does not escape uncaught (simulate workspace behaviour)', () => {
      let caught: string | undefined;
      try {
        errorProcessor.process({ value: 'x' });
      } catch (err) {
        caught = err instanceof Error ? err.message : String(err);
      }
      expect(caught).toBe('Processor crashed');
    });
  });

  describe('warningProcessor', () => {
    it('returns warnings in result', () => {
      const result = warningProcessor.process({ value: 'hello' });
      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.warnings?.[0].message).toContain('uppercase');
    });

    it('returns meta in result', () => {
      const result = warningProcessor.process({ value: 'hello' });
      expect(result.meta?.characters).toBe(5);
    });

    it('output value is upper-cased', () => {
      const result = warningProcessor.process({ value: 'hello' });
      expect(result.output?.value).toBe('HELLO');
    });
  });
});
