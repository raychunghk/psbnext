export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }
  return apiUrl;
};

export const isDevelopment = (): boolean => {
  return process.env.NEXT_PUBLIC_APP_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NEXT_PUBLIC_APP_ENV === 'production';
};

export const getBasePath = (): string => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '/next';
};

// Prefix a public asset path with the configured basePath. Required because this
// Next version does not automatically apply basePath to `next/image` `src`,
// plain `<img>`, or `<link>` hrefs.
export const assetPath = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getBasePath()}${normalized}`;
};