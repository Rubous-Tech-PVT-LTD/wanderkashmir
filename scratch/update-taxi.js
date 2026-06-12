const fs = require('fs');

let file = fs.readFileSync('src/app/partner/Taxi_Driver/page.tsx', 'utf8');

// 1. Import updateSubscriptionPlan
file = file.replace(
  'import { addVehicle } from "@/actions/listings";',
  'import { addVehicle } from "@/actions/listings";\nimport { updateSubscriptionPlan } from "@/actions/vendor";'
);

// 2. Change handleSimulateUpgrade
file = file.replace(
  /const handleSimulateUpgrade = \([\s\S]*?toast\.success[^}]*}\n    }\n  };/,
  `const handleSimulateUpgrade = async (planName: string, price: string) => {
    if (subscriptionPlan === planName) return;
    
    if (planName === "Enterprise") {
      toast.success("Our sales team will contact you shortly to setup your Enterprise account!", { icon: '📞' });
      return;
    }

    const confirmed = window.confirm(\`Simulated Payment Gateway:\\n\\nConfirm payment of \${price} to upgrade your account to the \${planName} plan?\`);
    if (confirmed) {
      toast.loading("Upgrading your plan...", { id: 'upgrade' });
      const res = await updateSubscriptionPlan(planName);
      if (res.success) {
        setSubscriptionPlan(planName);
        toast.success(\`Success! You are now on the \${planName} plan. New features have been unlocked.\`, { id: 'upgrade' });
      } else {
        toast.error(res.error || "Failed to upgrade plan", { id: 'upgrade' });
      }
    }
  };`
);

// 3. Change "earnings" tab to "financials"
file = file.replace(
  /\{\["overview", "vehicles", isStand && "drivers", "rates", "trips", "earnings"\]\.filter\(Boolean\)\.map\(\(tab\) => \(/g,
  `{["overview", "vehicles", isStand && "drivers", "rates", "trips", "financials"].filter(Boolean).map((tab) => (`
);

file = file.replace(
  /activeTab === "earnings"/g,
  `activeTab === "financials"`
);

// 4. Update the analytics paywall and Recharts UI
const hotelFile = fs.readFileSync('src/app/partner/hotel/page.tsx', 'utf8');

// Get the ADVANCED ANALYTICS (FEATURE GATED) block from hotel
let hotelAnalyticsMatch = hotelFile.match(/\{\/\* ADVANCED ANALYTICS \(FEATURE GATED\) \*\/\}([\s\S]*?)<h3 className="text-sm font-bold text-slate-700 mb-2">Guest Demographics<\/h3>/);
if (hotelAnalyticsMatch) {
  let hotelAnalyticsCode = hotelAnalyticsMatch[1];
  
  // adapt variables for Taxi
  hotelAnalyticsCode = hotelAnalyticsCode.replace(/growthBookings/g, 'growthTrips').replace(/totalBookings/g, 'totalTrips').replace(/"HOTEL"/g, '"TAXI"');

  // Find the old ADVANCED ANALYTICS block in Taxi
  let taxiOldAnalyticsMatch = file.match(/\{\/\* ADVANCED ANALYTICS \(FEATURE GATED\) \*\/\}([\s\S]*?)\{\/\* PREMIUM SUPPORT HUB \*\/\}/);
  if (taxiOldAnalyticsMatch) {
    let replacedBlock = `{/* ADVANCED ANALYTICS (FEATURE GATED) */}
${hotelAnalyticsCode}
<h3 className="text-sm font-bold text-slate-700 mb-2">Trip Demographics</h3>
    {/* PREMIUM SUPPORT HUB */}`;
    file = file.replace(taxiOldAnalyticsMatch[0], replacedBlock);
  }
}

// 5. Move the Subscription plans from overview to financials
let subMatch = file.match(/\{\/\* SUBSCRIPTION UPGRADE PLANS \*\/\}([\s\S]*?)<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">/);
if (subMatch) {
  let subCode = subMatch[0];
  // Remove it from overview
  file = file.replace(subCode, '');
  
  // Prepend to financials
  file = file.replace(/\{activeTab === "financials" && \(\s*<div className="space-y-8">/, 
    `{activeTab === "financials" && (
        <div className="space-y-8">
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-sky-900 mb-2">Welcome to WanderKashmir!</h2>
            <p className="text-sky-800">Your registration is complete. Choose a subscription plan below to unlock premium features and increase your bookings.</p>
          </div>
          ${subCode}`
  );
}

fs.writeFileSync('src/app/partner/Taxi_Driver/page.tsx', file);
console.log("Done updating Taxi_Driver page.");
