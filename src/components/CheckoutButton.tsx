"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CheckoutButtonProps {
  propertyId: string;
  pricePerNight: number;
  isLoggedIn?: boolean;
  checkIn: string;
  checkOut: string;
  rooms?: number;
  guests?: number;
  adults: number;
  childrenCount: number;
  nights: number;
  guestName?: string;
  guestPhone?: string;
  specialRequests?: string;
  otherGuests?: {name: string, age: string}[];
  baseAmount?: number;
  taxiAmount?: number;
  guideAmount?: number;
  selectedTaxiId?: string;
  selectedGuideId?: string;
  tourId?: string;
  promoCode?: string;
  discountAmount?: number;
  roomTypeId?: string;
}

export default function CheckoutButton({ 
  propertyId, pricePerNight, isLoggedIn, checkIn, checkOut, rooms, adults, childrenCount, nights, 
  guestName, guestPhone, specialRequests, otherGuests,
  baseAmount, taxiAmount, guideAmount, selectedTaxiId, selectedGuideId, tourId,
  promoCode, discountAmount, roomTypeId
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      if (typeof window !== "undefined") {
        localStorage.setItem("wk_pending_stay", JSON.stringify({
          propertyId,
          roomTypeId,
          checkIn,
          checkOut,
          rooms,
          adults,
          childrenCount,
          guestName,
          guestPhone,
          specialRequests,
          autoOpenModal: true
        }));
      }
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Create a Razorpay order on the server
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          vehicleId: selectedTaxiId,
          guideProfileId: selectedGuideId,
          tourId,
          checkIn,
          checkOut,
          rooms: rooms ?? 1,
          adults,
          childrenCount,
          amount: (baseAmount || pricePerNight * nights * (rooms ?? 1)) + (taxiAmount || 0) + (guideAmount || 0),
          baseAmount: baseAmount || pricePerNight * nights * (rooms ?? 1),
          taxiAmount,
          guideAmount,
          guestName,
          guestPhone,
          specialRequests,
          otherGuests,
          promoCode,
          discountAmount,
          roomTypeId,
        }),
      });

      const orderData = await response.json();

      if (orderData.error) {
        toast.error("Error: " + orderData.error);
        setIsLoading(false);
        return;
      }

      // 2. Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WanderKashmir",
        description: "Booking Reservation",
        image: "/images/razorpay.svg",
        order_id: orderData.id,
        handler: async function (response: any) {
          setIsVerifying(true);
          // 3. Verify Payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            if (propertyId) {
              router.replace(`/stays/${propertyId}?success=true`);
            } else {
              const currentParams = new URLSearchParams(window.location.search);
              currentParams.set("success", "true");
              router.replace(`${window.location.pathname}?${currentParams.toString()}`);
            }
          } else {
            toast.error("Payment Verification Failed!");
            setIsVerifying(false);
          }
        },
        theme: {
          color: "#ea580c", // Saffron color
        },
      };

      // @ts-ignore
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handleCheckout}
        disabled={isLoading || isVerifying}
        className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-colors shadow-md disabled:opacity-50"
      >
        <span className="font-semibold text-lg">
          {isVerifying ? "Verifying Payment..." : isLoading ? "Processing..." : "Pay with Razorpay"}
        </span>
      </button>
    </>
  );
}
