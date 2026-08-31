import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Building, MapPin, Calendar, CheckSquare } from "lucide-react";
import { getSession } from "@/lib/auth";
import LeadDetailsActions from "@/components/leads/LeadDetailsActions";
import InterestProofSection from "@/components/leads/InterestProofSection";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const lead = await prisma.crmLead.findUnique({
    where: { id },
    include: {
      assignedBa: true,
      callLogs: {
        orderBy: { createdAt: "desc" },
        include: { ba: true }
      },
      followUps: {
        orderBy: { dueDate: "asc" },
        include: { ba: true }
      }
    }
  });

  if (!lead) return notFound();

  // Basic ownership check
  if (session?.role === 'BUSINESS_ASSOCIATE' && lead.assignedBaId !== session.userId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>You do not have permission to view this lead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.companyName}</h2>
            <p className="text-sm text-gray-500">Lead Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="badge badge-primary">{lead.status.replace(/_/g, " ")}</span>
          <LeadDetailsActions
            leadId={lead.id}
            leadPhone={lead.phone}
            leadEmail={lead.email}
            leadContactName={lead.contactPerson || lead.companyName}
            leadCompanyName={lead.companyName}
            baName={lead.assignedBa?.name || ""}
            canConvert={['INTERESTED', 'CALLED', 'CONNECTED'].includes(lead.status)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Lead Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="card-white p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Contact Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact Person</p>
                  <p className="text-sm text-gray-600">{lead.contactPerson || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <a href={`tel:${lead.phone}`} className="text-sm text-primary hover:underline">{lead.phone}</a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email || "Not provided"}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    {lead.city ? `${lead.city}, ` : ''}{lead.state || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-white p-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Assignment</h3>
            <p className="text-sm text-gray-600">
              Assigned BA: <span className="font-medium text-gray-900">{lead.assignedBa?.name || "Unassigned"}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Imported on: {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>

          {lead.interestProofUrl && (
            <InterestProofSection 
              leadId={lead.id} 
              proofUrl={lead.interestProofUrl} 
              status={lead.interestProofStatus} 
              isAdmin={session?.role === 'CRM_ADMIN'} 
            />
          )}
        </div>

        {/* Right Col: Call History & Follow ups */}
        <div className="md:col-span-2 space-y-6">
          <div className="card-white overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Call History
              </h3>
            </div>
            <div className="p-6">
              {lead.callLogs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No calls logged yet.</p>
              ) : (
                <div className="space-y-6">
                  {lead.callLogs.map((log) => (
                    <div key={log.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="badge bg-blue-100 text-blue-800">{log.outcome.replace(/_/g, " ")}</span>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Logged At</p>
                          <p className="text-sm text-gray-900">
                            {new Date(log.createdAt).toLocaleString("en-IN", { 
                              day: '2-digit', month: 'short', year: 'numeric', 
                              hour: 'numeric', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.notes || "No notes provided."}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <p>Logged by: <span className="font-medium text-gray-900">{log.ba.name}</span></p>
                        {log.followUpDate && (
                          <p className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Follow-up: <span className="font-medium text-gray-900">{new Date(log.followUpDate).toLocaleDateString("en-IN")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card-white overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Scheduled Follow-ups
              </h3>
            </div>
            <div className="p-6">
              {lead.followUps.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No follow-ups scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {lead.followUps.map((fu) => (
                    <div key={fu.id} className="flex items-center justify-between border border-gray-100 p-4 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{fu.task}</p>
                        <p className="text-sm text-gray-500 mt-1">Assigned to: {fu.ba.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Due Date</p>
                        <p className={`text-sm font-medium ${fu.status === 'PENDING' && new Date(fu.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(fu.dueDate).toLocaleString("en-IN", { 
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: 'numeric', minute: '2-digit'
                          })}
                        </p>
                        <span className="text-xs font-semibold text-gray-500 mt-1 inline-block">{fu.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
