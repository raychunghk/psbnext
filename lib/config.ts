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