import type { Metadata } from "next";
import "./globals.css";
import { VendorProvider, InitialVendorProfile, VendorType, SubscriptionPlan } from "@/context/VendorContext";
import { ClerkProvider } from '@clerk/nextjs'
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ToasterProvider from "@/components/ToasterProvider";
import { getVendorSession } from "@/lib/auth";
import { Plus_Jakarta_Sans, Inter, Dancing_Script } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "optional",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "optional",
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.wanderkashmir.com"),
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
  alternates: {
    canonical: "/",
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
      let user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Lazy sync for local development where webhooks might not fire
      if (!user && clerkUserId && clerkUserId === userId) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'WanderKashmir User';
          
          user = await prisma.user.create({
            data: {
              id: clerkUser.id,
              email: email || `user_${clerkUser.id}@example.com`,
              name: name,
              role: 'CUSTOMER'
            }
          });
        }
      }
      
      if (user) {
        let profile = null;
        if (vendorSession?.vendorProfileId) {
          profile = await prisma.vendorProfile.findUnique({ where: { id: vendorSession.vendorProfileId } });
        } else {
          profile = await prisma.vendorProfile.findFirst({ where: { userId } });
        }
        
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
          taxiRole: profile ? profile.taxiRole : null,
        };
      }
    } catch (error) {
      console.error("Database connection error in layout:", error);
    }
  }

  const fontClasses = `${plusJakartaSans.variable} ${inter.variable} ${dancingScript.variable}`;

  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/* Preconnect to Cloudinary CDN — opens TCP+TLS handshake early */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* Exact manual preload matching Next.js deviceSizes array to prevent LCP delay without double-download */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dcmoseix9/image/upload/w_1080,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png"
          imageSrcSet="https://res.cloudinary.com/dcmoseix9/image/upload/w_320,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 320w, https://res.cloudinary.com/dcmoseix9/image/upload/w_375,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 375w, https://res.cloudinary.com/dcmoseix9/image/upload/w_390,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 390w, https://res.cloudinary.com/dcmoseix9/image/upload/w_414,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 414w, https://res.cloudinary.com/dcmoseix9/image/upload/w_640,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 640w, https://res.cloudinary.com/dcmoseix9/image/upload/w_750,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 750w, https://res.cloudinary.com/dcmoseix9/image/upload/w_828,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 828w, https://res.cloudinary.com/dcmoseix9/image/upload/w_1080,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 1080w, https://res.cloudinary.com/dcmoseix9/image/upload/w_1200,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 1200w, https://res.cloudinary.com/dcmoseix9/image/upload/w_1920,q_auto:eco,f_auto/v1781182033/ChatGPT_Image_Jun_11_2026_06_15_47_PM_npe0t1.png 1920w"
          imageSizes="100vw"
          fetchPriority="high"
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
