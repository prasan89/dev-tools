/**
 * M39 — Create/Edit PDF Form Fields tests
 *
 * Tests cover:
 *  - addField / removeField / updateField / moveField state helpers
 *  - uniqueFieldName generation
 *  - makeDefaultField produces correct defaults per type
 *  - buildFormPdf: text, checkbox, radio, dropdown, signature
 *  - buildFormPdf: skips out-of-range page fields
 *  - buildFormPdf: error handling
 *  - layout SEO metadata
 */

import {
  createBuilderState,
  addField,
  updateField,
  removeField,
  moveField,
  makeDefaultField,
  uniqueFieldName,
  buildFormPdf,
} from '../src/lib/pdf/createPdfForm';
import type {
  TextFormField,
  CheckboxFormField,
  RadioFormField,
  DropdownFormField,
  SignatureFormField,
  FormField,
  FormBuilderState,
} from '../src/lib/pdf/createPdfForm';
import type { PdfFile } from '../src/types/pdf';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePdfFile(name = 'template.pdf'): PdfFile {
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

const BASE_RECT = { x: 10, y: 20, width: 160, height: 22 };
const PAGE_SIZES = [{ width: 595, height: 842 }];

function makeTextField(overrides: Partial<TextFormField> = {}): TextFormField {
  return {
    id: 'tf-1',
    type: 'text',
    pageIndex: 0,
    rect: BASE_RECT,
    label: 'FullName',
    name: 'FullName',
    required: false,
    readOnly: false,
    placeholder: '',
    multiline: false,
    defaultValue: '',
    fontSize: 11,
    ...overrides,
  };
}

function makeCheckbox(overrides: Partial<CheckboxFormField> = {}): CheckboxFormField {
  return {
    id: 'cb-1',
    type: 'checkbox',
    pageIndex: 0,
    rect: { x: 10, y: 50, width: 18, height: 18 },
    label: 'Agree',
    name: 'Agree',
    required: false,
    readOnly: false,
    defaultChecked: false,
    ...overrides,
  };
}

function makeRadio(overrides: Partial<RadioFormField> = {}): RadioFormField {
  return {
    id: 'rb-1',
    type: 'radio',
    pageIndex: 0,
    rect: { x: 10, y: 80, width: 18, height: 18 },
    label: 'Gender_Male',
    name: 'Gender_Male',
    groupName: 'Gender',
    buttonValue: 'Male',
    defaultSelected: false,
    required: false,
    readOnly: false,
    ...overrides,
  };
}

function makeDropdown(overrides: Partial<DropdownFormField> = {}): DropdownFormField {
  return {
    id: 'dd-1',
    type: 'dropdown',
    pageIndex: 0,
    rect: { x: 10, y: 110, width: 140, height: 22 },
    label: 'Country',
    name: 'Country',
    options: ['US', 'UK', 'DE'],
    defaultValue: '',
    editable: false,
    required: false,
    readOnly: false,
    ...overrides,
  };
}

// ─── pdf-lib mock ─────────────────────────────────────────────────────────────

const mockCreateTextField = jest.fn().mockReturnValue({
  addToPage: jest.fn(),
  setText: jest.fn(),
  enableMultiline: jest.fn(),
  setMaxLength: jest.fn(),
  enableRequired: jest.fn(),
  enableReadOnly: jest.fn(),
});
const mockCreateCheckBox = jest.fn().mockReturnValue({
  addToPage: jest.fn(),
  check: jest.fn(),
  enableRequired: jest.fn(),
  enableReadOnly: jest.fn(),
});
const mockRadioGroup = {
  addOptionToPage: jest.fn(),
  select: jest.fn(),
  enableRequired: jest.fn(),
};
const mockCreateRadioGroup = jest.fn().mockReturnValue(mockRadioGroup);
const mockGetRadioGroup = jest.fn().mockReturnValue(mockRadioGroup);
const mockGetFieldMaybe = jest.fn().mockReturnValue(null);
const mockCreateDropdown = jest.fn().mockReturnValue({
  addToPage: jest.fn(),
  addOptions: jest.fn(),
  select: jest.fn(),
  enableRequired: jest.fn(),
  enableReadOnly: jest.fn(),
});
const mockCreateComboBox = jest.fn().mockReturnValue({
  addToPage: jest.fn(),
  addOptions: jest.fn(),
  select: jest.fn(),
  enableRequired: jest.fn(),
  enableReadOnly: jest.fn(),
});

const mockForm = {
  createTextField: mockCreateTextField,
  createCheckBox: mockCreateCheckBox,
  createRadioGroup: mockCreateRadioGroup,
  getRadioGroup: mockGetRadioGroup,
  getFieldMaybe: mockGetFieldMaybe,
  createDropdown: mockCreateDropdown,
  createComboBox: mockCreateComboBox,
};

const mockSave = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
const mockGetSize = jest.fn().mockReturnValue({ width: 595, height: 842 });

const mockDoc = {
  getForm: jest.fn().mockReturnValue(mockForm),
  getPage: jest.fn().mockReturnValue({ getSize: mockGetSize }),
  getPageCount: jest.fn().mockReturnValue(1),
  embedFont: jest.fn().mockResolvedValue({}),
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
    StandardFonts: { Helvetica: 'Helvetica' },
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
  mockGetSize.mockReturnValue({ width: 595, height: 842 });
  mockDoc.getPageCount.mockReturnValue(1);
  mockDoc.getPage.mockReturnValue({ getSize: mockGetSize });
  mockForm.createTextField.mockReturnValue({ addToPage: jest.fn(), setText: jest.fn(), enableMultiline: jest.fn(), setMaxLength: jest.fn(), enableRequired: jest.fn(), enableReadOnly: jest.fn() });
  mockForm.createCheckBox.mockReturnValue({ addToPage: jest.fn(), check: jest.fn(), enableRequired: jest.fn(), enableReadOnly: jest.fn() });
  mockForm.createDropdown.mockReturnValue({ addToPage: jest.fn(), addOptions: jest.fn(), select: jest.fn(), enableRequired: jest.fn(), enableReadOnly: jest.fn() });
  mockForm.createComboBox.mockReturnValue({ addToPage: jest.fn(), addOptions: jest.fn(), select: jest.fn(), enableRequired: jest.fn(), enableReadOnly: jest.fn() });
  mockForm.getFieldMaybe.mockReturnValue(null);
  mockForm.createRadioGroup.mockReturnValue(mockRadioGroup);
  mockForm.getRadioGroup.mockReturnValue(mockRadioGroup);
  const pdfLib = jest.requireMock('pdf-lib') as { __resetLoad: () => void };
  pdfLib.__resetLoad();
});

// ─── State: createBuilderState ─────────────────────────────────────────────────

describe('createBuilderState', () => {
  it('initializes with empty fields', () => {
    const s = createBuilderState(2, PAGE_SIZES);
    expect(s.pageCount).toBe(2);
    expect(s.fields).toHaveLength(0);
  });
});

// ─── State: addField ───────────────────────────────────────────────────────────

describe('addField', () => {
  it('appends a field', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField());
    expect(s.fields).toHaveLength(1);
    expect(s.fields[0].type).toBe('text');
  });

  it('does not mutate original state', () => {
    const s = createBuilderState(1, PAGE_SIZES);
    addField(s, makeTextField());
    expect(s.fields).toHaveLength(0);
  });

  it('supports multiple field types', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField());
    s = addField(s, makeCheckbox());
    s = addField(s, makeRadio());
    s = addField(s, makeDropdown());
    expect(s.fields).toHaveLength(4);
    expect(s.fields.map((f) => f.type)).toEqual(['text', 'checkbox', 'radio', 'dropdown']);
  });
});

// ─── State: removeField ────────────────────────────────────────────────────────

describe('removeField', () => {
  it('removes the target field', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField({ id: 'tf-1' }));
    s = addField(s, makeCheckbox({ id: 'cb-1' }));
    s = removeField(s, 'tf-1');
    expect(s.fields).toHaveLength(1);
    expect(s.fields[0].id).toBe('cb-1');
  });

  it('no-op when id not found', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField());
    s = removeField(s, 'nonexistent');
    expect(s.fields).toHaveLength(1);
  });
});

// ─── State: updateField ────────────────────────────────────────────────────────

describe('updateField', () => {
  it('patches the target field', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField({ id: 'tf-1', name: 'Old' }));
    s = updateField(s, 'tf-1', { name: 'New' } as Partial<FormField>);
    expect((s.fields[0] as TextFormField).name).toBe('New');
  });

  it('does not mutate other fields', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField({ id: 'tf-1', name: 'A' }));
    s = addField(s, makeCheckbox({ id: 'cb-1', name: 'B' }));
    s = updateField(s, 'tf-1', { name: 'Updated' } as Partial<FormField>);
    expect(s.fields[1].name).toBe('B');
  });
});

// ─── State: moveField ─────────────────────────────────────────────────────────

describe('moveField', () => {
  it('updates x/y of target field', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField());
    s = moveField(s, 'tf-1', { x: 50, y: 100 });
    expect(s.fields[0].rect.x).toBe(50);
    expect(s.fields[0].rect.y).toBe(100);
  });

  it('updates width/height independently', () => {
    let s = createBuilderState(1, PAGE_SIZES);
    s = addField(s, makeTextField());
    s = moveField(s, 'tf-1', { width: 200, height: 30 });
    expect(s.fields[0].rect.width).toBe(200);
    expect(s.fields[0].rect.height).toBe(30);
    expect(s.fields[0].rect.x).toBe(BASE_RECT.x);
  });
});

// ─── uniqueFieldName ───────────────────────────────────────────────────────────

describe('uniqueFieldName', () => {
  it('generates TextField1 when no text fields exist', () => {
    expect(uniqueFieldName([], 'text')).toBe('TextField1');
  });

  it('increments to avoid duplicate names', () => {
    const fields = [makeTextField({ name: 'TextField1' })];
    expect(uniqueFieldName(fields, 'text')).toBe('TextField2');
  });

  it('generates correct prefix per type', () => {
    expect(uniqueFieldName([], 'checkbox')).toBe('CheckBox1');
    expect(uniqueFieldName([], 'radio')).toBe('RadioButton1');
    expect(uniqueFieldName([], 'dropdown')).toBe('Dropdown1');
    expect(uniqueFieldName([], 'signature')).toBe('Signature1');
  });
});

// ─── makeDefaultField ─────────────────────────────────────────────────────────

describe('makeDefaultField', () => {
  it('creates text field at given coordinates', () => {
    const f = makeDefaultField('text', 0, 50, 100, []);
    expect(f.type).toBe('text');
    expect(f.rect.x).toBe(50);
    expect(f.rect.y).toBe(100);
    expect((f as TextFormField).multiline).toBe(false);
    expect((f as TextFormField).fontSize).toBe(11);
  });

  it('creates checkbox with correct default size', () => {
    const f = makeDefaultField('checkbox', 0, 0, 0, []);
    expect(f.type).toBe('checkbox');
    expect(f.rect.width).toBe(18);
    expect(f.rect.height).toBe(18);
    expect((f as CheckboxFormField).defaultChecked).toBe(false);
  });

  it('creates radio with group name', () => {
    const f = makeDefaultField('radio', 0, 0, 0, []);
    expect(f.type).toBe('radio');
    expect((f as RadioFormField).groupName).toBe('RadioGroup1');
  });

  it('creates dropdown with 3 default options', () => {
    const f = makeDefaultField('dropdown', 0, 0, 0, []);
    expect(f.type).toBe('dropdown');
    expect((f as DropdownFormField).options).toHaveLength(3);
  });

  it('creates signature with larger default rect', () => {
    const f = makeDefaultField('signature', 0, 0, 0, []);
    expect(f.type).toBe('signature');
    expect(f.rect.width).toBeGreaterThan(100);
    expect(f.rect.height).toBeGreaterThan(30);
  });

  it('assigns unique id on each call', () => {
    const a = makeDefaultField('text', 0, 0, 0, []);
    const b = makeDefaultField('text', 0, 0, 0, []);
    expect(a.id).not.toBe(b.id);
  });
});

// ─── buildFormPdf: text ───────────────────────────────────────────────────────

describe('buildFormPdf: text field', () => {
  it('returns success with output blob', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField()] };
    const result = await buildFormPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(result.outputFile).toBeDefined();
    expect(result.outputFile!.filename).toMatch(/_form\.pdf$/);
  });

  it('calls createTextField', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField()] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockForm.createTextField).toHaveBeenCalledWith('FullName');
  });

  it('calls setText for non-empty defaultValue', async () => {
    const tf = mockForm.createTextField.mockReturnValueOnce({
      addToPage: jest.fn(), setText: jest.fn(), enableMultiline: jest.fn(),
      setMaxLength: jest.fn(), enableRequired: jest.fn(), enableReadOnly: jest.fn(),
    });
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField({ defaultValue: 'Alice' })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createTextField.mock.results[0].value;
    expect(instance.setText).toHaveBeenCalledWith('Alice');
  });

  it('calls enableMultiline for multiline text fields', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField({ multiline: true })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createTextField.mock.results[0].value;
    expect(instance.enableMultiline).toHaveBeenCalled();
  });

  it('calls enableRequired for required fields', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField({ required: true })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createTextField.mock.results[0].value;
    expect(instance.enableRequired).toHaveBeenCalled();
  });

  it('filename includes _form suffix', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [] };
    const result = await buildFormPdf(makePdfFile('contract.pdf'), s);
    expect(result.outputFile!.filename).toBe('contract_form.pdf');
  });
});

// ─── buildFormPdf: checkbox ───────────────────────────────────────────────────

describe('buildFormPdf: checkbox', () => {
  it('calls createCheckBox', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeCheckbox()] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockForm.createCheckBox).toHaveBeenCalledWith('Agree');
  });

  it('calls check() for defaultChecked=true', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeCheckbox({ defaultChecked: true })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createCheckBox.mock.results[0].value;
    expect(instance.check).toHaveBeenCalled();
  });

  it('does not call check() for defaultChecked=false', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeCheckbox({ defaultChecked: false })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createCheckBox.mock.results[0].value;
    expect(instance.check).not.toHaveBeenCalled();
  });
});

// ─── buildFormPdf: radio ──────────────────────────────────────────────────────

describe('buildFormPdf: radio', () => {
  it('calls createRadioGroup and addOptionToPage', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeRadio()] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockForm.createRadioGroup).toHaveBeenCalledWith('Gender');
    expect(mockRadioGroup.addOptionToPage).toHaveBeenCalled();
  });

  it('calls select when defaultSelected=true', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeRadio({ defaultSelected: true, buttonValue: 'Male' })] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockRadioGroup.select).toHaveBeenCalledWith('Male');
  });
});

// ─── buildFormPdf: dropdown ───────────────────────────────────────────────────

describe('buildFormPdf: dropdown', () => {
  it('calls createDropdown', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeDropdown()] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockForm.createDropdown).toHaveBeenCalledWith('Country');
    const instance = mockForm.createDropdown.mock.results[0].value;
    expect(instance.addOptions).toHaveBeenCalledWith(['US', 'UK', 'DE']);
  });

  it('calls createComboBox for editable dropdown', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeDropdown({ editable: true })] };
    await buildFormPdf(makePdfFile(), s);
    expect(mockForm.createComboBox).toHaveBeenCalledWith('Country');
  });

  it('selects default value when in options', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeDropdown({ defaultValue: 'UK' })] };
    await buildFormPdf(makePdfFile(), s);
    const instance = mockForm.createDropdown.mock.results[0].value;
    expect(instance.select).toHaveBeenCalledWith('UK');
  });
});

// ─── buildFormPdf: out-of-range page ──────────────────────────────────────────

describe('buildFormPdf: out-of-range page skipped', () => {
  it('skips field on page 5 when doc has 1 page', async () => {
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [makeTextField({ pageIndex: 5 })] };
    const result = await buildFormPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockForm.createTextField).not.toHaveBeenCalled();
  });
});

// ─── buildFormPdf: error handling ─────────────────────────────────────────────

describe('buildFormPdf: error handling', () => {
  it('returns failure when pdf-lib load throws', async () => {
    const pdfLib = jest.requireMock('pdf-lib') as { __throwOnLoad: (m: string) => void };
    pdfLib.__throwOnLoad('corrupt pdf');
    const s: FormBuilderState = { pageCount: 1, pageSizes: PAGE_SIZES, fields: [] };
    const result = await buildFormPdf(makePdfFile(), s);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/corrupt pdf/i);
  });

  it('continues when a single field throws (duplicate name)', async () => {
    mockForm.createTextField.mockImplementationOnce(() => { throw new Error('duplicate name'); });
    const s: FormBuilderState = {
      pageCount: 1,
      pageSizes: PAGE_SIZES,
      fields: [
        makeTextField({ id: 'tf-bad', name: 'Dup' }),
        makeTextField({ id: 'tf-ok', name: 'OtherField' }),
      ],
    };
    const result = await buildFormPdf(makePdfFile(), s);
    expect(result.success).toBe(true);
    expect(mockForm.createTextField).toHaveBeenCalledTimes(2);
  });
});

// ─── Layout SEO ───────────────────────────────────────────────────────────────

describe('create-pdf-form layout metadata', () => {
  it('title contains create PDF form', async () => {
    const mod = await import('../src/app/pdf-tools/create-pdf-form/layout');
    const { metadata } = mod;
    expect(String(metadata.title)).toMatch(/create.+pdf.+form/i);
  });

  it('has form-builder-related keywords', async () => {
    const mod = await import('../src/app/pdf-tools/create-pdf-form/layout');
    const { metadata } = mod;
    const kws = (metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/form fields|acroform|fillable/);
  });
});
