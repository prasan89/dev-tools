import type { PdfFile } from '@/types/pdf';

// ─── Text object ──────────────────────────────────────────────────────────────

export type TextAlign = 'left' | 'center' | 'right';
export type FontFamily = 'Helvetica' | 'Courier' | 'Times New Roman';

export interface TextObject {
  id: string;
  type: 'text';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: FontFamily;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  opacity: number;
  align: TextAlign;
  zIndex: number;
}

// ─── Image object ─────────────────────────────────────────────────────────────

export interface ImageObject {
  id: string;
  type: 'image';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  rotation: number;
  objectUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  embedBytes?: Uint8Array;
  opacity: number;
  zIndex: number;
}

// ─── Shape objects ────────────────────────────────────────────────────────────

export type ArrowheadStyle = 'none' | 'standard' | 'filled';

export interface RectObject {
  id: string;
  type: 'rect';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  borderColor: string;
  fillColor: string;
  fillOpacity: number;
  borderWidth: number;
  borderOpacity: number;
  opacity: number;
  zIndex: number;
}

export interface EllipseObject {
  id: string;
  type: 'ellipse';
  pageIndex: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  borderColor: string;
  fillColor: string;
  fillOpacity: number;
  borderWidth: number;
  borderOpacity: number;
  opacity: number;
  zIndex: number;
}

export interface LineObject {
  id: string;
  type: 'line';
  pageIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  zIndex: number;
}

export interface ArrowObject {
  id: string;
  type: 'arrow';
  pageIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  arrowhead: ArrowheadStyle;
  zIndex: number;
}

// ─── Annotation objects (M34) ─────────────────────────────────────────────────

export type AnnotationType = 'highlight' | 'underline' | 'strikethrough';

export interface AnnotationObject {
  id: string;
  type: AnnotationType;
  pageIndex: number;
  // Bounding box in PDF coords (bottom-left origin)
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  lineWidth: number; // for underline / strikethrough
  zIndex: number;
}

// ─── Stroke object (M35 — freehand drawing) ────────────────────────────────────

export interface StrokePoint {
  x: number; // PDF coords
  y: number; // PDF coords
}

export interface StrokeObject {
  id: string;
  type: 'stroke';
  pageIndex: number;
  points: StrokePoint[];
  color: string;
  width: number;
  opacity: number;
  zIndex: number;
}

// ─── Whiteout object (M36 — cover/erase) ─────────────────────────────────────

export interface WhiteoutObject {
  id: string;
  type: 'whiteout';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;   // default '#ffffff'
  fillOpacity: number; // default 1
  borderColor: string;
  borderWidth: number;
  opacity: number;
  zIndex: number;
}

export type ShapeObject = RectObject | EllipseObject | LineObject | ArrowObject;
export type EditorObject = TextObject | ImageObject | ShapeObject | AnnotationObject | StrokeObject | WhiteoutObject;

// ─── Editor state ─────────────────────────────────────────────────────────────

export interface EditorState {
  objects: EditorObject[];
  nextZIndex: number;
}

export function createEditorState(): EditorState {
  return { objects: [], nextZIndex: 0 };
}

export function addObject(state: EditorState, obj: Omit<EditorObject, 'zIndex'>): EditorState {
  const zIndex = state.nextZIndex;
  return {
    objects: [...state.objects, { ...obj, zIndex } as EditorObject],
    nextZIndex: zIndex + 1,
  };
}

export function updateObject(state: EditorState, id: string, patch: Partial<EditorObject>): EditorState {
  return {
    ...state,
    objects: state.objects.map((o) => (o.id === id ? { ...o, ...patch } as EditorObject : o)),
  };
}

export function removeObject(state: EditorState, id: string): EditorState {
  return { ...state, objects: state.objects.filter((o) => o.id !== id) };
}

export function bringForward(state: EditorState, id: string): EditorState {
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return state;
  const above = state.objects
    .filter((o) => o.pageIndex === obj.pageIndex && o.zIndex > obj.zIndex)
    .sort((a, b) => a.zIndex - b.zIndex)[0];
  if (!above) return state;
  return {
    ...state,
    objects: state.objects.map((o) =>
      o.id === id ? { ...o, zIndex: above.zIndex } as EditorObject
      : o.id === above.id ? { ...o, zIndex: obj.zIndex } as EditorObject
      : o
    ),
  };
}

export function sendBackward(state: EditorState, id: string): EditorState {
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return state;
  const below = state.objects
    .filter((o) => o.pageIndex === obj.pageIndex && o.zIndex < obj.zIndex)
    .sort((a, b) => b.zIndex - a.zIndex)[0];
  if (!below) return state;
  return {
    ...state,
    objects: state.objects.map((o) =>
      o.id === id ? { ...o, zIndex: below.zIndex } as EditorObject
      : o.id === below.id ? { ...o, zIndex: obj.zIndex } as EditorObject
      : o
    ),
  };
}

export function bringToFront(state: EditorState, id: string): EditorState {
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return state;
  const pageObjs = state.objects.filter((o) => o.pageIndex === obj.pageIndex);
  if (pageObjs.length === 0) return state;
  const maxZ = Math.max(...pageObjs.map((o) => o.zIndex));
  if (obj.zIndex === maxZ) return state;
  const zIndex = state.nextZIndex;
  return {
    objects: state.objects.map((o) => (o.id === id ? { ...o, zIndex } as EditorObject : o)),
    nextZIndex: zIndex + 1,
  };
}

export function sendToBack(state: EditorState, id: string): EditorState {
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return state;
  const pageObjs = state.objects.filter((o) => o.pageIndex === obj.pageIndex);
  if (pageObjs.length === 0) return state;
  const minZ = Math.min(...pageObjs.map((o) => o.zIndex));
  if (obj.zIndex === minZ) return state;
  return {
    ...state,
    objects: state.objects.map((o) =>
      o.id === id ? { ...o, zIndex: minZ - 1 } as EditorObject : o
    ),
  };
}

export function duplicateObject(state: EditorState, id: string): EditorState {
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return state;
  const zIndex = state.nextZIndex;
  let newObj: EditorObject;

  if (obj.type === 'line' || obj.type === 'arrow') {
    const lo = obj as LineObject | ArrowObject;
    newObj = { ...lo, id: crypto.randomUUID(), x1: lo.x1 + 10, y1: lo.y1 - 10, x2: lo.x2 + 10, y2: lo.y2 - 10, zIndex } as EditorObject;
  } else if (obj.type === 'ellipse') {
    const ell = obj as EllipseObject;
    newObj = { ...ell, id: crypto.randomUUID(), cx: ell.cx + 10, cy: ell.cy - 10, zIndex } as EditorObject;
  } else if (obj.type === 'stroke') {
    const st = obj as StrokeObject;
    newObj = { ...st, id: crypto.randomUUID(), points: st.points.map((p) => ({ x: p.x + 10, y: p.y - 10 })), zIndex } as EditorObject;
  } else {
    const boxObj = obj as TextObject | ImageObject | RectObject | AnnotationObject | WhiteoutObject;
    newObj = { ...boxObj, id: crypto.randomUUID(), x: boxObj.x + 10, y: boxObj.y - 10, zIndex } as EditorObject;
  }

  return {
    objects: [...state.objects, newObj],
    nextZIndex: zIndex + 1,
  };
}

// ─── Coordinate conversions ───────────────────────────────────────────────────

export function screenToPdfPoint(
  screenX: number,
  screenY: number,
  scale: number,
  pageHeightPt: number,
): { x: number; y: number } {
  return {
    x: screenX / scale,
    y: pageHeightPt - screenY / scale,
  };
}

export function pdfToScreenPoint(
  pdfX: number,
  pdfY: number,
  scale: number,
  pageHeightPt: number,
): { x: number; y: number } {
  return {
    x: pdfX * scale,
    y: (pageHeightPt - pdfY) * scale,
  };
}

// ─── Hex color to pdf-lib RGB ─────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || '#000000').replace('#', '');
  const expanded = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0');
  const n = parseInt(expanded, 16) || 0;
  return {
    r: ((n >> 16) & 0xff) / 255,
    g: ((n >> 8) & 0xff) / 255,
    b: (n & 0xff) / 255,
  };
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface EditSuccess {
  success: true;
  blob: Blob;
  filename: string;
  pageCount: number;
  sizeBytes: number;
}

export interface EditError {
  success: false;
  error: string;
}

export type EditOutcome = EditSuccess | EditError;

// ─── Arrow drawing helper ─────────────────────────────────────────────────────

function drawArrow(
  page: import('pdf-lib').PDFPage,
  arrow: ArrowObject,
  rgb: (r: number, g: number, b: number) => import('pdf-lib').Color,
): void {
  const { r, g, b } = hexToRgb(arrow.color);
  const col = rgb(r, g, b);

  page.drawLine({
    start: { x: arrow.x1, y: arrow.y1 },
    end: { x: arrow.x2, y: arrow.y2 },
    thickness: arrow.width,
    color: col,
    opacity: arrow.opacity,
  });

  if (arrow.arrowhead === 'none') return;

  const dx = arrow.x2 - arrow.x1;
  const dy = arrow.y2 - arrow.y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;

  const ux = dx / len;
  const uy = dy / len;
  const sz = Math.max(arrow.width * 4, 10);
  const px = -uy;
  const py = ux;

  const tip = { x: arrow.x2, y: arrow.y2 };
  const b1 = { x: tip.x - ux * sz + px * sz * 0.4, y: tip.y - uy * sz + py * sz * 0.4 };
  const b2 = { x: tip.x - ux * sz - px * sz * 0.4, y: tip.y - uy * sz - py * sz * 0.4 };

  page.drawLine({ start: tip, end: b1, thickness: arrow.width, color: col, opacity: arrow.opacity });
  page.drawLine({ start: tip, end: b2, thickness: arrow.width, color: col, opacity: arrow.opacity });
  if (arrow.arrowhead === 'filled') {
    page.drawLine({ start: b1, end: b2, thickness: arrow.width, color: col, opacity: arrow.opacity });
  }
}

// ─── PDF generation ───────────────────────────────────────────────────────────

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

export async function buildEditedPdf(
  pdfFile: PdfFile,
  state: EditorState,
  signal?: AbortSignal,
): Promise<EditOutcome> {
  if (signal?.aborted) return { success: false, error: 'Cancelled.' };

  const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');

  let srcDoc: import('pdf-lib').PDFDocument;
  try {
    const bytes = await readFileAsArrayBuffer(pdfFile.file);
    srcDoc = await PDFDocument.load(bytes);
  } catch (err: unknown) {
    const msg = String(err);
    if (/password|encrypt/i.test(msg)) {
      return { success: false, error: 'This PDF is password-protected. Please unlock it first.' };
    }
    return { success: false, error: `Could not load PDF: ${msg.slice(0, 100)}` };
  }

  if (signal?.aborted) return { success: false, error: 'Cancelled.' };

  const pageCount = srcDoc.getPageCount();

  const objectsByPage = new Map<number, EditorObject[]>();
  for (const obj of state.objects) {
    if (obj.pageIndex < 0 || obj.pageIndex >= pageCount) continue;
    const list = objectsByPage.get(obj.pageIndex) ?? [];
    objectsByPage.set(obj.pageIndex, list);
    list.push(obj);
  }
  for (const [, objs] of objectsByPage) {
    objs.sort((a, b) => a.zIndex - b.zIndex);
  }

  for (const [pageIdx, objs] of objectsByPage) {
    if (signal?.aborted) return { success: false, error: 'Cancelled.' };

    const page = srcDoc.getPage(pageIdx);
    const { height: pageH } = page.getSize();
    void pageH;

    for (const obj of objs) {
      if (obj.type === 'text') {
        const t = obj as TextObject;
        if (!t.text.trim()) continue;

        const { r, g, b } = hexToRgb(t.color);
        let fontName: import('pdf-lib').StandardFonts;
        if (t.fontFamily === 'Courier') {
          fontName = t.bold && t.italic ? StandardFonts.CourierBoldOblique
            : t.bold ? StandardFonts.CourierBold
            : t.italic ? StandardFonts.CourierOblique
            : StandardFonts.Courier;
        } else if (t.fontFamily === 'Times New Roman') {
          fontName = t.bold && t.italic ? StandardFonts.TimesRomanBoldItalic
            : t.bold ? StandardFonts.TimesRomanBold
            : t.italic ? StandardFonts.TimesRomanItalic
            : StandardFonts.TimesRoman;
        } else {
          fontName = t.bold && t.italic ? StandardFonts.HelveticaBoldOblique
            : t.bold ? StandardFonts.HelveticaBold
            : t.italic ? StandardFonts.HelveticaOblique
            : StandardFonts.Helvetica;
        }
        const font = await srcDoc.embedFont(fontName);
        const lines = t.text.split('\n');
        const lineHeight = t.fontSize * 1.2;

        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line) continue;
          let lineX = t.x;
          if (t.align === 'center' || t.align === 'right') {
            try {
              const w = font.widthOfTextAtSize(line, t.fontSize);
              lineX = t.align === 'center' ? t.x + (t.width - w) / 2 : t.x + t.width - w;
            } catch { /* ignore */ }
          }
          const baselineY = t.y + t.height - li * lineHeight - t.fontSize;
          if (baselineY < 0) continue;
          page.drawText(line, {
            x: Math.max(0, lineX),
            y: baselineY,
            font,
            size: t.fontSize,
            color: rgb(r, g, b),
            opacity: t.opacity,
            maxWidth: t.width,
          });
        }

      } else if (obj.type === 'image') {
        const imgObj = obj as ImageObject;
        if (!imgObj.embedBytes || imgObj.embedBytes.length === 0) continue;
        let embeddedImg: import('pdf-lib').PDFImage;
        try {
          embeddedImg = imgObj.mimeType === 'image/jpeg'
            ? await srcDoc.embedJpg(imgObj.embedBytes)
            : await srcDoc.embedPng(imgObj.embedBytes);
        } catch { continue; }
        page.drawImage(embeddedImg, {
          x: imgObj.x,
          y: imgObj.y,
          width: imgObj.width,
          height: imgObj.height,
          opacity: imgObj.opacity,
          rotate: degrees(imgObj.rotation),
        });

      } else if (obj.type === 'rect') {
        const ro = obj as RectObject;
        const { r: br, g: bg, b: bb } = hexToRgb(ro.borderColor);
        const { r: fr, g: fg, b: fb } = hexToRgb(ro.fillColor);
        page.drawRectangle({
          x: ro.x, y: ro.y, width: ro.width, height: ro.height,
          color: ro.fillOpacity > 0 ? rgb(fr, fg, fb) : undefined,
          borderColor: ro.borderWidth > 0 ? rgb(br, bg, bb) : undefined,
          borderWidth: ro.borderWidth,
          opacity: ro.opacity,
          rotate: degrees(ro.rotation),
        });

      } else if (obj.type === 'ellipse') {
        const ell = obj as EllipseObject;
        const { r: br, g: bg, b: bb } = hexToRgb(ell.borderColor);
        const { r: fr, g: fg, b: fb } = hexToRgb(ell.fillColor);
        page.drawEllipse({
          x: ell.cx, y: ell.cy, xScale: ell.rx, yScale: ell.ry,
          color: ell.fillOpacity > 0 ? rgb(fr, fg, fb) : undefined,
          borderColor: ell.borderWidth > 0 ? rgb(br, bg, bb) : undefined,
          borderWidth: ell.borderWidth,
          opacity: ell.opacity,
        });

      } else if (obj.type === 'line') {
        const lo = obj as LineObject;
        const { r, g, b } = hexToRgb(lo.color);
        page.drawLine({ start: { x: lo.x1, y: lo.y1 }, end: { x: lo.x2, y: lo.y2 }, thickness: lo.width, color: rgb(r, g, b), opacity: lo.opacity });

      } else if (obj.type === 'arrow') {
        drawArrow(page, obj as ArrowObject, rgb);

      } else if (
        obj.type === 'highlight' ||
        obj.type === 'underline' ||
        obj.type === 'strikethrough'
      ) {
        const ann = obj as AnnotationObject;
        const { r, g, b } = hexToRgb(ann.color);

        if (ann.type === 'highlight') {
          // Semi-transparent filled rectangle
          page.drawRectangle({
            x: ann.x, y: ann.y, width: ann.width, height: ann.height,
            color: rgb(r, g, b),
            opacity: ann.opacity,
          });
        } else if (ann.type === 'underline') {
          // Line at bottom of box
          page.drawLine({
            start: { x: ann.x, y: ann.y },
            end: { x: ann.x + ann.width, y: ann.y },
            thickness: ann.lineWidth,
            color: rgb(r, g, b),
            opacity: ann.opacity,
          });
        } else if (ann.type === 'strikethrough') {
          // Line at vertical center
          const midY = ann.y + ann.height / 2;
          page.drawLine({
            start: { x: ann.x, y: midY },
            end: { x: ann.x + ann.width, y: midY },
            thickness: ann.lineWidth,
            color: rgb(r, g, b),
            opacity: ann.opacity,
          });
        }

      } else if (obj.type === 'stroke') {
        const st = obj as StrokeObject;
        if (st.points.length < 2) continue;
        const { r, g, b } = hexToRgb(st.color);
        for (let i = 0; i < st.points.length - 1; i++) {
          page.drawLine({
            start: { x: st.points[i].x, y: st.points[i].y },
            end: { x: st.points[i + 1].x, y: st.points[i + 1].y },
            thickness: st.width,
            color: rgb(r, g, b),
            opacity: st.opacity,
          });
        }

      } else if (obj.type === 'whiteout') {
        const wo = obj as WhiteoutObject;
        const { r: fr, g: fg, b: fb } = hexToRgb(wo.fillColor);
        const { r: br, g: bg, b: bb } = hexToRgb(wo.borderColor);
        page.drawRectangle({
          x: wo.x, y: wo.y, width: wo.width, height: wo.height,
          color: rgb(fr, fg, fb),
          opacity: wo.fillOpacity * wo.opacity,
          borderColor: wo.borderWidth > 0 ? rgb(br, bg, bb) : undefined,
          borderWidth: wo.borderWidth,
        });
      }
    }
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await srcDoc.save({ useObjectStreams: true });
  } catch (err: unknown) {
    return { success: false, error: `PDF generation failed: ${String(err).slice(0, 100)}` };
  }

  const baseName = pdfFile.name.replace(/\.pdf$/i, '');
  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  return {
    success: true,
    blob,
    filename: `${baseName}-edited.pdf`,
    pageCount,
    sizeBytes: blob.size,
  };
}
