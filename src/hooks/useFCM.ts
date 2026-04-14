import { useEffect, useRef } from "react";
import { initFCM, onForegroundMessage } from "@/lib/firebase";
import { notificationApi } from "@/lib/api";

// ── iOS helpers ───────────────────────────────────────────────────────────────
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
}

function isInStandaloneMode(): boolean {
  return (window.navigator as any).standalone === true;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFCM(isAuthenticated: boolean) {
  const initialized = useRef(false);

  useEffect(() => {
    // Reset when user logs out so FCM re-initialises on next login
    if (!isAuthenticated) {
      initialized.current = false;
      return;
    }

    if (initialized.current) return;

    // Basic environment checks
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      console.warn("[FCM] Push not supported on this device/browser");
      return;
    }

    // iOS only supports push when running as a PWA from the Home Screen
    if (isIOS() && !isInStandaloneMode()) {
      console.warn(
        "[FCM] iOS detected but not running as PWA — skipping push setup. " +
          "User must add the app to their Home Screen via Safari."
      );
      return;
    }

    let unsubscribeForeground: (() => void) | undefined;

    async function setup() {
      try {
        const success = await initFCM(async (token) => {
          await notificationApi.registerFcmToken(token);
          console.info("[FCM] Token registered with backend");
        });

        // Only continue if token was obtained successfully
        if (!success) return;

        initialized.current = true;

        unsubscribeForeground = onForegroundMessage((payload) => {
          console.info("[FCM] Foreground message received:", payload);

          // Refresh navbar notification badge if exposed globally
          (window as any).__refreshNotifBadge?.();

          // Use the SW to show the notification — this works on both
          // focused and unfocused tabs, and on Android Chrome.
          // `new Notification()` is blocked on focused tabs in many browsers
          // and is completely unsupported on iOS.
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(
                payload.notification?.title ?? "New notification",
                {
                  body: payload.notification?.body ?? "",
                  icon: "/onet-logo.jpeg",
                  badge: "/onet-logo.jpeg",
                  data: { url: "/notifications" },
                  // ✅ Cast to fix TS2353 — vibrate is valid at runtime
                  // but missing from TypeScript's NotificationOptions type
                  vibrate: [200, 100, 200],
                } as NotificationOptions & { vibrate?: number[] }
              );
            });
          }
        });
      } catch (err) {
        console.error("[FCM] Setup error:", err);
      }
    }

    setup();

    return () => {
      unsubscribeForeground?.();
    };
  }, [isAuthenticated]);
}