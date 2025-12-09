"use client";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, addDocument, grantFreePremium } from "@/firebase";
import { toast } from "react-toastify";
import { errorCatcher } from "@/utils/errorCatcher";
import type { SimpleLocation } from "@/components/User/ProfileConfig/AccountLocation/MapInput";
import { createLinkFromText } from "@/utils/createLinkFromText";
import type { IService } from "@/types";
// Image upload helpers removed for now; reintroduce when needed

type StepId = 0 | 1 | 2 | 3 | 4;

const containerVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function ProfileCreator() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(0);
  const [loading, setLoading] = useState(false);

  const [accountType, setAccountType] = useState<"salon" | "individual">(
    "salon"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<SimpleLocation | null>(null);
  const [profileImageUrl, _setProfileImageUrl] = useState<string | null>(null);
  const [serviceDrafts, setServiceDrafts] = useState<ServiceDraft[]>([]);

  // Persistent validation state across steps
  const [attemptedBasics, setAttemptedBasics] = useState<boolean>(false);
  const [basicsErrors, setBasicsErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    repeatPassword?: string;
    acceptRules?: string;
  }>({});
  const [attemptedLocation, setAttemptedLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");

  const steps = useMemo(
    () => [
      {
        title: "Rodzaj profilu",
        next: "Podstawowe dane",
        description: "Wybierz czy zakładasz profil jako salon czy stylistka.",
      },
      {
        title: "Podstawowe dane",
        next: "Lokalizacja",
        description: "Imię i nazwisko / nazwa salonu, kontakt.",
      },
      {
        title: "Lokalizacja",
        next: "Prezentacja profilu",
        description: "Wybierz miasto.",
      },
      {
        title: "Prezentacja profilu",
        next: "Usługi i konfiguracja",
        description: "Krótki opis profilu.",
      },
      {
        title: "Usługi i konfiguracja",
        next: "Gotowe!",
        description:
          "Wybierz usługi. Skorzystaj z generatora by zacząć szybciej.",
      },
    ],
    []
  );

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-[100svh] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Top progress with captions */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-sm text-gray-500 font-poppins">
                Aktualny krok
              </div>
              <div className="font-semibold text-gray-900 text-xl">
                {steps[step].title}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 font-poppins">Następny</div>
              <div className="font-semibold text-gray-700 text-xl">
                {steps[step]?.next}
              </div>
            </div>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "tween", duration: 0.5 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            <div className="mb-6 text-zinc-800 text-2xl font-baloo">
              {steps[step].description}
            </div>

            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && (
                    <StepAccountType
                      value={accountType}
                      onChange={setAccountType}
                      onNext={() => setStep(1)}
                    />
                  )}
                  {step === 1 && (
                    <StepBasics
                      name={name}
                      setName={setName}
                      email={email}
                      setEmail={setEmail}
                      phone={phone}
                      setPhone={setPhone}
                      password={password}
                      setPassword={setPassword}
                      repeatPassword={repeatPassword}
                      setRepeatPassword={setRepeatPassword}
                      attempted={attemptedBasics}
                      setAttempted={setAttemptedBasics}
                      errors={basicsErrors}
                      setErrors={setBasicsErrors}
                      onBack={() => setStep(0)}
                      onNext={() => setStep(2)}
                    />
                  )}
                  {step === 2 && (
                    <StepLocation
                      value={location}
                      onChange={setLocation}
                      attempted={attemptedLocation}
                      setAttempted={setAttemptedLocation}
                      error={locationError}
                      setError={setLocationError}
                      onBack={() => setStep(1)}
                      onNext={() => setStep(3)}
                    />
                  )}
                  {step === 3 && (
                    <StepPresentation
                      description={description}
                      setDescription={setDescription}
                      onBack={() => setStep(2)}
                      onNext={() => setStep(4)}
                    />
                  )}
                  {step === 4 && (
                    <StepServices
                      loading={loading}
                      services={serviceDrafts}
                      setServices={setServiceDrafts}
                      onBack={() => setStep(3)}
                      onCreate={async (services) => {
                        // Cross-step validation before create
                        const nextBasicsErrors: typeof basicsErrors = {};
                        if (!name?.trim())
                          nextBasicsErrors.name = "To pole jest wymagane.";
                        const emailOk =
                          /^(?:[a-zA-Z0-9_'^&.+-])+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
                            (email || "").trim()
                          );
                        if (!email?.trim())
                          nextBasicsErrors.email = "To pole jest wymagane.";
                        else if (!emailOk)
                          nextBasicsErrors.email =
                            "Podaj poprawny adres email.";
                        const phoneDigits = (phone || "").replace(/\D/g, "");
                        if (
                          !(phoneDigits.length >= 9 && phoneDigits.length <= 15)
                        )
                          nextBasicsErrors.phone =
                            "Podaj poprawny numer telefonu.";
                        if ((password || "").length < 8)
                          nextBasicsErrors.password =
                            "Hasło powinno mieć minimum 8 znaków";
                        if ((password || "") !== (repeatPassword || ""))
                          nextBasicsErrors.repeatPassword =
                            "Hasła nie są takie same.";

                        const nextLocationError = location?.address
                          ? ""
                          : "Wybierz miasto.";

                        // If any errors, persist and jump to first invalid step
                        if (
                          Object.keys(nextBasicsErrors).length > 0 ||
                          nextLocationError
                        ) {
                          setBasicsErrors(nextBasicsErrors);
                          setAttemptedBasics(true);
                          setLocationError(nextLocationError);
                          setAttemptedLocation(!!nextLocationError);
                          const earliestStep =
                            Object.keys(nextBasicsErrors).length > 0 ? 1 : 2;
                          setStep(earliestStep);
                          toast.error("Prosimy poprawić błędy w formularzu");
                          return;
                        }
                        setLoading(true);
                        const id = toast.loading("Tworzę konto...");
                        try {
                          const cred = await createUserWithEmailAndPassword(
                            auth,
                            email,
                            password
                          );
                          // Ensure ID token is minted and attached to Firestore requests before writing
                          await cred.user.getIdToken(true);
                          const uid = cred?.user?.uid as string;
                          await addDocument("users", uid, {
                            uid,
                            name,
                            email,
                            description,
                            photoURL: profileImageUrl || "",
                            phoneNumber: phone,
                            seek: accountType === "individual",
                            emailVerified: false,
                            configured: false,
                            active: false,
                            profileComments: [],
                            services,
                            location: {
                              lng: location?.lng ?? 21.0122287,
                              lat: location?.lat ?? 52.2296756,
                              address: location?.address ?? "",
                            },
                            password: "",
                          });

                          // Grant 30-day free premium for new users
                          try {
                            await grantFreePremium(uid);
                          } catch (premiumError) {
                            console.error("Error granting free premium:", premiumError);
                            // Continue even if premium grant fails
                          }

                          toast.update(id, {
                            render: "Konto utworzone pomyślnie!",
                            type: "success",
                            isLoading: false,
                            autoClose: 2000,
                          });
                          router.push("/dashboard");
                        } catch (err) {
                          toast.update(id, {
                            render: errorCatcher(err as unknown as Error),
                            type: "error",
                            isLoading: false,
                            autoClose: 3000,
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepAccountType({
  value,
  onChange,
  onNext,
}: {
  value: "salon" | "individual";
  onChange: (_v: "salon" | "individual") => void;
  onNext: () => void;
}) {
  const type = value;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <motion.button
          onClick={() => onChange("salon")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative border-2 rounded-xl p-6 text-left transition-all duration-300 overflow-hidden group ${
            type === "salon"
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-200/50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 hover:shadow-md"
          }`}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          {/* Icon placeholder */}
          <div className={`relative mb-3 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
            type === "salon" 
              ? "bg-blue-500 text-white shadow-md" 
              : "bg-gray-200 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-700"
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <div className={`font-semibold text-gray-900 font-baloo text-2xl md:text-3xl mb-2 transition-colors ${
            type === "salon" ? "text-blue-900" : ""
          }`}>
            Salon
          </div>
          <div className="text-sm text-gray-600 font-poppins leading-relaxed">
            Dla salonów i zespołów
          </div>
          
          {/* Selection indicator */}
          {type === "salon" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
        
        <motion.button
          onClick={() => onChange("individual")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative border-2 rounded-xl p-6 text-left transition-all duration-300 overflow-hidden group ${
            type === "individual"
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-200/50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 hover:shadow-md"
          }`}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          {/* Icon placeholder */}
          <div className={`relative mb-3 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
            type === "individual" 
              ? "bg-blue-500 text-white shadow-md" 
              : "bg-gray-200 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-700"
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <div className={`font-semibold text-gray-900 font-baloo text-2xl md:text-3xl mb-2 transition-colors ${
            type === "individual" ? "text-blue-900" : ""
          }`}>
            Stylistka
          </div>
          <div className="text-sm text-gray-600 font-poppins leading-relaxed">
            Dla pojedynczych specjalistek
          </div>
          
          {/* Selection indicator */}
          {type === "individual" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>
      <div className="mt-8 flex justify-end">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Dalej
        </motion.button>
      </div>
    </div>
  );
}

function StepBasics({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
  attempted,
  setAttempted,
  errors,
  setErrors,
  onBack,
  onNext,
}: {
  name: string;
  setName: (_v: string) => void;
  email: string;
  setEmail: (_v: string) => void;
  phone: string;
  setPhone: (_v: string) => void;
  password: string;
  setPassword: (_v: string) => void;
  repeatPassword: string;
  setRepeatPassword: (_v: string) => void;
  attempted: boolean;
  setAttempted: (_v: boolean) => void;
  errors: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    repeatPassword?: string;
    acceptRules?: string;
  };
  setErrors: (_v: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    repeatPassword?: string;
    acceptRules?: string;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [acceptRules, setAcceptRules] = useState(false);

  const emailValid = useMemo(() => {
    if (!email) return false;
    return /^(?:[a-zA-Z0-9_'^&.+-])+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
      email.trim()
    );
  }, [email]);

  const phoneValid = useMemo(() => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  }, [phone]);

  const passwordsMatch = useMemo(
    () => password === repeatPassword,
    [password, repeatPassword]
  );

  const passwordStrength = useMemo(() => {
    const pwd = password || "";
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    const clamped = Math.min(score, 5);
    const labels = [
      "Bardzo słabe",
      "Słabe",
      "Średnie",
      "Dobre",
      "Bardzo dobre",
    ];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-emerald-600",
    ];
    return {
      score: clamped,
      label: labels[Math.max(0, clamped - 1)] || "",
      color: colors[Math.max(0, clamped - 1)] || "bg-gray-300",
    };
  }, [password]);

  const passwordReqs = useMemo(() => {
    const pwd = password || "";
    return {
      len: pwd.length >= 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      digit: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
    };
  }, [password]);

  const handleNext = () => {
    if (!attempted) setAttempted(true);
    const nextErrors: typeof errors = {};
    if (name.trim().length === 0) nextErrors.name = "To pole jest wymagane.";
    if (!emailValid)
      nextErrors.email = email
        ? "Podaj poprawny adres email."
        : "To pole jest wymagane.";
    if (!phoneValid) nextErrors.phone = "Podaj poprawny numer telefonu.";
    if (passwordStrength.score < 3)
      nextErrors.password = "Hasło jest zbyt słabe.";
    if (!passwordsMatch) nextErrors.repeatPassword = "Hasła nie są takie same.";
    if (!acceptRules)
      nextErrors.acceptRules = "Aby kontynuować, zaakceptuj warunki.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onNext();
  };
  return (
    <div>
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            className={`block text-sm font-semibold font-poppins mb-2 transition-colors ${
              errors.name ? "text-red-600" : "text-gray-700"
            }`}
          >
            Nazwa / Imię i nazwisko
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              value={name}
              autoComplete="name"
              type="text"
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                if (attempted) {
                  const next = { ...errors };
                  if (v.trim().length > 0) delete next.name;
                  else next.name = "To pole jest wymagane.";
                  setErrors(next);
                }
              }}
              className={`w-full rounded-lg border-2 py-3 outline-none transition-all duration-200 font-poppins ${
                name && !errors.name ? "pr-11 px-4" : "px-4"
              } ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
              }`}
              placeholder="np. Salon Blue Nails lub Anna Nowak"
            />
            {name && !errors.name && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>
          {attempted && errors.name && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-red-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.name}
            </motion.div>
          )}
        </div>
        <div>
          <label
            className={`block text-sm font-semibold font-poppins mb-2 transition-colors ${
              errors.email ? "text-red-600" : "text-gray-700"
            }`}
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                if (attempted) {
                  const next = { ...errors };
                  const ok =
                    /^(?:[a-zA-Z0-9_'^&.+-])+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
                      v.trim()
                    );
                  if (!v.trim()) next.email = "To pole jest wymagane.";
                  else if (!ok) next.email = "Podaj poprawny adres email.";
                  else delete next.email;
                  setErrors(next);
                }
              }}
              className={`w-full rounded-lg border-2 pl-11 py-3 outline-none transition-all duration-200 font-poppins ${
                emailValid ? "pr-11" : "pr-4"
              } ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50"
                  : emailValid
                  ? "border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
              }`}
              placeholder="twoj@email.com"
            />
            {emailValid && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>
          {attempted && errors.email && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-red-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email}
            </motion.div>
          )}
        </div>
        <div>
          <label
            className={`block text-sm font-semibold font-poppins mb-2 transition-colors ${
              errors.phone ? "text-red-600" : "text-gray-700"
            }`}
          >
            Telefon
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              id="tel"
              name="tel"
              value={phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              onChange={(e) => {
                const v = e.target.value;
                setPhone(v);
                if (attempted) {
                  const next = { ...errors };
                  const digits = v.replace(/\D/g, "");
                  if (digits.length >= 9 && digits.length <= 15)
                    delete next.phone;
                  else next.phone = "Podaj poprawny numer telefonu.";
                  setErrors(next);
                }
              }}
              className={`w-full rounded-lg border-2 pl-11 py-3 outline-none transition-all duration-200 font-poppins ${
                phoneValid ? "pr-11" : "pr-4"
              } ${
                errors.phone
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50"
                  : phoneValid
                  ? "border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
              }`}
              placeholder="+48 123 456 789"
            />
            {phoneValid && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>
          {attempted && errors.phone && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-red-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.phone}
            </motion.div>
          )}
        </div>
        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className={`text-sm font-poppins ${
                errors.password ? "text-red-600" : "text-gray-700"
              }`}
            >
              Hasło
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                if (attempted) {
                  const next = { ...errors };
                  // Update both password and repeat password error states
                  const pwd = v || "";
                  let score = 0;
                  if (pwd.length >= 8) score += 1;
                  if (/[a-z]/.test(pwd)) score += 1;
                  if (/[A-Z]/.test(pwd)) score += 1;
                  if (/[0-9]/.test(pwd)) score += 1;
                  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
                  if (Math.min(score, 5) >= 3) delete next.password;
                  else next.password = "Hasło jest zbyt słabe.";
                  if (v === repeatPassword) delete next.repeatPassword;
                  else next.repeatPassword = "Hasła nie są takie same.";
                  setErrors(next);
                }
              }}
              className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Minimum 8 znaków, małe/duże litery, cyfra, znak"
            />
            {attempted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg border border-gray-200"
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Siła hasła</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.score >= 4 ? "text-green-600" :
                      passwordStrength.score >= 3 ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {passwordStrength.label || "-"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full ${passwordStrength.color} rounded-full shadow-sm`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {[
                    { key: "len", label: "Minimum 8 znaków", icon: "🔢" },
                    { key: "lower", label: "Mała litera (a-z)", icon: "🔤" },
                    { key: "upper", label: "Duża litera (A-Z)", icon: "🔠" },
                    { key: "digit", label: "Cyfra (0-9)", icon: "123" },
                    { key: "special", label: "Znak specjalny", icon: "!@#" },
                  ].map((req) => {
                    const isValid = passwordReqs[req.key as keyof typeof passwordReqs];
                    return (
                      <motion.div
                        key={req.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-2 text-xs p-2 rounded-md transition-all ${
                          isValid
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <span className={`text-base ${isValid ? "opacity-100" : "opacity-50"}`}>
                          {isValid ? "✓" : "○"}
                        </span>
                        <span className="font-medium">{req.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
          <div>
            <label
              className={`text-sm font-poppins ${
                errors.repeatPassword ? "text-red-600" : "text-gray-700"
              }`}
            >
              Powtórz hasło
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={repeatPassword}
              autoComplete="new-password"
              onChange={(e) => {
                const v = e.target.value;
                setRepeatPassword(v);
                if (attempted) {
                  const next = { ...errors };
                  if (v === password) delete next.repeatPassword;
                  else next.repeatPassword = "Hasła nie są takie same.";
                  setErrors(next);
                }
              }}
              className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
                errors.repeatPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Powtórz hasło"
            />
            {attempted && errors.repeatPassword && (
              <div className="mt-1 text-xs text-red-600">
                {errors.repeatPassword}
              </div>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="inline-flex items-start gap-2 text-sm text-gray-700 font-poppins">
            <input
              type="checkbox"
              checked={acceptRules}
              onChange={(e) => setAcceptRules(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600">
              Rejestrując się akceptuję{" "}
              <a
                href="/regulamin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                regulamin
              </a>{" "}
              oraz{" "}
              <a
                href="/polityka-prywatnosci"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                politykę prywatności
              </a>
              .
            </span>
          </label>
          {attempted && errors.acceptRules && (
            <div className="mt-1 text-xs text-red-600">
              {errors.acceptRules}
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-poppins font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Wstecz
        </motion.button>
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Dalej
        </motion.button>
      </div>
    </div>
  );
}

function StepPresentation({
  description,
  setDescription,
  onBack,
  onNext,
}: {
  description: string;
  setDescription: (_v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const charCount = description.length;
  const maxChars = 500;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700 font-poppins">
          Opis profilu
        </label>
        <span className={`text-xs font-medium transition-colors ${
          charCount > maxChars * 0.9 
            ? "text-orange-600" 
            : charCount > maxChars * 0.7
            ? "text-gray-600"
            : "text-gray-400"
        }`}>
          {charCount} / {maxChars}
        </span>
      </div>
      
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={maxChars}
          className="w-full min-h-40 rounded-lg border-2 border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 font-poppins resize-y hover:border-gray-400"
          placeholder="Opisz swoje doświadczenie, styl pracy i specjalizacje..."
        />
        
        {/* Writing tips */}
        {description.length === 0 && (
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <div className="font-semibold mb-1">💡 Wskazówki:</div>
              <ul className="space-y-1 text-blue-700">
                <li>• Opisz swoje doświadczenie i specjalizacje</li>
                <li>• Wymień najważniejsze usługi</li>
                <li>• Dodaj coś o swoim stylu pracy</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Character count progress */}
      {charCount > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((charCount / maxChars) * 100, 100)}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${
                charCount > maxChars * 0.9
                  ? "bg-gradient-to-r from-orange-400 to-orange-500"
                  : charCount > maxChars * 0.7
                  ? "bg-gradient-to-r from-blue-400 to-blue-500"
                  : "bg-gradient-to-r from-green-400 to-green-500"
              }`}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-poppins font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Wstecz
        </motion.button>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Dalej
        </motion.button>
      </div>
    </div>
  );
}

function StepLocation({
  value,
  onChange,
  attempted,
  setAttempted,
  error,
  setError,
  onBack,
  onNext,
}: {
  value: SimpleLocation | null;
  onChange: (_v: SimpleLocation) => void;
  attempted: boolean;
  setAttempted: (_v: boolean) => void;
  error: string;
  setError: (_v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [cityInput, setCityInput] = useState<string>(value?.address || "");
  const [debouncedCity, setDebouncedCity] = useState<string>(cityInput);
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [resultSelected, setResultSelected] = useState<boolean>(false);
  const [suppressFetch, setSuppressFetch] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCity(cityInput), 400);
    return () => clearTimeout(t);
  }, [cityInput]);

  const fetchCities = useCallback(async (query: string) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsFetching(true);
      const q = createLinkFromText(query);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/cities/${q}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Array<{ id: string; name: string }>;
      setOptions(Array.isArray(data) ? data : []);
    } catch (e) {
      const err = e as { name?: string } | undefined;
      if (err?.name !== "AbortError") console.error("City fetch error", e);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!debouncedCity || resultSelected) {
      setOptions([]);
      setIsFetching(false);
      return;
    }
    if (suppressFetch) {
      setSuppressFetch(false);
      setIsFetching(false);
      return;
    }
    if (debouncedCity.trim().length >= 2) fetchCities(debouncedCity);
    else {
      setOptions([]);
      setIsFetching(false);
    }
  }, [debouncedCity, fetchCities, suppressFetch, resultSelected]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const selectCity = useCallback(
    async (opt: { id: string; name: string }) => {
      try {
        setResultSelected(true);
        setSuppressFetch(true);
        setCityInput(opt.name);
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/city/${opt.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const city = (await res.json()) as {
          name?: string;
          latitude?: number;
          longitude?: number;
        };
        const lat = Number(city?.latitude ?? 0);
        const lng = Number(city?.longitude ?? 0);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          toast.error("Nie udało się pobrać współrzędnych miasta");
          return;
        }
        onChange({ address: opt.name, lat, lng });
        setOptions([]);
      } catch (e) {
        console.error("Select city error", e);
        toast.error("Wystąpił błąd podczas wyboru miasta");
      }
    },
    [onChange]
  );

  const confirmAndProceed = useCallback(async () => {
    const normalize = (s: string) => s.trim().toLowerCase();
    const typed = cityInput.trim();
    if (!typed) {
      if (!attempted) setAttempted(true);
      setError("Podaj miasto");
      return;
    }
    if (value && normalize(value.address) === normalize(typed)) {
      setError("");
      onNext();
      return;
    }
    const exact = options.find((o) => normalize(o.name) === normalize(typed));
    if (exact) {
      await selectCity(exact);
      setError("");
      onNext();
      return;
    }
    try {
      const slug = createLinkFromText(typed);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/city/${slug}`);
      if (res.ok) {
        const city = (await res.json()) as {
          name?: string;
          latitude?: number;
          longitude?: number;
        };
        const lat = Number(city?.latitude ?? 0);
        const lng = Number(city?.longitude ?? 0);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          onChange({ address: city?.name ?? typed, lat, lng });
          setError("");
          onNext();
          return;
        }
      }
      setError("Nie rozpoznano miasta. Wybierz z listy lub wpisz poprawnie.");
    } catch (_e) {
      setError("Nie udało się zweryfikować miasta");
    }
  }, [
    attempted,
    cityInput,
    onChange,
    onNext,
    options,
    selectCity,
    setAttempted,
    setError,
    value,
  ]);

  return (
    <div>
      <label
        className={`block text-sm font-semibold font-poppins mb-3 transition-colors ${
          error && attempted ? "text-red-600" : "text-gray-700"
        }`}
      >
        Wybierz miasto
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => {
            setResultSelected(false);
            setCityInput(e.target.value);
            if (attempted && error) setError("");
          }}
          placeholder="np. Warszawa"
          className={`w-full rounded-lg border-2 pl-12 pr-12 py-3 outline-none transition-all duration-200 font-poppins ${
            error && attempted
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50"
              : value
              ? "border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50/30"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
          }`}
          autoComplete="off"
        />
        {isFetching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <motion.svg
              className="w-5 h-5 text-blue-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="45"
                opacity="0.9"
              />
            </motion.svg>
          </div>
        )}
        {value && !isFetching && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
        {(() => {
          const normalize = (s: string) => s.trim().toLowerCase();
          const onlySameSingle =
            options.length === 1 &&
            normalize(options[0].name) === normalize(cityInput);
          return options.length > 0 && !onlySameSingle && !resultSelected;
        })() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-[60] left-0 right-0 mt-2"
          >
            <ul className="max-h-56 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden overflow-y-auto backdrop-blur-sm">
              {options.map((opt, idx) => (
                <motion.li
                  key={`${opt.id}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: "#eff6ff", x: 4 }}
                  className="px-4 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-gray-100 last:border-0 transition-all duration-200 flex items-center gap-3 group"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    void selectCity(opt);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{opt.name}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
      {attempted && error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-red-600 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      )}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-poppins font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Wstecz
        </motion.button>
        <motion.button
          onClick={confirmAndProceed}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Dalej
        </motion.button>
      </div>
    </div>
  );
}

type ServiceDraft = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  features: string[];
  expanded?: boolean;
};

function StepServices({
  onBack,
  onCreate,
  loading,
  services,
  setServices,
}: {
  onBack: () => void;
  onCreate: (_services: IService[]) => Promise<void> | void;
  loading: boolean;
  services: ServiceDraft[];
  setServices: React.Dispatch<React.SetStateAction<ServiceDraft[]>>;
}) {
  const generateFlattenName = (realName: string) =>
    String(realName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

  const toIService = (drafts: ServiceDraft[]): IService[] =>
    drafts.map((d) => ({
      flatten_name: generateFlattenName(d.name),
      real_name: d.name || "",
      price: Number.parseInt(d.price || "0", 10) || 0,
      duration: Number.parseInt(d.duration || "0", 10) || 0,
      description: d.description || "",
      isCustomService: true,
    }));

  const handleCreate = () => {
    const mapped = toIService(services);
    onCreate(mapped);
  };

  return (
    <div>
      <div className="mb-4 text-sm text-gray-700 font-poppins">
        Dodaj usługi. Użyj inteligentnego generatora aby wypełnić szczegóły.
      </div>
      <AIServiceGeneratorInline services={services} setServices={setServices} />
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-poppins font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Wstecz
        </motion.button>
        <motion.button
          disabled={loading}
          onClick={handleCreate}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.svg
                className="w-5 h-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60"
                  strokeDashoffset="45"
                  opacity="0.9"
                />
              </motion.svg>
              <span>Tworzę...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Zakończ i utwórz konto</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function AIServiceGeneratorInline({
  services,
  setServices,
}: {
  services: ServiceDraft[];
  setServices: React.Dispatch<React.SetStateAction<ServiceDraft[]>>;
}) {
  const [query, setQuery] = useState("");
  const [loadingGen, setLoadingGen] = useState(false);

  const toggleExpand = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const updateService = (id: string, patch: Partial<ServiceDraft>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const generate = async () => {
    if (!query || loadingGen) return;
    setLoadingGen(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/services/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: query }),
        }
      );
      const data = (await res.json()) as {
        name?: string;
        description?: string;
        category?: string;
        price?: number | string;
        duration?: number | string;
        features?: string[];
      };
      const draft: ServiceDraft = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: String(data.name ?? query),
        description: String(data.description ?? ""),
        category: String(data.category ?? "Inne"),
        price: String(data.price ?? ""),
        duration: String(data.duration ?? ""),
        features: Array.isArray(data.features)
          ? data.features.filter(
              (f) => typeof f === "string" && f.trim() !== ""
            )
          : [],
        expanded: true,
      };
      setServices((prev) => [...prev, draft]);
      setQuery("");
    } catch (_e) {
      // noop
    } finally {
      setLoadingGen(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loadingGen && query.trim()) {
                e.preventDefault();
                void generate();
              }
            }}
            placeholder="np. Manicure hybrydowy"
            className="w-full rounded-lg border-2 border-gray-300 pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 font-poppins hover:border-gray-400"
          />
        </div>
        <motion.button
          onClick={generate}
          disabled={loadingGen || !query.trim()}
          whileHover={!loadingGen && query.trim() ? { scale: 1.05 } : {}}
          whileTap={!loadingGen && query.trim() ? { scale: 0.95 } : {}}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loadingGen ? (
            <>
              <motion.svg
                className="w-5 h-5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60"
                  strokeDashoffset="45"
                  opacity="0.9"
                />
              </motion.svg>
              <span>Generuję...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Wygeneruj</span>
            </>
          )}
        </motion.button>
      </div>

      {services.length > 0 && (
        <div className="mt-6 space-y-4">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate text-lg">
                    {svc.name || "Bez nazwy"}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {svc.category || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {svc.price || "-"} zł
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {svc.duration || "-"} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => toggleExpand(svc.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-sm font-semibold transition-all duration-200"
                  >
                    {svc.expanded ? "Zwiń" : "Edytuj"}
                  </motion.button>
                  <motion.button
                    onClick={() => removeService(svc.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Usuń
                  </motion.button>
                </div>
              </div>

              {svc.expanded && (
                <div className="p-3 sm:p-4 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Nazwa"
                    value={svc.name}
                    onChange={(v) => updateService(svc.id, { name: v })}
                  />
                  <Field
                    label="Kategoria"
                    value={svc.category}
                    onChange={(v) => updateService(svc.id, { category: v })}
                  />
                  <Field
                    label="Cena (zł)"
                    value={svc.price}
                    onChange={(v) => updateService(svc.id, { price: v })}
                  />
                  <Field
                    label="Czas (min)"
                    value={svc.duration}
                    onChange={(v) => updateService(svc.id, { duration: v })}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Opis"
                      value={svc.description}
                      multiline
                      onChange={(v) =>
                        updateService(svc.id, { description: v })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">
                      Cechy (po jednej w linii)
                    </div>
                    <textarea
                      className="min-h-24 w-full whitespace-pre-wrap rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none"
                      value={(svc.features || []).join("\n")}
                      onChange={(e) =>
                        updateService(svc.id, {
                          features: e.target.value
                            .split(/\r?\n/)
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
  onChange?: (_v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {multiline ? (
        <textarea
          className="min-h-20 w-full whitespace-pre-wrap rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)} // You should provide an onChange handler for controlled input
          rows={3}
        />
      ) : (
        <input
          type="text"
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)} // You should provide an onChange handler for controlled input
        />
      )}
    </div>    
  );
}
