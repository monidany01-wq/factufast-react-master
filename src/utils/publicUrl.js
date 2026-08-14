export function getAppBaseUrl() {
  const configuredUrl = (process.env.REACT_APP_PUBLIC_URL || '').replace(/\/+$/, '');

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}
