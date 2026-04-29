/**
 * Build a stable CSS selector for an element.
 * Prefers data-spot, then id, then unique class chain, falls back to nth-of-type path.
 */
export function buildSelector(el: Element): string {
  if (!el || !(el instanceof Element)) return "";

  // 1. data-spot attribute is the most stable
  const spot = el.getAttribute("data-spot");
  if (spot) return `[data-spot="${cssEscape(spot)}"]`;

  // 2. id
  if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) {
    if (document.querySelectorAll(`#${el.id}`).length === 1) {
      return `#${el.id}`;
    }
  }

  // 3. Build path up to body, using tag + nth-of-type
  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && node.nodeType === 1 && node !== document.body && depth < 8) {
    let part = node.tagName.toLowerCase();
    const parent = node.parentElement;
    if (parent) {
      const same = Array.from(parent.children).filter((c) => c.tagName === node!.tagName);
      if (same.length > 1) {
        const idx = same.indexOf(node) + 1;
        part += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(part);
    node = parent;
    depth++;
  }
  return parts.join(" > ");
}

function cssEscape(s: string) {
  return s.replace(/"/g, '\\"');
}

/** Pretty-print a label for a target element. */
export function labelForElement(el: Element): string {
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
  if (text && text.length <= 60) return text;
  if (text) return text.slice(0, 60) + "…";
  const tag = el.tagName.toLowerCase();
  const aria = el.getAttribute("aria-label");
  if (aria) return aria;
  return tag;
}
