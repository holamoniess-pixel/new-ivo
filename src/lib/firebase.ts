import { initializeApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAjNVjDD3dmHrIK9PQItvQrYUpEZ3Rk7yg",
  authDomain: "webbased-projects.firebaseapp.com",
  projectId: "webbased-projects",
  storageBucket: "webbased-projects.firebasestorage.app",
  messagingSenderId: "922007308614",
  appId: "1:922007308614:web:f3eae13125a10f9221fd47",
};

// Initialize Firebase only once
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Messaging is only available in browser environments that support it
export const messaging =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window
    ? getMessaging(app)
    : null;

const VAPID_KEY =
  "BK8s3ZXsao4vrQih08clNg9E7GSIeynQv0sAxPoFyFhHHvc1VL6UDsw-7YVTrWp7-HSKakS71RM6pqvlRp1Soxo";

/**
 * Request notification permission, register SW, get FCM token,
 * and POST it to the backend.
 */
export async function initFCM(
  postTokenToBackend: (token: string) => Promise<void>
): Promise<boolean> {
  // Guard: FCM requires a supported browser environment
  if (!messaging) {
    console.warn("[FCM] Messaging not supported in this environment");
    return false;
  }

  // Guard: Safari on iOS requires a user gesture before requesting permission.
  // We still attempt it here — callers should ensure this runs after a tap/click.
  if (!("Notification" in window)) {
    console.warn("[FCM] Notifications API not available");
    return false;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied");
      return false;
    }

    // Register (or reuse) the service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Wait for the SW to be active before getting a token
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.info("[FCM] Token obtained:", token.slice(0, 20) + "...");
      await postTokenToBackend(token);
      return true;
    } else {
      console.warn("[FCM] No token returned — check VAPID key and SW scope");
      return false;
    }
  } catch (err) {
    console.error("[FCM] Init failed:", err);
    return false;
  }
}

/**
 * Listen for foreground messages and call the provided handler.
 */
export function onForegroundMessage(
  handler: (payload: MessagePayload) => void
): () => void {
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}

export default app;