export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/`;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cinematch:cookie-change'));
  }
}

export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cinematch:cookie-change'));
  }
}
