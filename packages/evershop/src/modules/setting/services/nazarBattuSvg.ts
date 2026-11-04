/**
 * Keep a storefront nazar battu to one small graphic.
 * The saved value is rebuilt from an allowlist, so a pasted file cannot carry
 * a script, a link, a style, or an embedded document.
 */
const MAX_LENGTH = 2048;
const MAX_TAGS = 40;

const TAGS = new Set([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon'
]);

const CONTAINERS = new Set(['svg', 'g']);

const ATTRS: Record<string, string> = {
  viewbox: 'viewBox',
  fill: 'fill',
  stroke: 'stroke',
  'stroke-width': 'stroke-width',
  'stroke-linecap': 'stroke-linecap',
  'stroke-linejoin': 'stroke-linejoin',
  'fill-rule': 'fill-rule',
  'clip-rule': 'clip-rule',
  d: 'd',
  cx: 'cx',
  cy: 'cy',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  x: 'x',
  y: 'y',
  x1: 'x1',
  y1: 'y1',
  x2: 'x2',
  y2: 'y2',
  width: 'width',
  height: 'height',
  points: 'points',
  opacity: 'opacity',
  transform: 'transform',
  xmlns: 'xmlns'
};

const COLOR =
  /^(?:none|transparent|currentColor|#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20})$/;
const PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;
const LINECAP = /^(?:round|butt|square)$/;
const LINEJOIN = /^(?:round|miter|bevel)$/;
const FILLRULE = /^(?:nonzero|evenodd)$/;

function isNumber(value: string, max: number): boolean {
  if (!/^-?\d{1,4}(?:\.\d{1,4})?$/.test(value)) {
    return false;
  }
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= max;
}

function isTransform(value: string): boolean {
  if (value.length > 80) {
    return false;
  }
  const calls = value.trim().split(/\)\s+(?=[A-Za-z])/);
  if (calls.length < 1 || calls.length > 3) {
    return false;
  }
  return calls.every((call) => {
    const fn = call.trim();
    return (
      /^(?:translate|scale)\(\s*-?\d{1,4}(?:\.\d{1,3})?(?:[\s,]+-?\d{1,4}(?:\.\d{1,3})?)?\s*\)$/.test(
        fn
      ) ||
      /^rotate\(\s*-?\d{1,4}(?:\.\d{1,3})?(?:[\s,]+-?\d{1,4}(?:\.\d{1,3})?){0,2}\s*\)$/.test(
        fn
      ) ||
      /^skew[XY]\(\s*-?\d{1,4}(?:\.\d{1,3})?\s*\)$/.test(fn)
    );
  });
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Empty string drops the attribute. Null rejects the whole graphic. */
function safeAttr(tag: string, name: string, value: string): string | null {
  const canonical = ATTRS[name];
  if (!canonical) {
    return null;
  }
  if (/[&<>]/.test(value)) {
    return null;
  }
  if (canonical === 'xmlns') {
    return value === 'http://www.w3.org/2000/svg'
      ? ` xmlns="${value}"`
      : null;
  }
  if (canonical === 'viewBox') {
    return /^-?\d{1,4}(?:\.\d{1,4})?(?:\s+-?\d{1,4}(?:\.\d{1,4})?){3}$/.test(
      value
    )
      ? ` viewBox="${value}"`
      : null;
  }
  if ((canonical === 'width' || canonical === 'height') && tag === 'svg') {
    return '';
  }
  if (canonical === 'fill' || canonical === 'stroke') {
    return COLOR.test(value) ? ` ${canonical}="${value}"` : null;
  }
  if (canonical === 'opacity') {
    return isNumber(value, 1) && Number(value) >= 0
      ? ` opacity="${value}"`
      : null;
  }
  if (canonical === 'stroke-width') {
    return isNumber(value, 40) ? ` stroke-width="${value}"` : null;
  }
  if (canonical === 'd') {
    return value.length <= 1500 && PATH.test(value)
      ? ` d="${escapeAttr(value)}"`
      : null;
  }
  if (canonical === 'points') {
    return value.length <= 500 &&
      /^-?\d{1,4}(?:\.\d{1,4})?(?:[\s,]+-?\d{1,4}(?:\.\d{1,4})?)+$/.test(value)
      ? ` points="${value}"`
      : null;
  }
  if (canonical === 'transform') {
    return isTransform(value) ? ` transform="${value}"` : null;
  }
  if (canonical === 'stroke-linecap') {
    return LINECAP.test(value) ? ` stroke-linecap="${value}"` : null;
  }
  if (canonical === 'stroke-linejoin') {
    return LINEJOIN.test(value) ? ` stroke-linejoin="${value}"` : null;
  }
  if (canonical === 'fill-rule' || canonical === 'clip-rule') {
    return FILLRULE.test(value) ? ` ${canonical}="${value}"` : null;
  }
  return isNumber(value, 4000) ? ` ${canonical}="${value}"` : null;
}

function readAttrs(tag: string, source: string): string | null {
  let cursor = 0;
  let attrs = '';
  let hasViewBox = false;
  let hasXmlns = false;
  while (cursor < source.length) {
    while (cursor < source.length && /\s/.test(source[cursor])) {
      cursor += 1;
    }
    if (cursor >= source.length) {
      break;
    }
    const match =
      /^([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(
        source.slice(cursor)
      );
    if (!match) {
      return null;
    }
    const rendered = safeAttr(tag, match[1].toLowerCase(), match[2] ?? match[3] ?? '');
    if (rendered === null) {
      return null;
    }
    if (match[1].toLowerCase() === 'viewbox') {
      hasViewBox = true;
    }
    if (match[1].toLowerCase() === 'xmlns') {
      hasXmlns = true;
    }
    attrs += rendered;
    cursor += match[0].length;
  }
  if (tag === 'svg' && !hasViewBox) {
    return null;
  }
  if (tag === 'svg' && !hasXmlns) {
    attrs = ` xmlns="http://www.w3.org/2000/svg"${attrs}`;
  }
  return attrs;
}

/**
 * Return a rebuilt SVG, or null when the input is empty or not a small
 * shape-only graphic. Callers treat null as "use the built-in charm".
 */
export function sanitizeNazarBattuSvg(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }
  const source = input.trim();
  if (!source) {
    return null;
  }
  if (source.length > MAX_LENGTH) {
    return null;
  }
  if (/<!--|<!\[CDATA\[|<!DOCTYPE|<\?|[\u0000-\u0008]/.test(source)) {
    return null;
  }

  const out: string[] = [];
  const stack: string[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    if (/\s/.test(source[cursor])) {
      cursor += 1;
      continue;
    }
    if (source[cursor] !== '<') {
      return null;
    }
    const end = source.indexOf('>', cursor);
    if (end === -1) {
      return null;
    }
    const raw = source.slice(cursor + 1, end).trim();
    cursor = end + 1;
    if (!raw || raw.startsWith('!') || raw.startsWith('?')) {
      return null;
    }
    const closing = raw.startsWith('/');
    const selfClosing = /\/$/.test(raw);
    const body = (
      closing ? raw.slice(1) : selfClosing ? raw.slice(0, -1) : raw
    ).trim();
    const space = body.search(/\s/);
    const name = (space === -1 ? body : body.slice(0, space)).toLowerCase();
    const attrSource = space === -1 ? '' : body.slice(space);
    if (!TAGS.has(name)) {
      return null;
    }
    if (closing) {
      if (attrSource.trim() || selfClosing || stack.pop() !== name) {
        return null;
      }
      out.push(`</${name}>`);
      continue;
    }
    if (stack.length === 0 && (name !== 'svg' || out.length > 0)) {
      return null;
    }
    const attrs = readAttrs(name, attrSource);
    if (attrs === null) {
      return null;
    }
    if (selfClosing && CONTAINERS.has(name)) {
      out.push(`<${name}${attrs}></${name}>`);
    } else if (selfClosing) {
      out.push(`<${name}${attrs}/>`);
    } else {
      out.push(`<${name}${attrs}>`);
      stack.push(name);
    }
    if (out.length > MAX_TAGS) {
      return null;
    }
  }
  if (stack.length !== 0 || out.length === 0 || !out[0].startsWith('<svg')) {
    return null;
  }
  const svg = out.join('');
  return svg.endsWith('</svg>') ? svg : null;
}
