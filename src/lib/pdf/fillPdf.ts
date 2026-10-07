import type { PdfFile, PdfToolResult } from '@/types/pdf';

// ─── AcroForm field types ─────────────────────────────────────────────────────

export type AcroFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'listbox' | 'unknown';

export interface AcroFieldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AcroTextField {
  id: string;
  type: 'text';
  name: string;
  pageIndex: number;
  rect: AcroFieldRect;
  value: string;
  maxLength?: number;
  multiline: boolean;
  readOnly: boolean;
  required: boolean;
}

export interface AcroCheckboxField {
  id: string;
  type: 'checkbox';
  name: string;
  pageIndex: number;
  rect: AcroFieldRect;
  checked: boolean;
  readOnly: boolean;
  required: boolean;
}

export interface AcroRadioField {
  id: string;
  type: 'radio';
  name: string;
  /** Group name — multiple buttons share the same groupName */
  groupName: string;
  pageIndex: number;
  rect: AcroFieldRect;
  /** The export value this button represents */
  buttonValue: string;
  /** Currently selected value in the group */
  selectedValue: string;
  readOnly: boolean;
  required: boolean;
}

export interface AcroDropdownField {
  id: string;
  type: 'dropdown';
  name: string;
  pageIndex: number;
  rect: AcroFieldRect;
  options: string[];
  value: string;
  readOnly: boolean;
  required: boolean;
}

export interface AcroListboxField {
  id: string;
  type: 'listbox';
  name: string;
  pageIndex: number;
  rect: AcroFieldRect;
  options: string[];
  value: string;
  readOnly: boolean;
  required: boolean;
}

export type AcroField =
  | AcroTextField
  | AcroCheckboxField
  | AcroRadioField
  | AcroDropdownField
  | AcroListboxField;

export interface FillFormState {
  fields: AcroField[];
}

// ─── pdfjs AcroForm extraction ────────────────────────────────────────────────

interface PdfjsAnnotation {
  subtype: string;
  fieldType?: string;
  fieldName?: string;
  fieldFlags?: number;
  rect?: number[];
  pageNumber?: number;
  buttonValue?: string;
  fieldValue?: string | string[] | null;
  exportValues?: string | string[];
  options?: Array<{ exportValue: string; displayValue: string }>;
  multiLine?: boolean;
  maxLen?: number;
  readOnly?: boolean;
  required?: boolean;
  radioButton?: boolean;
  checkBox?: boolean;
  hasAppearance?: boolean;
}

function flagBit(flags: number | undefined, bit: number): boolean {
  return ((flags ?? 0) & (1 << (bit - 1))) !== 0;
}

function normalizeRect(rect: number[], pageHeight: number): AcroFieldRect {
  // pdfjs returns [x1, y1_from_bottom, x2, y2_from_bottom] in PDF space
  const [x1, y1, x2, y2] = rect;
  const left = Math.min(x1, x2);
  const bottom = Math.min(y1, y2);
  const right = Math.max(x1, x2);
  const top = Math.max(y1, y2);
  return {
    x: left,
    y: pageHeight - top, // flip to top-left for screen coords
    width: right - left,
    height: top - bottom,
  };
}

export async function extractFormFields(
  pdfFile: PdfFile,
): Promise<{ fields: AcroField[]; pageHeights: number[] }> {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
  }

  const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(pdfFile.file);
  });

  const doc = await pdfjs.getDocument({ data: buf.slice(0), disableAutoFetch: true }).promise;
  const numPages = doc.numPages;
  const pageHeights: number[] = [];
  const fields: AcroField[] = [];

  // radio group tracking: groupName → selectedValue
  const radioGroups = new Map<string, string>();

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: 1, rotation: 0 });
    const pageH = vp.height;
    pageHeights.push(pageH);

    const annotations = (await page.getAnnotations()) as PdfjsAnnotation[];
    for (const ann of annotations) {
      if (ann.subtype !== 'Widget') continue;
      if (!ann.rect || ann.rect.length < 4) continue;
      if (!ann.fieldName) continue;

      const rect = normalizeRect(ann.rect, pageH);
      const pageIndex = p - 1;
      const ft = (ann.fieldType ?? '').toUpperCase();
      const isReadOnly = flagBit(ann.fieldFlags, 1) || !!ann.readOnly;
      const isRequired = flagBit(ann.fieldFlags, 2) || !!ann.required;

      if (ft === 'Tx' || ft === 'TX') {
        fields.push({
          id: crypto.randomUUID(),
          type: 'text',
          name: ann.fieldName,
          pageIndex,
          rect,
          value: typeof ann.fieldValue === 'string' ? ann.fieldValue : '',
          multiline: flagBit(ann.fieldFlags, 13) || !!ann.multiLine,
          maxLength: ann.maxLen,
          readOnly: isReadOnly,
          required: isRequired,
        });
      } else if (ft === 'Btn' || ft === 'BTN') {
        const isRadio = flagBit(ann.fieldFlags, 16) || !!ann.radioButton;
        const isCheckbox = !isRadio && (flagBit(ann.fieldFlags, 15) === false || !!ann.checkBox);
        if (isRadio) {
          const bv = typeof ann.buttonValue === 'string' ? ann.buttonValue : 'On';
          const fv = typeof ann.fieldValue === 'string' ? ann.fieldValue : '';
          if (!radioGroups.has(ann.fieldName)) radioGroups.set(ann.fieldName, fv);
          const selectedValue = radioGroups.get(ann.fieldName) ?? '';
          fields.push({
            id: crypto.randomUUID(),
            type: 'radio',
            name: ann.fieldName,
            groupName: ann.fieldName,
            pageIndex,
            rect,
            buttonValue: bv,
            selectedValue,
            readOnly: isReadOnly,
            required: isRequired,
          });
        } else if (isCheckbox) {
          const fv = typeof ann.fieldValue === 'string' ? ann.fieldValue : '';
          fields.push({
            id: crypto.randomUUID(),
            type: 'checkbox',
            name: ann.fieldName,
            pageIndex,
            rect,
            checked: fv !== '' && fv !== 'Off' && fv !== 'false',
            readOnly: isReadOnly,
            required: isRequired,
          });
        }
      } else if (ft === 'Ch' || ft === 'CH') {
        const opts = (ann.options ?? []).map((o) =>
          typeof o === 'object' ? (o.displayValue || o.exportValue) : String(o)
        );
        const fv = typeof ann.fieldValue === 'string' ? ann.fieldValue : '';
        const isListbox = flagBit(ann.fieldFlags, 22);
        if (isListbox) {
          fields.push({
            id: crypto.randomUUID(),
            type: 'listbox',
            name: ann.fieldName,
            pageIndex,
            rect,
            options: opts,
            value: fv,
            readOnly: isReadOnly,
            required: isRequired,
          });
        } else {
          fields.push({
            id: crypto.randomUUID(),
            type: 'dropdown',
            name: ann.fieldName,
            pageIndex,
            rect,
            options: opts,
            value: fv,
            readOnly: isReadOnly,
            required: isRequired,
          });
        }
      }
    }
  }

  // back-fill selectedValue for all radio buttons now that we've seen all pages
  for (const f of fields) {
    if (f.type === 'radio') {
      f.selectedValue = radioGroups.get(f.groupName) ?? '';
    }
  }

  return { fields, pageHeights };
}

// ─── State helpers ────────────────────────────────────────────────────────────

export function updateFieldValue(
  state: FillFormState,
  id: string,
  value: string | boolean,
): FillFormState {
  return {
    fields: state.fields.map((f) => {
      if (f.id !== id) {
        // for radio: also update selectedValue on sibling buttons in same group
        if (f.type === 'radio' && typeof value === 'string') {
          const target = state.fields.find((x) => x.id === id);
          if (target?.type === 'radio' && target.groupName === f.groupName) {
            return { ...f, selectedValue: value as string };
          }
        }
        return f;
      }
      switch (f.type) {
        case 'text':
          return { ...f, value: typeof value === 'string' ? value : f.value };
        case 'checkbox':
          return { ...f, checked: typeof value === 'boolean' ? value : f.checked };
        case 'radio':
          return { ...f, selectedValue: typeof value === 'string' ? value : f.selectedValue };
        case 'dropdown':
        case 'listbox':
          return { ...f, value: typeof value === 'string' ? value : f.value };
      }
    }),
  };
}

export function setRadioGroup(
  state: FillFormState,
  groupName: string,
  selectedValue: string,
): FillFormState {
  return {
    fields: state.fields.map((f) => {
      if (f.type === 'radio' && f.groupName === groupName) {
        return { ...f, selectedValue };
      }
      return f;
    }),
  };
}

export function countFilled(state: FillFormState): number {
  let n = 0;
  const seenRadioGroups = new Set<string>();
  for (const f of state.fields) {
    switch (f.type) {
      case 'text':
        if (f.value.trim()) n++;
        break;
      case 'checkbox':
        if (f.checked) n++;
        break;
      case 'radio':
        if (!seenRadioGroups.has(f.groupName)) {
          seenRadioGroups.add(f.groupName);
          if (f.selectedValue) n++;
        }
        break;
      case 'dropdown':
      case 'listbox':
        if (f.value) n++;
        break;
    }
  }
  return n;
}

export function totalFieldCount(state: FillFormState): number {
  const seenRadioGroups = new Set<string>();
  let n = 0;
  for (const f of state.fields) {
    if (f.type === 'radio') {
      if (!seenRadioGroups.has(f.groupName)) {
        seenRadioGroups.add(f.groupName);
        n++;
      }
    } else {
      n++;
    }
  }
  return n;
}

// ─── PDF-lib export ───────────────────────────────────────────────────────────

export async function buildFilledPdf(
  pdfFile: PdfFile,
  state: FillFormState,
): Promise<PdfToolResult> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(pdfFile.file);
    });

    const pdfDoc = await PDFDocument.load(buf);
    const form = pdfDoc.getForm();

    // radio group tracking to avoid setting the same group twice
    const radioGroupsDone = new Set<string>();

    for (const field of state.fields) {
      if (field.readOnly) continue;
      try {
        switch (field.type) {
          case 'text': {
            const tf = form.getTextField(field.name);
            tf.setText(field.value);
            break;
          }
          case 'checkbox': {
            const cb = form.getCheckBox(field.name);
            if (field.checked) cb.check();
            else cb.uncheck();
            break;
          }
          case 'radio': {
            if (!radioGroupsDone.has(field.groupName) && field.selectedValue) {
              radioGroupsDone.add(field.groupName);
              const rg = form.getRadioGroup(field.groupName);
              rg.select(field.selectedValue);
            }
            break;
          }
          case 'dropdown': {
            const dd = form.getDropdown(field.name);
            if (field.value && dd.getOptions().includes(field.value)) {
              dd.select(field.value);
            }
            break;
          }
          case 'listbox': {
            const lb = form.getOptionList(field.name);
            if (field.value && lb.getOptions().includes(field.value)) {
              lb.select(field.value);
            }
            break;
          }
        }
      } catch {
        // field may not exist in pdf-lib's form map — skip silently
      }
    }

    // Flatten to make fields non-editable after export (optional — keep interactive)
    // form.flatten(); // intentionally left interactive

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const base = pdfFile.name.replace(/\.pdf$/i, '');
    return {
      success: true,
      outputFile: { blob, filename: `${base}_filled.pdf`, size: blob.size },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fill PDF' };
  }
}
