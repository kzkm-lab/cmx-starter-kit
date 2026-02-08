export function insertTextAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
  cursorOffset = 0
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const before = value.substring(0, start)
  const after = value.substring(end)
  
  const newValue = before + text + after
  
  // Set the new value
  // We need to trigger the regular onChange
  // But since we can't easily trigger the React event, we return the new value
  // and let the caller update the state.
  
  const newCursorPos = start + text.length + cursorOffset
  
  return {
    value: newValue,
    cursorPos: newCursorPos,
  }
}

// Basic implementation to get cursor coordinates
// This is a simplified version. For production, you might want a library like 'textarea-caret'
export function getCursorCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const {
      offsetLeft,
      offsetTop,
      offsetHeight,
      offsetWidth,
      scrollLeft,
      scrollTop,
  } = textarea;

  const { lineHeight, paddingRight, paddingLeft, paddingTop, fontSize, fontFamily } = window.getComputedStyle(textarea);

  const div = document.createElement('div');
  div.id = 'textarea-caret-position-mirror';
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(textarea);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';

  // Copy standard styles
  ['direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
   'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
   'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
   'textDecoration', 'letterSpacing', 'wordSpacing'].forEach(prop => {
      // @ts-ignore
      style[prop] = computed[prop];
  });

  // Firefox needs this
  // @ts-ignore
  if (window.mozInnerScreenX != null) {
      if (computed.overflow != 'hidden') {
           // @ts-ignore
          style.overflow = 'hidden';
      }
  } else {
      style.overflow = 'hidden';
  }

  div.textContent = textarea.value.substring(0, position);
  
  const span = document.createElement('span');
  span.textContent = textarea.value.substring(position) || '.';
  div.appendChild(span);

  const coordinates = {
      top: div.clientHeight + parseInt(computed.borderTopWidth), // Accurate? Not really, using clientHeight of div
      left: span.offsetLeft + parseInt(computed.borderLeftWidth),
      height: parseInt(computed.lineHeight) // approximate
  };

  // We actually need the position of the specific char span
  // Since span is appended, span.offsetTop should be what we want relative to div
  coordinates.top = span.offsetTop + parseInt(computed.borderTopWidth) - textarea.scrollTop;
  coordinates.left = span.offsetLeft + parseInt(computed.borderLeftWidth) - textarea.scrollLeft;

  // Let's rely on a simpler 'getLastLine' approach if this is flaky or use a library.
  // Actually, creating a mirror with exact text up to cursor is the standard way.
  
  // Re-evaluating: span.offsetTop gives top of the span relative to div
  // We need to add textarea's offset relative to viewport if we want absolute page coords?
  // No, the caller will probably want relative to textarea or screen.
  // Let's assume relative to textarea's top-left content box.
  
  document.body.removeChild(div);

  return coordinates;
}

// ============================================
// List Continuation Helpers
// ============================================

export interface ListContinuation {
  /** The prefix to insert (e.g., "- ", "2. ", "- [ ] ") */
  prefix: string
  /** Whether the current line is empty (only has the list marker) */
  isEmptyItem: boolean
  /** The full current line content */
  lineContent: string
  /** Start position of the current line in the value */
  lineStart: number
}

/**
 * Get the current line from cursor position
 */
function getCurrentLine(value: string, cursorPos: number): { lineStart: number; lineEnd: number; content: string } {
  const lineStart = value.lastIndexOf("\n", cursorPos - 1) + 1
  let lineEnd = value.indexOf("\n", cursorPos)
  if (lineEnd === -1) lineEnd = value.length
  return {
    lineStart,
    lineEnd,
    content: value.substring(lineStart, lineEnd)
  }
}

/**
 * Detect if the current line is a list item and what type
 */
export function detectListContinuation(value: string, cursorPos: number): ListContinuation | null {
  const { lineStart, content } = getCurrentLine(value, cursorPos)

  // Unordered list: "- item" or "* item"
  const unorderedMatch = content.match(/^(\s*)([-*])\s(.*)$/)
  if (unorderedMatch) {
    const [, indent, marker, text] = unorderedMatch
    return {
      prefix: `${indent}${marker} `,
      isEmptyItem: text.trim() === "",
      lineContent: content,
      lineStart
    }
  }

  // Ordered list: "1. item", "2. item", etc.
  const orderedMatch = content.match(/^(\s*)(\d+)\.\s(.*)$/)
  if (orderedMatch) {
    const [, indent, num, text] = orderedMatch
    const nextNum = parseInt(num, 10) + 1
    return {
      prefix: `${indent}${nextNum}. `,
      isEmptyItem: text.trim() === "",
      lineContent: content,
      lineStart
    }
  }

  // Checklist: "- [ ] item" or "- [x] item"
  const checklistMatch = content.match(/^(\s*)-\s\[[ x]\]\s(.*)$/)
  if (checklistMatch) {
    const [, indent, text] = checklistMatch
    return {
      prefix: `${indent}- [ ] `,
      isEmptyItem: text.trim() === "",
      lineContent: content,
      lineStart
    }
  }

  // Quote: "> text"
  const quoteMatch = content.match(/^(\s*)>\s(.*)$/)
  if (quoteMatch) {
    const [, indent, text] = quoteMatch
    return {
      prefix: `${indent}> `,
      isEmptyItem: text.trim() === "",
      lineContent: content,
      lineStart
    }
  }

  return null
}

/**
 * Handle Enter key for list continuation
 * Returns the new value and cursor position, or null if no list continuation
 */
export function handleListEnter(
  value: string,
  cursorPos: number
): { newValue: string; newCursor: number } | null {
  const continuation = detectListContinuation(value, cursorPos)
  if (!continuation) return null

  const { prefix, isEmptyItem, lineStart, lineContent } = continuation

  if (isEmptyItem) {
    // Empty list item: remove the marker and exit list mode
    const before = value.substring(0, lineStart)
    const after = value.substring(lineStart + lineContent.length)
    const newValue = before + after
    return {
      newValue,
      newCursor: lineStart
    }
  }

  // Continue the list with a new item
  const before = value.substring(0, cursorPos)
  const after = value.substring(cursorPos)
  const newValue = before + "\n" + prefix + after

  return {
    newValue,
    newCursor: cursorPos + 1 + prefix.length // +1 for newline
  }
}
