/** Whether a key event comes from a field the user is typing in, where bare letter shortcuts must not fire. */
export function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement
    && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}
