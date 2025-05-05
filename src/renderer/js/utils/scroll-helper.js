export function scrollToBottom(elementId) {
  const c = document.getElementById(elementId);
  requestAnimationFrame(() => {
    c.scrollTop = c.scrollHeight;
  });
}