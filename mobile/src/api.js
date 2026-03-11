// Update this to your local machine's IP address when testing on a physical device
// Example: "http://192.168.1.100:3000/api"
import { Platform } from "react-native";

// Expo go emulator:
// Android Emulator uses 10.0.2.2 to point to host localhost
export const API_BASE_URL = Platform.OS === 'android' ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";
