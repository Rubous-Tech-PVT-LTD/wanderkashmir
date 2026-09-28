import { prisma } from "@/lib/prisma";
import ChartsView from "./ChartsView";

export default async function AdminCharts() {
  // Fetch real data from the database in parallel
  const [leadStatuses, leadSources, reqStatuses, bookingStatuses] = await Promise.all([
    // 1. Lead Pipeline Data
    prisma.crmLead.groupBy({
      by: ['status'],
      _count: { id: true }
    }).catch(() => []),

    // 2. Lead Sources Data
    prisma.crmLead.groupBy({
      by: ['source'],
      _count: { id: true }
    }).catch(() => []),

    // 3. Requirements Status
    prisma.crmRequirement.groupBy({
      by: ['status'],
      _count: { id: true }
    }).catch(() => []),

    // 4. Booking Overview
    prisma.crmBooking.groupBy({
      by: ['status'],
      _count: { id: true }
    }).catch(() => [])
  ]);
  
  const pipelineOrder = ["NEW", "ASSIGNED", "CALLED", "CONNECTED", "INTERESTED", "QUOTE_SENT", "NEGOTIATION", "BOOKED"];
  const pipelineData = pipelineOrder.map(status => {
    const item = leadStatuses.find((s: any) => s.status === status);
    return { name: status.replace('_', ' '), value: item ? item._count.id : 0 };
  }).filter(item => item.value > 0 || item.name === "NEW");
  
  const sourceData = leadSources
    .filter((s: any) => s.source)
    .map((s: any) => ({ name: s.source || 'Unknown', value: s._count.id }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5); // top 5 sources
    
  if (sourceData.length === 0) {
    sourceData.push({ name: 'Direct', value: 1 }); // fallback if empty
  }
  
  const reqOrder = ["NEW", "UNDER_REVIEW", "QUOTE_IN_PROGRESS", "ACCEPTED", "REJECTED", "CONVERTED_TO_BOOKING"];
  const requirementsData = reqOrder.map(status => {
    const item = reqStatuses.find((s: any) => s.status === status);
    return { name: status.replace(/_/g, ' '), value: item ? item._count.id : 0 };
  }).filter(item => item.value > 0);
  
  const bookingData: { name: string, value: number }[] = bookingStatuses.map((s: any) => ({
    name: s.status,
    value: s._count.id
  })).filter((item: any) => item.value > 0);
  
  if (bookingData.length === 0) {
    bookingData.push({ name: 'No Bookings', value: 1 }); // fallback if empty
  }

  return (
    <ChartsView 
      pipelineData={pipelineData}
      sourceData={sourceData}
      requirementsData={requirementsData}
      bookingData={bookingData}
    />
  );
}
