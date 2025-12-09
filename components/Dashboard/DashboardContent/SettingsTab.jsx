"use client";
import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaCheck, FaTimes, FaBell, FaCog, FaCrown, FaCheckCircle, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import Image from "next/image";
import { requestNotificationPermission, hasNotificationPermission, showNotification } from "@/utils/pushNotifications";
import { toast } from "react-toastify";

export default function SettingsTab({
  user,
  firebaseUser,
  editing,
  onEditingChange,
  formValues,
  onFormValuesChange,
  onSaveField,
  metaDraft,
  onMetaDraftChange,
  onSaveMetadata,
  getSafeSettings,
  onToggleSetting,
}) {
  const [editingSeo, setEditingSeo] = useState({
    title: false,
    description: false,
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [pushNotificationPermission, setPushNotificationPermission] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    setPushNotificationPermission(hasNotificationPermission());
  }, []);

  const isSubscribed = Boolean(
    user?.subscription?.status === "active" ||
    user?.premiumActive ||
    user?.active
  );

  // Check if user is on paid premium (has customerId) vs freemium (no customerId)
  const isPaidPremium = Boolean(user?.customerId);
  const isFreemium = isSubscribed && !isPaidPremium;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/stripe/subscription`, {
        method: "POST",
        body: JSON.stringify({
          uid: user?.uid,
          email: user?.email || firebaseUser?.email,
          successRedirect: `${window.location.origin}/success`,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = data.url;
      } else {
        console.error(data.error);
        setIsSubscribing(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/stripe/customer-portal`, {
        method: "POST",
        body: JSON.stringify({ uid: user?.uid }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Customer portal response:", data);
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Nie udało się otworzyć portalu klienta");
        console.error("Customer portal error:", data.error);
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Wystąpił błąd podczas otwierania portalu klienta");
    }
  };

  const handlePushNotificationToggle = async () => {
    const currentSetting = getSafeSettings(user).pushNotifications;
    
    // If enabling, request permission first
    if (!currentSetting) {
      setRequestingPermission(true);
      const granted = await requestNotificationPermission();
      setRequestingPermission(false);
      
      if (!granted) {
        toast.error("Aby otrzymywać powiadomienia push, musisz zezwolić na powiadomienia w przeglądarce", {
          autoClose: 5000,
        });
        return;
      }
      
      setPushNotificationPermission(true);
      toast.success("Powiadomienia push zostały włączone!");
    }
    
    // Toggle the setting
    onToggleSetting("pushNotifications");
  };

  // Calculate days remaining if subscribed
  const getDaysRemaining = () => {
    if (user?.subscription?.currentPeriodEnd) {
      const endDate = new Date(user.subscription.currentPeriodEnd * 1000);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return null;
  };

  // Calculate progress bar percentage for freemium
  const getProgressPercentage = () => {
    if (!user?.subscription?.currentPeriodEnd) return null;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const periodEnd = user.subscription.currentPeriodEnd;
    const totalDays = 30; // 30-day freemium period
    const periodStart = periodEnd - (totalDays * 24 * 60 * 60);
    const totalPeriod = periodEnd - periodStart;
    const timeRemaining = Math.max(0, periodEnd - currentTime);
    const percentage = Math.max(0, Math.min(100, (timeRemaining / totalPeriod) * 100));
    
    return percentage;
  };

  const daysRemaining = getDaysRemaining();
  const progressPercentage = getProgressPercentage();

  // Determine subscription status and get next payment info
  const getSubscriptionStatus = () => {
    if (!isSubscribed || !user?.subscription) {
      return null;
    }

    const subscriptionStatus = user.subscription.status;
    const cancelAtPeriodEnd = user.subscription.cancelAtPeriodEnd;
    const currentPeriodEnd = user.subscription.currentPeriodEnd;
    
    // Check if period has expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isPeriodExpired = currentPeriodEnd && currentPeriodEnd < currentTime;

    // Check if cancellation is scheduled (check for truthy value)
    const isCancelling = cancelAtPeriodEnd === true || cancelAtPeriodEnd === "true";

    // Determine status - check cancellation first
    if (subscriptionStatus === "canceled" || isPeriodExpired) {
      return {
        status: "cancelled",
        text: "Anulowana",
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    } else if (isCancelling && (subscriptionStatus === "active" || subscriptionStatus === "trialing")) {
      // Subscription is scheduled to cancel but still active
      return {
        status: "cancelling",
        text: "W trakcie anulowania",
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      return {
        status: "active",
        text: "Subskrypcja aktywna",
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }

    return null;
  };

  const getNextPaymentDate = () => {
    if (!user?.subscription?.currentPeriodEnd) return null;
    const date = new Date(user.subscription.currentPeriodEnd * 1000);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const subscriptionStatusInfo = getSubscriptionStatus();
  const nextPaymentDate = getNextPaymentDate();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Premium Subscription Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-xl p-4 md:p-6 border-2 border-blue-200 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left side - Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <FaCrown className="text-white text-xl md:text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Naily Premium
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    30-dniowa subskrypcja miesięczna
                  </p>
                </div>
              </div>
              
              {isSubscribed ? (
                <div className={`mt-4 p-4 rounded-lg border ${subscriptionStatusInfo?.bgColor || "bg-gray-50"} ${subscriptionStatusInfo?.borderColor || "border-gray-200"}`}>
                  {/* Status with colored icon */}
                  {subscriptionStatusInfo && (
                    <div className="flex items-center gap-2 font-semibold mb-3">
                      {subscriptionStatusInfo.status === "cancelled" ? (
                        <FaExclamationCircle className={subscriptionStatusInfo.iconColor} />
                      ) : subscriptionStatusInfo.status === "cancelling" ? (
                        <FaExclamationCircle className={subscriptionStatusInfo.iconColor} />
                      ) : (
                        <FaCheckCircle className={subscriptionStatusInfo.iconColor} />
                      )}
                      <span className={`${subscriptionStatusInfo.status === "cancelled" ? "text-red-800" : subscriptionStatusInfo.status === "cancelling" ? "text-yellow-800" : "text-green-800"}`}>
                        {isFreemium ? "Okres próbny aktywny" : subscriptionStatusInfo.text}
                      </span>
                    </div>
                  )}
                  
                  {/* Freemium progress bar */}
                  {isFreemium && progressPercentage !== null ? (
                    <div className="space-y-2 mb-3">
                      {daysRemaining !== null && (
                        <p className="text-sm text-gray-700">
                          Pozostało dni: <span className="font-bold text-gray-900">{daysRemaining}</span>
                        </p>
                      )}
                      <div className="relative w-full h-2.5 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            daysRemaining !== null && daysRemaining <= 3
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : daysRemaining !== null && daysRemaining <= 7
                              ? "bg-gradient-to-r from-orange-500 to-orange-600"
                              : daysRemaining !== null && daysRemaining <= 14
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Days remaining for paid subscriptions */}
                      {daysRemaining !== null && !isFreemium && (
                        <p className="text-sm text-gray-700 mb-2">
                          Pozostało dni: <span className="font-bold text-gray-900">{daysRemaining}</span>
                        </p>
                      )}
                      
                      {/* Next payment info for paid premium */}
                      {isPaidPremium && subscriptionStatusInfo?.status !== "cancelled" && (
                        <div className="space-y-1 mb-3">
                          {nextPaymentDate && (
                            <p className="text-sm text-gray-700">
                              Następna płatność: <span className="font-semibold text-gray-900">{nextPaymentDate}</span>
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            Kwota: <span className="font-bold text-gray-900">49,99 zł</span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Manage subscription button */}
                  {isPaidPremium && subscriptionStatusInfo?.status !== "cancelled" && (
                    <button
                      onClick={handleManageSubscription}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Zarządzaj subskrypcją
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">Powiadomienia SMS</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">Więcej klientek</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">Więcej rezerwacji</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm md:text-base">Wyróżnienie profilu</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Price & CTA */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              {!isSubscribed && (
                <>
                  <div className="text-center lg:text-right">
                    <div className="text-4xl md:text-5xl font-bold text-gray-900">
                      49,99 zł
                    </div>
                    <div className="text-sm md:text-base text-gray-600 mt-1">
                      / miesiąc
                    </div>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing || !user?.uid}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubscribing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Przetwarzanie...</span>
                      </>
                    ) : (
                      <>
                        <FaCrown className="text-sm" />
                        <span>Aktywuj Premium</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center lg:text-right">
                    Bezpieczna płatność przez Stripe
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Profile Information */}
      <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm body-font">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <FaUser className="text-white text-sm md:text-base" />
          </div>
          Informacje podstawowe
        </h3>
        
        {/* Responsive grid: 1 column on mobile, 2 columns on tablet+, but full width on edit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* Name Field */}
          <div className={`flex flex-col gap-3 ${editing.name ? 'lg:col-span-2' : ''}`}>
            <label className="text-sm md:text-base font-semibold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50">
                <FaUser className="text-blue-600 text-xs" />
              </div>
              Imię i nazwisko
            </label>
            {!editing.name ? (
              <div className="group relative p-4 md:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm md:text-base flex-1 pr-2">
                    {user?.name || "Nie ustawiono"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditingChange((p) => ({ ...p, name: true }));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edytuj</span>
                  </button>
                </div>
                {/* Click overlay */}
                <div 
                  onClick={() => onEditingChange((p) => ({ ...p, name: true }))}
                  className="absolute inset-0 cursor-pointer"
                ></div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-blue-50/30 rounded-xl border-2 border-blue-300">
                <input
                  className="w-full text-sm md:text-base border-2 border-blue-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                  value={formValues.name}
                  onChange={(e) =>
                    onFormValuesChange((v) => ({
                      ...v,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Wprowadź imię i nazwisko"
                  autoFocus
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={() => onSaveField("name")} 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaCheck className="text-sm" />
                    Zapisz zmiany
                  </button>
                  <button
                    onClick={() => onEditingChange((p) => ({ ...p, name: false }))}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FaTimes className="text-sm" />
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className={`flex flex-col gap-3 ${editing.email ? 'lg:col-span-2' : ''}`}>
            <label className="text-sm md:text-base font-semibold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50">
                <FaEnvelope className="text-blue-600 text-xs" />
              </div>
              Email
            </label>
            {!editing.email ? (
              <div className="group relative p-4 md:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm md:text-base flex-1 pr-2 truncate">
                    {firebaseUser?.email || user?.email || "Nie ustawiono"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditingChange((p) => ({ ...p, email: true }));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edytuj</span>
                  </button>
                </div>
                <div 
                  onClick={() => onEditingChange((p) => ({ ...p, email: true }))}
                  className="absolute inset-0 cursor-pointer"
                ></div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-blue-50/30 rounded-xl border-2 border-blue-300">
                <input
                  type="email"
                  className="w-full text-sm md:text-base border-2 border-blue-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                  value={formValues.email}
                  onChange={(e) =>
                    onFormValuesChange((v) => ({
                      ...v,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Wprowadź adres email"
                  autoFocus
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={() => onSaveField("email")} 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaCheck className="text-sm" />
                    Zapisz zmiany
                  </button>
                  <button
                    onClick={() => onEditingChange((p) => ({ ...p, email: false }))}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FaTimes className="text-sm" />
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className={`flex flex-col gap-3 ${editing.phone ? 'lg:col-span-2' : ''}`}>
            <label className="text-sm md:text-base font-semibold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-50">
                <FaPhone className="text-blue-600 text-xs" />
              </div>
              Telefon
            </label>
            {!editing.phone ? (
              <div className="group relative p-4 md:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm md:text-base flex-1 pr-2">
                    {user?.phoneNumber || user?.phone || "Nie ustawiono"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditingChange((p) => ({ ...p, phone: true }));
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edytuj</span>
                  </button>
                </div>
                <div 
                  onClick={() => onEditingChange((p) => ({ ...p, phone: true }))}
                  className="absolute inset-0 cursor-pointer"
                ></div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-blue-50/30 rounded-xl border-2 border-blue-300">
                <input
                  type="tel"
                  className="w-full text-sm md:text-base border-2 border-blue-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                  value={formValues.phone}
                  onChange={(e) =>
                    onFormValuesChange((v) => ({
                      ...v,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Wprowadź numer telefonu"
                  autoFocus
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={() => onSaveField("phone")} 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaCheck className="text-sm" />
                    Zapisz zmiany
                  </button>
                  <button
                    onClick={() => onEditingChange((p) => ({ ...p, phone: false }))}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FaTimes className="text-sm" />
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google metadata configuration */}
      <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm body-font">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <FaCog className="text-white text-sm md:text-base" />
          </div>
            Wygląd w Google
        </h3>
        <p className="text-sm text-gray-600 mb-4 md:mb-5">
          Edytuj tytuł i opis, które będą widoczne w wynikach wyszukiwania Google. Kliknij na tytuł lub opis poniżej, aby je zmienić.
        </p>
        <div className="space-y-4">
          {/* Google-like preview */}
          <div className="bg-gray-50 rounded-lg p-4 md:p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-3 mb-2">
              <Image
                src="/fav/favicon.ico"
                alt="Naily favicon"
                width={28}
                height={28}
                className="shadow-sm shadow-black rounded-full mt-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {!editingSeo.title ? (
                  <div className="flex items-center group">
                    <div 
                      onClick={() => setEditingSeo((p) => ({ ...p, title: true }))}
                      className="text-[#1a0dab] text-base md:text-lg leading-tight cursor-pointer hover:underline flex-1 min-w-0"
                    >
                      {metaDraft.seoTitle || user?.name || "Tytuł strony"}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSeo((p) => ({ ...p, title: true }));
                      }}
                      className="focus:outline-none ml-1.5 text-xs px-2 py-1 text-blue-600 hover:text-blue-700 transition-opacity hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100"
                      title="Edytuj tytuł"
                    >
                      Edytuj
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      className="w-full text-base md:text-lg border-2 border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      value={metaDraft.seoTitle}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 60);
                        onMetaDraftChange((v) => ({
                          ...v,
                          seoTitle: value,
                        }));
                      }}
                      placeholder="Wprowadź tytuł (max 60 znaków)"
                      maxLength={60}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          onSaveMetadata();
                          setEditingSeo((p) => ({ ...p, title: false }));
                        }} 
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-medium shadow-sm"
                      >
                        <FaCheck className="text-xs" />
                        Zapisz
                      </button>
                      <button
                        onClick={() => setEditingSeo((p) => ({ ...p, title: false }))}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        <FaTimes className="text-xs" />
                        Anuluj
                      </button>
                      <span className="text-xs text-gray-500 ml-2">
                        {metaDraft.seoTitle.length}/60
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[#006621] text-xs md:text-sm truncate mt-1">
                  naily.pl/zarezerwuj/{user?.userSlugUrl || user?.uid || "profil"}
                </p>
                {!editingSeo.description ? (
                  <div className="group flex items-start gap-2 mt-1">
                    <p 
                      onClick={() => setEditingSeo((p) => ({ ...p, description: true }))}
                      className="text-gray-700 text-xs md:text-sm line-clamp-2 cursor-pointer hover:text-gray-900 flex-1 min-w-0"
                    >
                      {metaDraft.seoDescription ||
                        "Kliknij tutaj, aby dodać opis widoczny w wynikach Google."}
                    </p>
                    <button
                      onClick={() => setEditingSeo((p) => ({ ...p, description: true }))}
                      className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:text-blue-700 transition-opacity flex-shrink-0 hover:bg-blue-50 rounded"
                      title="Edytuj opis"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <textarea
                      className="w-full text-xs md:text-sm border-2 border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                      value={metaDraft.seoDescription}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 160);
                        onMetaDraftChange((v) => ({
                          ...v,
                          seoDescription: value,
                        }));
                      }}
                      placeholder="Wprowadź opis (max 160 znaków)"
                      maxLength={160}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          onSaveMetadata();
                          setEditingSeo((p) => ({ ...p, description: false }));
                        }} 
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-medium shadow-sm"
                      >
                        <FaCheck className="text-xs" />
                        Zapisz
                      </button>
                      <button
                        onClick={() => setEditingSeo((p) => ({ ...p, description: false }))}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        <FaTimes className="text-xs" />
                        Anuluj
                      </button>
                      <span className="text-xs text-gray-500 ml-2">
                        {metaDraft.seoDescription.length}/160
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm body-font">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-5 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <FaBell className="text-white text-sm md:text-base" />
          </div>
          Preferencje
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-blue-50">
                <FaBell className="text-blue-600 flex-shrink-0 text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Powiadomienia email
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Otrzymuj powiadomienia na email
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleSetting("emailNotifications")}
              className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                getSafeSettings(user).emailNotifications
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                  getSafeSettings(user).emailNotifications ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-blue-50">
                <FaCog className="text-blue-600 flex-shrink-0 text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Automatyczne przypomnienia
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Przypomnienia o nadchodzących wizytach
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleSetting("autoReminders")}
              className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                getSafeSettings(user).autoReminders
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                  getSafeSettings(user).autoReminders ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-blue-50">
                <FaBell className="text-blue-600 flex-shrink-0 text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Powiadomienia push
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Powiadomienia o nowych rezerwacjach
                </p>
                {!pushNotificationPermission && getSafeSettings(user).pushNotifications && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">
                    ⚠️ Wymagane zezwolenie przeglądarki
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handlePushNotificationToggle}
              disabled={requestingPermission}
              className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                getSafeSettings(user).pushNotifications && pushNotificationPermission
                  ? "bg-blue-600"
                  : "bg-gray-300"
              } ${requestingPermission ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {requestingPermission ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-white text-xs" />
                </div>
              ) : (
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                    getSafeSettings(user).pushNotifications && pushNotificationPermission ? "right-0.5" : "left-0.5"
                  }`}
                ></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm body-font">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-5 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <FaUser className="text-white text-sm md:text-base" />
          </div>
          Prywatność i bezpieczeństwo
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-blue-50">
                <FaUser className="text-blue-600 flex-shrink-0 text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Profil publiczny
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Pokaż swój profil innym użytkownikom
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleSetting("publicProfile")}
              className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                getSafeSettings(user).publicProfile
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                  getSafeSettings(user).publicProfile ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-red-50 rounded-xl p-4 md:p-6 border-2 border-red-100 shadow-sm">
        <h3 className="text-lg md:text-xl font-bold text-red-800 mb-4 md:mb-5">
          Akcje konta
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-white rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors">
            <p className="font-semibold text-sm md:text-base">Usuń konto</p>
            <p className="text-xs md:text-sm text-red-500 mt-1">
              Trwale usuń swoje konto i wszystkie dane
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

