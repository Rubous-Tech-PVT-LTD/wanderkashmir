import type { Metadata } from "next";
import "./globals.css";
import { VendorProvider, InitialVendorProfile, VendorType, SubscriptionPlan } from "@/context/VendorContext";
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ToasterProvider from "@/components/ToasterProvider";
import { getVendorSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "WanderKashmir – Hotels, Homestays, Taxis & Tours in Kashmir",
  description:
    "Book verified hotels, homestays, houseboats, taxi services and tour packages across Jammu & Kashmir. Your all-in-one Kashmir travel platform.",
  keywords:
    "Kashmir hotels, Kashmir homestay, Dal Lake houseboat, Kashmir tour packages, Srinagar taxi, Gulmarg, Pahalgam, Kashmir tourism",
  openGraph: {
    title: "WanderKashmir – Kashmir's Premier Travel Marketplace",
    description:
      "Book verified stays, taxis & tour packages across Jammu & Kashmir",
    type: "website",
    locale: "en_IN",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId: clerkUserId } = await auth();
  const vendorSession = await getVendorSession();
  
  // Use custom vendor session first (for partner portal), then fall back to Clerk
  const userId = vendorSession?.userId || clerkUserId || null;
  
  let initialProfile: InitialVendorProfile | null = null;

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true }
      });
      
      if (user) {
        const profile = user.vendorProfile;
        const dbPlan = profile?.subscriptionPlan || "FREE";
        const planMapping: Record<string, string> = {
          "FREE": "Free",
          "GROWTH": "Growth Pro",
          "PRO": "Pro",
          "ENTERPRISE": "Enterprise"
        };

        initialProfile = {
          role: user.role,
          vendorType: profile ? (profile.type.toLowerCase() as VendorType) : null,
          businessName: profile ? profile.businessName : null,
          email: profile ? (profile.email || user.email) : user.email,
          isApproved: profile ? profile.isApproved : false,
          subscriptionPlan: planMapping[dbPlan] as SubscriptionPlan,
          status: profile ? profile.status : "PENDING",
          rejectionReason: profile ? profile.rejectionReason : null,
        };
      }
    } catch (error) {
      console.error("Database connection error in layout:", error);
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ClerkProvider
          localization={{
            userProfile: {
              start: {
                passwordSection: {
                  primaryButton__updatePassword: "Forget password",
                  primaryButton__setPassword: "Forget password"
                }
              }
            }
          }}
          appearance={{
            elements: {
              profileSection__mfa: "hidden",
              profileSection__activeDevices: "hidden",
              profileSection__danger: "hidden",
              profileSection__emailAddresses: "hidden",
              profileSection__connectedAccounts: "hidden",
            }
          }}
        >
          <VendorProvider initialProfile={initialProfile}>
            {children}
            <ToasterProvider />
          </VendorProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
