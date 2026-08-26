import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, MapPin, Phone, Mail, Calendar, Hash, Activity, FileText } from "lucide-react";
import { getSession } from "@/lib/auth";
import PartnerDetailsActions from "@/components/partners/PartnerDetailsActions";
import FollowUpRow from "@/components/follow-ups/FollowUpRow";

export default async function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  
  const partner = await prisma.crmPartner.findUnique({
    where: { id },
    include: {
      lead: {
        select: {
          assignedBa: { select: { name: true } }
        }
      },
      followUps: {
        orderBy: { dueDate: 'desc' },
        take: 5
      }
    }
  });

  if (!partner) return notFound();

  // Check BA ownership
  if (session?.role === 'BUSINESS_ASSOCIATE' && partner.assignedBaId !== session.userId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>You do not have permission to view this partner.</p>
      </div>
    );
  }

  const registeredDate = new Date(partner.createdAt).toLocaleDateString();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/partners" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{partner.companyName}</h2>
            <p className="text-sm text-gray-500">Registered Partner Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${partner.status === 'ACTIVE' ? 'badge-primary' : 'bg-red-100 text-red-800'}`}>
            {partner.status}
          </span>
          <PartnerDetailsActions
            partnerPhone={partner.phone}
            partnerContactName={partner.contactPerson || partner.companyName}
            partnerCompanyName={partner.companyName}
            baName={partner.lead.assignedBa?.name || ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card-white p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Contact Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{partner.contactPerson || 'No contact person'}</p>
                  <p className="text-xs text-gray-500">{partner.agentType || 'Agent'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href={`tel:${partner.phone}`} className="text-sm text-primary hover:underline">{partner.phone}</a>
              </div>
              
              {partner.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${partner.email}`} className="text-sm text-primary hover:underline">{partner.email}</a>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700">
                  {partner.city || 'No city'}, {partner.state || 'No state'}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="text-sm text-gray-700">Registered: {registeredDate}</div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <div className="text-sm text-gray-700">
                  Assigned to: <span className="font-medium text-gray-900">{partner.lead.assignedBa?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Stats & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-600 mb-1">Requirements</p>
              <p className="text-2xl font-bold text-gray-900">{partner.totalRequirements}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{partner.totalBookings}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-600 mb-1">Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{partner.totalBookingValue.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs font-medium text-orange-600 mb-1">BA Commission</p>
              <p className="text-2xl font-bold text-gray-900">₹{partner.totalBaCommission.toLocaleString()}</p>
            </div>
          </div>

          <div className="card-white overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">Recent Follow-ups</h3>
            </div>
            {partner.followUps.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 border-b border-gray-100">
                No follow-ups recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-100">
                    {partner.followUps.map(f => <FollowUpRow key={f.id} followUp={{ ...f, partner } as any} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="card-white overflow-hidden opacity-75">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">Requirements & Quotations</h3>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Phase 4</span>
            </div>
            <div className="p-6 text-center text-sm text-gray-500">
              The Quotation engine will be integrated here in the next phase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
