const API_PATH = '/api2';

export const getBasePath = (): string => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '/next';
};

// The API is reached through Next.js rewrites (see next.config.mjs), which
// proxy `${basePath}/api2/*` to the correct backend for each environment on
// the server side. Returning a relative, same-origin path means the client
// never depends on a build-time env var and works in every environment.
export const getApiUrl = (): string => {
  return `${getBasePath()}${API_PATH}`;
};
