function showNotification(message, type) {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message || 'Notification';
  notification.classList.add('show');
  notification.style.backgroundColor = type === 'error' ? 'var(--error-color)' : 'var(--success-color)';

  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

function formatBytes(bytes) {
  if (!bytes || bytes < 0) return '0 B';
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(2) + ' GB';
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(2) + ' MB';
  if (bytes >= 1_000) return (bytes / 1_000).toFixed(2) + ' KB';
  return bytes + ' B';
}

export { showNotification, formatBytes };