const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function sanitizeApiBaseUrl() {
  if (typeof rawApiBaseUrl !== 'string') {
    return '';
  }

  const trimmedValue = rawApiBaseUrl.trim().replace(/^['"]|['"]$/g, '');
  return trimmedValue.replace(/\/+$/, '');
}

const sanitizedApiBaseUrl = sanitizeApiBaseUrl();

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!sanitizedApiBaseUrl) {
    return normalizedPath;
  }

  try {
    return new URL(normalizedPath, `${sanitizedApiBaseUrl}/`).toString();
  } catch {
    return normalizedPath;
  }
}

