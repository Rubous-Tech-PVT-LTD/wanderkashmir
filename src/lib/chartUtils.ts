import { format, subDays, isAfter, startOfDay, endOfDay, subWeeks, subMonths } from "date-fns";

export function calculateDashboardMetrics(bookings: any[], vendorType: "HOTEL" | "HOMESTAY" | "TAXI" | "GUIDE", timeRange: string) {
  let totalRevenue = 0;
  let totalBookings = bookings.length;
  let totalViews = totalBookings * 15;
  let growthRevenue = 0;
  let growthBookings = 0;
  let growthViews = 0;

  // Amount field mapping based on vendor type
  const amountField = (vendorType === "TAXI") ? "taxiAmount" : (vendorType === "GUIDE") ? "guideAmount" : "baseAmount";

  // Calculate totals
  bookings.forEach(b => {
    totalRevenue += Number(b[amountField] || 0);
  });

  // Calculate Chart Data based on timeRange
  const chartData = [];
  const now = new Date();

  if (timeRange === "7D") {
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dateString = format(date, "EEE");
      
      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return isAfter(bDate, startOfDay(date)) && !isAfter(bDate, endOfDay(date));
      });

      const dayRevenue = dayBookings.reduce((sum, b) => sum + Number(b[amountField] || 0), 0);
      const dayCount = dayBookings.length;

      chartData.push({
        name: dateString,
        views: dayCount * 15,
        revenue: dayRevenue,
        bookings: dayCount,
      });
    }
  } else if (timeRange === "30D") {
    // Generate 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = subWeeks(now, i + 1);
      const weekEnd = subWeeks(now, i);
      
      const weekBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return isAfter(bDate, weekStart) && !isAfter(bDate, weekEnd);
      });

      const weekRevenue = weekBookings.reduce((sum, b) => sum + Number(b[amountField] || 0), 0);
      const weekCount = weekBookings.length;

      chartData.push({
        name: `Week ${4 - i}`,
        views: weekCount * 15,
        revenue: weekRevenue,
        bookings: weekCount,
      });
    }
  } else if (timeRange === "90D") {
    // Generate 3 months
    for (let i = 2; i >= 0; i--) {
      const monthStart = subMonths(now, i + 1);
      const monthEnd = subMonths(now, i);
      
      const monthBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return isAfter(bDate, monthStart) && !isAfter(bDate, monthEnd);
      });

      const monthRevenue = monthBookings.reduce((sum, b) => sum + Number(b[amountField] || 0), 0);
      const monthCount = monthBookings.length;

      chartData.push({
        name: format(monthEnd, "MMM"),
        views: monthCount * 15,
        revenue: monthRevenue,
        bookings: monthCount,
      });
    }
  }

  // Set growth to 0 since we don't have prior period comparison logic currently
  growthRevenue = 0;
  growthBookings = 0;
  growthViews = 0;

  return {
    totalRevenue,
    totalBookings,
    totalViews,
    chartData,
    growthRevenue,
    growthBookings,
    growthViews
  };
}
