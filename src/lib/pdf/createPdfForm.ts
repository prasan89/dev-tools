import type { PdfFile, PdfToolResult } from '@/types/pdf';

// ─── Form field types ─────────────────────────────────────────────────────────

export type FormFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature';

export interface FormFieldRect {
  x: number;   // PDF points from left
  y: number;   // PDF points from top (screen coords — flipped for pdf-lib at export)
  width: number;
  height: number;
}

export interface BaseFormField {
  id: string;
  pageIndex: number;
  rect: FormFieldRect;
  label: string;       // display label (not part of PDF, shown in builder UI)
  name: string;        // AcroForm field name
  required: boolean;
  readOnly: boolean;
}

export interface TextFormField extends BaseFormField {
  type: 'text';
  placeholder: string;
  multiline: boolean;
  maxLength?: number;
  defaultValue: string;
  fontSize: number;
}

export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox';
  defaultChecked: boolean;
}

export interface RadioFormField extends BaseFormField {
  type: 'radio';
  groupName: string;
  buttonValue: string;
  defaultSelected: boolean;
}

export interface DropdownFormField extends BaseFormField {
  type: 'dropdown';
  options: string[];   // newline-separated options
  defaultValue: string;
  editable: boolean;   // combo box if true
}

export interface SignatureFormField extends BaseFormField {
  type: 'signature';
}

export type FormField =
  | TextFormField
  | CheckboxFormField
  | RadioFormField
  | DropdownFormField
  | SignatureFormField;

// ─── Builder state ────────────────────────────────────────────────────────────

export interface FormBuilderState {
  pageCount: number;
  pageSizes: Array<{ width: number; height: number }>;  // PDF points per page
  fields: FormField[];
}

export function createBuilderState(
  pageCount: number,
  pageSizes: Array<{ width: number; height: number }>,
): FormBuilderState {
  return { pageCount, pageSizes, fields: [] };
}

export function addField(state: FormBuilderState, field: FormField): FormBuilderState {
  return { ...state, fields: [...state.fields, field] };
}

export function updateField(state: FormBuilderState, id: string, patch: Partial<FormField>): FormBuilderState {
  return {
    ...state,
    fields: state.fields.map((f) => (f.id === id ? { ...f, ...patch } as FormField : f)),
  };
}

export function removeField(state: FormBuilderState, id: string): FormBuilderState {
  return { ...state, fields: state.fields.filter((f) => f.id !== id) };
}

export function moveField(
  state: FormBuilderState,
  id: string,
  rect: Partial<FormFieldRect>,
): FormBuilderState {
  return {
    ...state,
    fields: state.fields.map((f) =>
      f.id === id ? { ...f, rect: { ...f.rect, ...rect } } : f
    ),
  };
}

export function uniqueFieldName(existing: FormField[], type: FormFieldType): string {
  const prefix = type === 'text' ? 'TextField'
    : type === 'checkbox' ? 'CheckBox'
    : type === 'radio' ? 'RadioButton'
    : type === 'dropdown' ? 'Dropdown'
    : 'Signature';
  let n = 1;
  const names = new Set(existing.map((f) => f.name));
  while (names.has(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

// ─── Default field factory ────────────────────────────────────────────────────

export function makeDefaultField(
  type: FormFieldType,
  pageIndex: number,
  x: number,
  y: number,
  existingFields: FormField[],
): FormField {
  const name = uniqueFieldName(existingFields, type);
  const base: BaseFormField = {
    id: crypto.randomUUID(),
    pageIndex,
    rect: defaultRect(type, x, y),
    label: name,
    name,
    required: false,
    readOnly: false,
  };
  switch (type) {
    case 'text':
      return { ...base, type: 'text', placeholder: '', multiline: false, defaultValue: '', fontSize: 11 };
    case 'checkbox':
      return { ...base, type: 'checkbox', defaultChecked: false };
    case 'radio':
      return { ...base, type: 'radio', groupName: 'RadioGroup1', buttonValue: 'Option1', defaultSelected: false };
    case 'dropdown':
      return { ...base, type: 'dropdown', options: ['Option 1', 'Option 2', 'Option 3'], defaultValue: '', editable: false };
    case 'signature':
      return { ...base, type: 'signature', rect: { x, y, width: 180, height: 50 } };
  }
}

function defaultRect(type: FormFieldType, x: number, y: number): FormFieldRect {
  switch (type) {
    case 'text': return { x, y, width: 160, height: 22 };
    case 'checkbox': return { x, y, width: 18, height: 18 };
    case 'radio': return { x, y, width: 18, height: 18 };
    case 'dropdown': return { x, y, width: 140, height: 22 };
    case 'signature': return { x, y, width: 180, height: 50 };
  }
}

// ─── PDF export ───────────────────────────────────────────────────────────────

export async function buildFormPdf(
  pdfFile: PdfFile,
  state: FormBuilderState,
): Promise<PdfToolResult> {
  try {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const form = pdfDoc.getForm();
    await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageCount = pdfDoc.getPageCount();

    for (const field of state.fields) {
      if (field.pageIndex >= pageCount) continue;
      const page = pdfDoc.getPage(field.pageIndex);
      const { height: pageH } = page.getSize();

      // Convert from screen (y=top) to PDF coords (y=bottom)
      const pdfY = pageH - field.rect.y - field.rect.height;
      const pdfRect = {
        x: field.rect.x,
        y: pdfY,
        width: field.rect.width,
        height: field.rect.height,
      };

      try {
        switch (field.type) {
          case 'text': {
            const tf = form.createTextField(field.name);
            tf.addToPage(page, pdfRect);
            if (field.defaultValue) tf.setText(field.defaultValue);
            if (field.multiline) tf.enableMultiline();
            if (field.maxLength) tf.setMaxLength(field.maxLength);
            if (field.required) tf.enableRequired();
            if (field.readOnly) tf.enableReadOnly();
            break;
          }
          case 'checkbox': {
            const cb = form.createCheckBox(field.name);
            cb.addToPage(page, pdfRect);
            if (field.defaultChecked) cb.check();
            if (field.required) cb.enableRequired();
            if (field.readOnly) cb.enableReadOnly();
            break;
          }
          case 'radio': {
            let rg = form.getFieldMaybe(field.groupName);
            if (!rg) {
              rg = form.createRadioGroup(field.groupName);
            }
            const radioGroup = form.getRadioGroup(field.groupName);
            radioGroup.addOptionToPage(field.buttonValue, page, pdfRect);
            if (field.defaultSelected) radioGroup.select(field.buttonValue);
            break;
          }
          case 'dropdown': {
            if (field.editable) {
            // pdf-lib exposes createComboBox but types may lag — cast through unknown
            const combo = (form as unknown as { createComboBox: (name: string) => { addToPage: (page: unknown, r: unknown) => void; addOptions: (opts: string[]) => void; select: (v: string) => void; enableRequired: () => void; enableReadOnly: () => void } }).createComboBox(field.name);
            combo.addToPage(page, pdfRect);
              combo.addOptions(field.options);
              if (field.defaultValue && field.options.includes(field.defaultValue)) {
                combo.select(field.defaultValue);
              }
              if (field.required) combo.enableRequired();
              if (field.readOnly) combo.enableReadOnly();
            } else {
              const dd = form.createDropdown(field.name);
              dd.addToPage(page, pdfRect);
              dd.addOptions(field.options);
              if (field.defaultValue && field.options.includes(field.defaultValue)) {
                dd.select(field.defaultValue);
              }
              if (field.required) dd.enableRequired();
              if (field.readOnly) dd.enableReadOnly();
            }
            break;
          }
          case 'signature': {
            // pdf-lib doesn't have a dedicated createSignatureField — use a text field with a distinguishable name
            const sf = form.createTextField(field.name);
            sf.addToPage(page, pdfRect);
            if (field.readOnly) sf.enableReadOnly();
            break;
          }
        }
      } catch {
        // duplicate field name or unsupported — skip
      }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_form.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to build PDF form' };
  }
}
