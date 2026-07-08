const sanitizeHTML = (str) => {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

const sanitizeUserInput = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

function createSafeElement(tag, content) {
  const el = document.createElement(tag);
  el.textContent = sanitizeUserInput(content);
  return el;
}
