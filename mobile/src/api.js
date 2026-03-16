// API base URL — uses LAN IP so physical devices on same Wi-Fi can connect
// Change 192.168.29.236 to your computer's local IP if it changes
export const API_BASE_URL = 'http://192.168.29.236:3000/api';

export const apiFetch = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  return res;
};
