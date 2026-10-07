/**
 * M38 — Fill PDF Forms tests
 *
 * Tests cover:
 *  - updateFieldValue for text fields
 *  - updateFieldValue for checkboxes
 *  - setRadioGroup
 *  - updateFieldValue for dropdown/listbox
 *  - countFilled / totalFieldCount
 *  - buildFilledPdf success
 *  - buildFilledPdf skips readOnly fields
 *  - buildFilledPdf error handling
 *  - layout SEO keywords
 */

import {
  updateFieldValue,
  setRadioGroup,
  countFilled,
  totalFieldCount,
  buildFilledPdf,
} from '../src/lib/pdf/fillPdf';
import type {
  AcroTextField,
  AcroCheckboxField,
  AcroRadioField,
  AcroDropdownField,
  AcroListboxField,
  FillFormState,
} from '../src/lib/pdf/fillPdf';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'form.pdf'): PdfFile {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return {
    id: 'id-test',
    name,
    size: bytes.length,
    file: new File([bytes.buffer as ArrayBuffer], name, { type: 'application/pdf' }),
    pageCount: 1,
    objectUrl: 'blob:test',
    isPasswordProtected: false,
    isCorrupted: false,
    loadedAt: 0,
  };
}

const BASE_RECT = { x: 10, y: 10, width: 100, height: 20 };

function makeTextField(overrides: Partial<AcroTextField> = {}): AcroTextField {
  return {
    id: 'tf-1',
    type: 'text',
    name: 'FullName',
    pageIndex: 0,
    rect: BASE_RECT,
    value: '',
    multiline: false,
    readOnly: false,
    required: false,
    ...overrides,
  };
}

function makeCheckbox(overrides: Partial<AcroCheckboxField> = {}): AcroCheckboxField {
  return {
    id: 'cb-1',
    type: 'checkbox',
    name: 'Agree',
    pageIndex: 0,
    rect: BASE_RECT,
    checked: false,
    readOnly: false,
    required: false,
    ...overrides,
  };
}

function makeRadio(overrides: Partial<AcroRadioField> = {}): AcroRadioField {
  return {
    id: 'rb-1',
    type: 'radio',
    name: 'Gender_1',
    groupName: 'Gender',
    pageIndex: 0,
    rect: BASE_RECT,
    buttonValue: 'Male',
    selectedValue: '',
    readOnly: false,
    required: false,
    ...overrides,
  };
}

function makeDropdown(overrides: Partial<AcroDropdownField> = {}): AcroDropdownField {
  return {
    id: 'dd-1',
    type: 'dropdown',
    name: 'Country',
    pageIndex: 0,
    rect: BASE_RECT,
    options: ['US', 'UK', 'DE'],
    value: '',
    readOnly: false,
    required: false,
    ...overrides,
  };
}

function makeListbox(overrides: Partial<AcroListboxField> = {}): AcroListboxField {
  return {
    id: 'lb-1',
    type: 'listbox',
    name: 'Hobbies',
    pageIndex: 0,
    rect: BASE_RECT,
    options: ['Reading', 'Hiking', 'Coding'],
    value: '',
    readOnly: false,
    required: false,
    ...overrides,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockSetText = jest.fn();
const mockCheck = jest.fn();
const mockUncheck = jest.fn();
const mockRadioSelect = jest.fn();
const mockDropdownSelect = jest.fn();
const mockOptionListSelect = jest.fn();
const mockGetOptions = jest.fn().mockReturnValue(['US', 'UK', 'DE']);
const mockGetOptionsListbox = jest.fn().mockReturnValue(['Reading', 'Hiking', 'Coding']);
const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

const mockForm = {
  getTextField: jest.fn().mockReturnValue({ setText: mockSetText }),
  getCheckBox: jest.fn().mockReturnValue({ check: mockCheck, uncheck: mockUncheck }),
  getRadioGroup: jest.fn().mockReturnValue({ select: mockRadioSelect }),
  getDropdown: jest.fn().mockReturnValue({ select: mockDropdownSelect, getOptions: mockGetOptions }),
  getOptionList: jest.fn().mockReturnValue({ select: mockOptionListSelect, getOptions: mockGetOptionsListbox }),
};

const mockDoc = {
  getForm: jest.fn().mockReturnValue(mockForm),
  save: mockSave,
};

jest.mock('pdf-lib', () => {
  let _throw: string | null = null;
  const PDFDocument = {
    load: jest.fn().mockImplementation(async () => {
      if (_throw) throw new Error(_throw);
      return mockDoc;
    }),
  };
  return {
    PDFDocument,
    rgb: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    __throwOnLoad: (msg: string) => {
      _throw = msg;
      PDFDocument.load = jest.fn().mockRejectedValue(new Error(msg));
    },
    __resetLoad: () => {
      _throw = null;
      PDFDocument.load = jest.fn().mockImplementation(async () => {
        if (_throw) throw new Error(_throw);
        return mockDoc;
      });
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
  mockForm.getTextField.mockReturnValue({ setText: mockSetText });
  mockForm.getCheckBox.mockReturnValue({ check: mockCheck, uncheck: mockUncheck });
  mockForm.getRadioGroup.mockReturnValue({ select: mockRadioSelect });
  mockForm.getDropdown.mockReturnValue({ select: mockDropdownSelect, getOptions: mockGetOptions });
  mockForm.getOptionList.mockReturnValue({ select: mockOptionListSelect, getOptions: mockGetOptionsListbox });
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── updateFieldValue — text ───────────────────────────────────────────────────

describe('updateFieldValue: text field', () => {
  it('sets value on target field', () => {
    const state: FillFormState = { fields: [makeTextField()] };
    const next = updateFieldValue(state, 'tf-1', 'John Doe');
    const f = next.fields[0] as AcroTextField;
    expect(f.value).toBe('John Doe');
  });

  it('does not mutate original state', () => {
    const state: FillFormState = { fields: [makeTextField()] };
    updateFieldValue(state, 'tf-1', 'changed');
    expect((state.fields[0] as AcroTextField).value).toBe('');
  });

  it('leaves other fields unchanged', () => {
    const state: FillFormState = {
      fields: [makeTextField({ id: 'tf-1' }), makeTextField({ id: 'tf-2', name: 'Email' })],
    };
    const next = updateFieldValue(state, 'tf-1', 'hello');
    expect((next.fields[1] as AcroTextField).value).toBe('');
  });

  it('ignores boolean value for text field (no crash)', () => {
    const state: FillFormState = { fields: [makeTextField()] };
    const next = updateFieldValue(state, 'tf-1', true);
    expect((next.fields[0] as AcroTextField).value).toBe('');
  });
});

// ─── updateFieldValue — checkbox ───────────────────────────────────────────────

describe('updateFieldValue: checkbox', () => {
  it('sets checked to true', () => {
    const state: FillFormState = { fields: [makeCheckbox()] };
    const next = updateFieldValue(state, 'cb-1', true);
    expect((next.fields[0] as AcroCheckboxField).checked).toBe(true);
  });

  it('sets checked to false', () => {
    const state: FillFormState = { fields: [makeCheckbox({ checked: true })] };
    const next = updateFieldValue(state, 'cb-1', false);
    expect((next.fields[0] as AcroCheckboxField).checked).toBe(false);
  });
});

// ─── setRadioGroup ─────────────────────────────────────────────────────────────

describe('setRadioGroup', () => {
  it('updates selectedValue on all buttons in the group', () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'rb-1', buttonValue: 'Male', groupName: 'Gender', selectedValue: '' }),
        makeRadio({ id: 'rb-2', buttonValue: 'Female', groupName: 'Gender', selectedValue: '' }),
        makeRadio({ id: 'rb-3', buttonValue: 'A', groupName: 'OtherGroup', selectedValue: '' }),
      ],
    };
    const next = setRadioGroup(state, 'Gender', 'Female');
    expect((next.fields[0] as AcroRadioField).selectedValue).toBe('Female');
    expect((next.fields[1] as AcroRadioField).selectedValue).toBe('Female');
    // Other group unchanged
    expect((next.fields[2] as AcroRadioField).selectedValue).toBe('');
  });
});

// ─── updateFieldValue — dropdown / listbox ─────────────────────────────────────

describe('updateFieldValue: dropdown', () => {
  it('sets value on dropdown', () => {
    const state: FillFormState = { fields: [makeDropdown()] };
    const next = updateFieldValue(state, 'dd-1', 'UK');
    expect((next.fields[0] as AcroDropdownField).value).toBe('UK');
  });
});

describe('updateFieldValue: listbox', () => {
  it('sets value on listbox', () => {
    const state: FillFormState = { fields: [makeListbox()] };
    const next = updateFieldValue(state, 'lb-1', 'Hiking');
    expect((next.fields[0] as AcroListboxField).value).toBe('Hiking');
  });
});

// ─── countFilled / totalFieldCount ────────────────────────────────────────────

describe('countFilled', () => {
  it('returns 0 when nothing filled', () => {
    const state: FillFormState = {
      fields: [makeTextField(), makeCheckbox(), makeDropdown()],
    };
    expect(countFilled(state)).toBe(0);
  });

  it('counts filled text field', () => {
    const state: FillFormState = {
      fields: [makeTextField({ value: 'hello' })],
    };
    expect(countFilled(state)).toBe(1);
  });

  it('counts checked checkbox', () => {
    const state: FillFormState = {
      fields: [makeCheckbox({ checked: true })],
    };
    expect(countFilled(state)).toBe(1);
  });

  it('counts radio group once when selected', () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'rb-1', buttonValue: 'Male', selectedValue: 'Male', groupName: 'Gender' }),
        makeRadio({ id: 'rb-2', buttonValue: 'Female', selectedValue: 'Male', groupName: 'Gender' }),
      ],
    };
    expect(countFilled(state)).toBe(1);
  });

  it('does not count radio group when not selected', () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'rb-1', buttonValue: 'Male', selectedValue: '', groupName: 'Gender' }),
        makeRadio({ id: 'rb-2', buttonValue: 'Female', selectedValue: '', groupName: 'Gender' }),
      ],
    };
    expect(countFilled(state)).toBe(0);
  });

  it('counts filled dropdown', () => {
    const state: FillFormState = {
      fields: [makeDropdown({ value: 'US' })],
    };
    expect(countFilled(state)).toBe(1);
  });
});

describe('totalFieldCount', () => {
  it('counts each field type once', () => {
    const state: FillFormState = {
      fields: [makeTextField(), makeCheckbox(), makeDropdown()],
    };
    expect(totalFieldCount(state)).toBe(3);
  });

  it('counts radio group once regardless of button count', () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'rb-1', buttonValue: 'Male', groupName: 'Gender' }),
        makeRadio({ id: 'rb-2', buttonValue: 'Female', groupName: 'Gender' }),
        makeRadio({ id: 'rb-3', buttonValue: 'Other', groupName: 'Gender' }),
      ],
    };
    expect(totalFieldCount(state)).toBe(1);
  });

  it('counts multiple distinct radio groups correctly', () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'rb-1', groupName: 'G1', buttonValue: 'A' }),
        makeRadio({ id: 'rb-2', groupName: 'G1', buttonValue: 'B' }),
        makeRadio({ id: 'rb-3', groupName: 'G2', buttonValue: 'X' }),
        makeRadio({ id: 'rb-4', groupName: 'G2', buttonValue: 'Y' }),
      ],
    };
    expect(totalFieldCount(state)).toBe(2);
  });
});

// ─── buildFilledPdf ───────────────────────────────────────────────────────────

describe('buildFilledPdf: success', () => {
  it('returns success with output blob', async () => {
    const state: FillFormState = {
      fields: [makeTextField({ value: 'Alice' })],
    };
    const result = await buildFilledPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toMatch(/_filled\.pdf$/);
    expect(result.outputFile!.size).toBeGreaterThan(0);
  });

  it('calls setText for text fields', async () => {
    const state: FillFormState = {
      fields: [makeTextField({ value: 'John' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockSetText).toHaveBeenCalledWith('John');
  });

  it('calls check() for checked checkbox', async () => {
    const state: FillFormState = {
      fields: [makeCheckbox({ checked: true })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockCheck).toHaveBeenCalled();
    expect(mockUncheck).not.toHaveBeenCalled();
  });

  it('calls uncheck() for unchecked checkbox', async () => {
    const state: FillFormState = {
      fields: [makeCheckbox({ checked: false })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockUncheck).toHaveBeenCalled();
  });

  it('calls radio group select for selected radio', async () => {
    const state: FillFormState = {
      fields: [makeRadio({ selectedValue: 'Male', buttonValue: 'Male', groupName: 'Gender' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockRadioSelect).toHaveBeenCalledWith('Male');
  });

  it('does not call radio group select when no value selected', async () => {
    const state: FillFormState = {
      fields: [makeRadio({ selectedValue: '', buttonValue: 'Male', groupName: 'Gender' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockRadioSelect).not.toHaveBeenCalled();
  });

  it('calls dropdown select when value is in options', async () => {
    const state: FillFormState = {
      fields: [makeDropdown({ value: 'UK' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockDropdownSelect).toHaveBeenCalledWith('UK');
  });

  it('does not call dropdown select when value not in options', async () => {
    const state: FillFormState = {
      fields: [makeDropdown({ value: 'ZZ' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockDropdownSelect).not.toHaveBeenCalled();
  });

  it('output filename includes _filled suffix', async () => {
    const state: FillFormState = { fields: [] };
    const result = await buildFilledPdf(makePdfFile('my-contract.pdf'), state);
    expect(result.outputFile!.filename).toBe('my-contract_filled.pdf');
  });
});

describe('buildFilledPdf: readOnly fields skipped', () => {
  it('skips readOnly text field', async () => {
    const state: FillFormState = {
      fields: [makeTextField({ readOnly: true, value: 'skip me' })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockSetText).not.toHaveBeenCalled();
  });

  it('skips readOnly checkbox', async () => {
    const state: FillFormState = {
      fields: [makeCheckbox({ readOnly: true, checked: true })],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockCheck).not.toHaveBeenCalled();
  });
});

describe('buildFilledPdf: radio group set only once per group', () => {
  it('calls radio select exactly once even with 3 buttons', async () => {
    const state: FillFormState = {
      fields: [
        makeRadio({ id: 'r1', buttonValue: 'Male', selectedValue: 'Female', groupName: 'Gender' }),
        makeRadio({ id: 'r2', buttonValue: 'Female', selectedValue: 'Female', groupName: 'Gender' }),
        makeRadio({ id: 'r3', buttonValue: 'Other', selectedValue: 'Female', groupName: 'Gender' }),
      ],
    };
    await buildFilledPdf(makePdfFile(), state);
    expect(mockRadioSelect).toHaveBeenCalledTimes(1);
    expect(mockRadioSelect).toHaveBeenCalledWith('Female');
  });
});

describe('buildFilledPdf: error handling', () => {
  it('returns failure when pdf-lib throws on load', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('bad pdf');
    const state: FillFormState = { fields: [] };
    const result = await buildFilledPdf(makePdfFile(), state);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/bad pdf/i);
  });

  it('continues when a single field lookup throws (field not in form)', async () => {
    mockForm.getTextField.mockImplementationOnce(() => { throw new Error('field not found'); });
    const state: FillFormState = {
      fields: [
        makeTextField({ id: 'tf-bad', name: 'Missing', value: 'x' }),
        makeTextField({ id: 'tf-ok', name: 'FullName', value: 'Alice' }),
      ],
    };
    const result = await buildFilledPdf(makePdfFile(), state);
    expect(result.success).toBe(true);
    // second field still processed
    expect(mockSetText).toHaveBeenCalledWith('Alice');
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('fill-pdf layout metadata', () => {
  it('title contains fill PDF form', async () => {
    const mod = await import('../src/app/pdf-tools/fill-pdf/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/fill.+pdf.+form/i);
  });

  it('has fill-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/fill-pdf/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/fill pdf|acroform|checkbox|dropdown/);
  });
});
