export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Production backend server hosted on Render
      return 'https://devmind-ai-backend.onrender.com';
    }
  }
  return 'http://localhost:8080';
}
