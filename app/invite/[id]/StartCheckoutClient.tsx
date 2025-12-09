"use client";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { FaArrowRight, FaLock } from "react-icons/fa";

export default function StartCheckoutClient({
  inviteId,
}: {
  inviteId: string;
}) {
  const { user } = useSelector((state: any) => state.user);

  async function startCheckout() {
    if (!user?.uid || !user?.email) {
      window.location.href = "/admin";
      return;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/stripe/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        inviteId,
        successRedirect: `${process.env.NEXT_PUBLIC_URL || ""}/dashboard`,
      }),
    });
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <Button
      onClick={startCheckout}
      className="group relative px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold text-base transition-colors duration-200 hover:bg-primary-700 shadow-sm w-full sm:w-auto"
    >
      <FaLock className="text-sm mr-2" />
      Kontynuuj w Stripe
      <FaArrowRight className="text-sm ml-2" />
    </Button>
  );
}
