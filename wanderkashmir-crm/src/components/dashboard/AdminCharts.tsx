import { prisma } from "@/lib/prisma";
import ChartsView from "./ChartsView";

export default async function AdminCharts() {
  // Fetch real data from the database in parallel
  
  // 1. Lead Pipeline Data
  const leadStatuses = await prisma.crmLead.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const pipelineOrder = ["NEW", "ASSIGNED", "CALLED", "CONNECTED", "INTERESTED", "QUOTE_SENT", "NEGOTIATION", "BOOKED"];
  const pipelineData = pipelineOrder.map(status => {
    const item = leadStatuses.find(s => s.status === status);
    return { name: status.replace('_', ' '), value: item ? item._count.id : 0 };
  }).filter(item => item.value > 0 || item.name === "NEW");

  // 2. Lead Sources Data
  const leadSources = await prisma.crmLead.groupBy({
    by: ['source'],
    _count: { id: true }
  });
  
  const sourceData = leadSources
    .filter(s => s.source)
    .map(s => ({ name: s.source || 'Unknown', value: s._count.id }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 sources
    
  if (sourceData.length === 0) {
    sourceData.push({ name: 'Direct', value: 1 }); // fallback if empty
  }

  // 3. Requirements Status
  const reqStatuses = await prisma.crmRequirement.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const reqOrder = ["NEW", "UNDER_REVIEW", "QUOTE_IN_PROGRESS", "ACCEPTED", "REJECTED", "CONVERTED_TO_BOOKING"];
  const requirementsData = reqOrder.map(status => {
    const item = reqStatuses.find(s => s.status === status);
    return { name: status.replace(/_/g, ' '), value: item ? item._count.id : 0 };
  }).filter(item => item.value > 0);

  // 4. Booking Overview
  const bookingStatuses = await prisma.crmBooking.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  const bookingData: { name: string, value: number }[] = bookingStatuses.map(s => ({
    name: s.status,
    value: s._count.id
  })).filter(item => item.value > 0);
  
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
