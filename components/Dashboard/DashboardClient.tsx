"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, subscribeToUserUnreadCount } from "@/firebase";
import { useRouter } from "next/navigation";
import FastConfigurationPopup from "@/components/User/Dashboard/FastConfigurationPopup";
import PremiumGiftPopup from "@/components/User/PremiumGiftPopup";
import PremiumTestPanel from "@/components/Testing/PremiumTestPanel";
import DashboardNavigation from "./DashboardNavigation";
import "./dashboardTheme.css";
import { User } from "@/types";
import DashboardContent from "@/components/Dashboard/DashboardContent/index";
import { setPremiumGiftPopupOpen } from "@/redux/slices/cta";

interface DashboardClientProps {
  user: User | null;
  dashboardData: {
    stats: {
      totalReservations: number;
      completedServices: number;
      pendingReservations: number;
      cancelledReservations: number;
      totalSpent: number;
      averageSpentPerService: number;
      thisMonthReservations: number;
      thisMonthSpent: number;
    };
    recentReservations: any[];
    topServices: any[];
  } | null;
}

export default function DashboardClient({ user, dashboardData }: DashboardClientProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((state: any) => state.user);
  const { premiumGiftPopup } = useSelector((state: any) => state.cta);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showFastConfig, setShowFastConfig] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [topNavHeight, setTopNavHeight] = useState<number>(0);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const clearRedirect = () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        redirectTimer = undefined;
      }
    };

    const scheduleRedirectHome = (delayMs: number) => {
      clearRedirect();
      redirectTimer = setTimeout(() => {
        if (!auth.currentUser && !(user?.uid)) {
          router.replace("/");
        }
      }, delayMs);
    };

    (async () => {
      await auth.authStateReady();
      unsubscribe = onAuthStateChanged(auth, (authUser: any | null) => {
        setFirebaseUser(authUser);
        setAuthChecked(true);

        if (!authUser) {
          // Server already validated `uid` cookie and passed `user` — Firebase can lag
          // behind persistence or token refresh; don't bounce the user off /dashboard.
          if (user?.uid) {
            clearRedirect();
            setIsLoading(false);
            return;
          }
          scheduleRedirectHome(900);
          return;
        }

        clearRedirect();

        const currentUser = reduxUser?.uid ? reduxUser : user || null;

        if (currentUser) {
          setIsLoading(false);

          if (reduxUser?.uid && !reduxUser?.configured) {
            setShowFastConfig(true);
          }
        }
      });
    })();

    return () => {
      clearRedirect();
      unsubscribe?.();
    };
  }, [router, reduxUser, user]);

  // Fallback: If Firebase auth exists but Redux user hasn't loaded after a timeout,
  // use server-provided user and stop loading, or stop loading if we have any user
  useEffect(() => {
    if (authChecked && firebaseUser && isLoading) {
      const timeoutId = setTimeout(() => {
        // If we have Firebase auth, stop loading if we have either Redux user or server user
        // If we have neither after timeout, something went wrong but we should still stop loading
        // to avoid infinite loading state
        const currentUser = reduxUser?.uid ? reduxUser : (user || null);
        if (currentUser || !reduxUser?.uid) {
          setIsLoading(false);
        }
      }, 2000); // Wait 2 seconds for Redux to load

      return () => clearTimeout(timeoutId);
    }
  }, [authChecked, firebaseUser, isLoading, user, reduxUser]);

  // Live unread notifications badge
  useEffect(() => {
    let unsubscribe: any;
    if (reduxUser?.uid) {
      unsubscribe = subscribeToUserUnreadCount(reduxUser?.uid, (count: number) => {
        setNotificationCount(count || 0);
      });
    }
    return () => {
      if (typeof unsubscribe === "function") unsubscribe?.();
    };
  }, [reduxUser?.uid]);

  // Bridge events between global header and dashboard
  useEffect(() => {
    const handleToggleMenu = () => {
      setIsMobileMenuOpen((prev: boolean) => !prev);
    };
    const handleSetTab = (event: any) => {
      try {
        const nextTab = event?.detail as string;
        if (typeof nextTab === "string") {
          setActiveTab(nextTab);
        }
      } catch (e) {
        // noop
      }
    };

    window.addEventListener("dashboard:toggle-menu", handleToggleMenu);
    window.addEventListener("dashboard:set-tab", handleSetTab);
    const handleTopHeight = (e: any) => {
      const h = e?.detail as number;
      if (typeof h === "number") setTopNavHeight(h);
    };
    window.addEventListener("dashboard:top-nav-height", handleTopHeight);

    return () => {
      window.removeEventListener("dashboard:toggle-menu", handleToggleMenu);
      window.removeEventListener("dashboard:set-tab", handleSetTab);
      window.removeEventListener("dashboard:top-nav-height", handleTopHeight);
    };
  }, []);

  // Notify global header about current dashboard menu state
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("dashboard:menu-state", { detail: isMobileMenuOpen as boolean })
      );
    } catch (e) {
      // noop
    }
  }, [isMobileMenuOpen]);

  // Share live notification count with global header
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("dashboard:notification-count", {
          detail: notificationCount as number,
        })
      );
    } catch (e) {
      // noop
    }
  }, [notificationCount]);

  const getStatusColor = (status: "confirmed" | "pending" | "cancelled" | "completed" | "unknown") => {
    switch (status) {
            case "confirmed":
        return "bg-success-100 text-success-800 border-success-200";
      case "pending":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getStatusText = (status: "confirmed" | "pending" | "cancelled" | "completed" | "unknown") => {
    switch (status) {
      case "confirmed":
        return "Potwierdzona";
      case "pending":
        return "Oczekująca";
      case "cancelled":
        return "Anulowana";
      case "completed":
        return "Ukończona";
      default:
        return "Nieznany";
    }
  };

  // Determine the current user to use (Redux > Server > null)
  const currentUser = reduxUser?.uid ? reduxUser : (user || null);
  
  // If still loading and we don't have any user data yet, show loading
  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-neutral-600 text-sm">Ładowanie dashboardu...</p>
        </div>
      </div>
    );
  }

  // Safety check: If we're not loading but still don't have a user, something went wrong
  // This shouldn't happen if auth is working correctly, but handle it gracefully
  if (!currentUser && authChecked) {
    // If Firebase auth exists but no user data, wait a bit more or redirect
    if (firebaseUser) {
      // Firebase auth exists but user data not loaded - wait a bit more
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-neutral-600 text-sm">Ładowanie danych użytkownika...</p>
          </div>
        </div>
      );
    }
    // No Firebase auth - should have been redirected, but handle it anyway
    return null;
  }

  // If we have a user but no dashboard data, we can still render (dashboardData might be null)
  // The DashboardContent component should handle null dashboardData gracefully

  return (
    <div className="relative w-full min-h-screen">
      {/* Fast Configuration Popup */}
      {showFastConfig && (
        <FastConfigurationPopup
          isOpen={showFastConfig}
          onClose={() => setShowFastConfig(false)}
        />
      )}

      {/* Premium Gift Popup */}
      <PremiumGiftPopup
        isOpen={premiumGiftPopup}
        onClose={() => dispatch(setPremiumGiftPopupOpen(false))}
      />

      {/* Testing Panel */}
      <PremiumTestPanel />

      <div className="w-full">
        <div>
          <main>
            {/* Fixed top navigation for all screen sizes */}
            <div className="fixed top-0 left-0 right-0 z-50">
              <DashboardNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                notificationCount={notificationCount}
                user={currentUser}
              />
            </div>
            
            {/* Content with top padding */}
            <div
              style={{
                paddingTop: topNavHeight
                  ? Math.max(0, topNavHeight - 8)
                  : undefined,
              }}
            >
              <DashboardContent
                setActiveTab={setActiveTab}
                activeTab={activeTab}
                user={currentUser}
                firebaseUser={firebaseUser}
                dashboardData={dashboardData}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
