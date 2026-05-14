export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function setCookie(name, value, days = 365, options = {}) {
  if (typeof document === 'undefined') return;
  const { path = '/', secure = false, sameSite = 'Lax' } = options;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookieStr = `${name}=${value};expires=${expires};path=${path}`;
  if (secure) cookieStr += ';secure';
  if (sameSite) cookieStr += `;samesite=${sameSite}`;
  document.cookie = cookieStr;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cinematch:cookie-change'));
  }
}

export function removeCookie(name, options = {}) {
  if (typeof document === 'undefined') return;
  const { secure = false, path = '/' } = options;
  let cookieStr = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
  if (secure) cookieStr += ';secure';
  document.cookie = cookieStr;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cinematch:cookie-change'));
  }
}
