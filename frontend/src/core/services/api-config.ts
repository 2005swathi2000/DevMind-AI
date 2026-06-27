export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://devmind-ai-backend-44zp.onrender.com';
    }
  }
  return 'http://localhost:8080';
}
