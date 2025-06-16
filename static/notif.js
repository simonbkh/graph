function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  if (type === "error") {
    notification.style.backgroundColor = "red";
  } else {
    notification.style.backgroundColor = "green";
  }
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}
function formatBytes(bytes) {
  if (bytes >= 1_000_000_000) {
    return (bytes / 1_000_000_000).toFixed(2) + " GB";
  } else if (bytes >= 1_000_000) {
    return (bytes / 1_000_000).toFixed(2) + " MB";
  } else if (bytes >= 1_000) {
    return (bytes / 1_000).toFixed(2) + " KB";
  } else {
    return bytes + " B";
  }
}
// const format = (bytes) => (bytes >= 1_000_000_00 ? bytes / 1_000_000_000).toFixed(2) + " GB": bytes >= 1_000_000)
export { showNotification, formatBytes };