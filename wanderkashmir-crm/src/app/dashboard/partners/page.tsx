import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Filter, Phone, Eye, CheckCircle, XCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import AssignBaDropdown from "@/components/leads/AssignBaDropdown";

export default async function PartnersPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {

  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const statusFilter = searchParams?.status || "";
  const page = Number(searchParams?.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;

  const session = await getSession();
  const userId = session?.userId;
  const role = session?.role;

  // Build where clause based on role & search
  const whereClause: any = {};
  if (role === 'BUSINESS_ASSOCIATE') {
    whereClause.assignedBaId = userId;
  }
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  }
  
  if (search) {
    whereClause.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [partners, totalCount, baUsers] = await Promise.all([
    prisma.crmPartner.findMany({
      where: whereClause,
      include: {
        lead: {
          select: {
            assignedBa: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.crmPartner.count({ where: whereClause }),
    role === 'CRM_ADMIN' ? prisma.crmUser.findMany({
      where: { role: 'BUSINESS_ASSOCIATE', isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }) : Promise.resolve([])
  ]);

  const totalPages = Math.ceil(totalCount / take);
  const isAdmin = role === 'CRM_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Registered Partners</h2>
      </div>

      <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <form className="relative max-w-md w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search partners..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </form>

          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden md:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned BA</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No partners found.</td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <React.Fragment key={partner.id}>
                    {/* Desktop Row */}
                    <tr className="hover:bg-gray-50 hidden md:table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                        <div className="text-sm text-gray-500">{partner.agentType || "Agent"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner.contactPerson || "N/A"}</div>
                        <div className="text-sm text-gray-500">{partner.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner.city || "Unknown City"}</div>
                        <div className="text-sm text-gray-500">{partner.state || "Unknown State"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${partner.status === 'ACTIVE' ? 'badge-primary' : 'bg-red-100 text-red-800'}`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isAdmin ? (
                          <AssignBaDropdown 
                            leadId={partner.leadId} 
                            currentBaId={partner.lead.assignedBa?.name ? partner.assignedBaId : null} 
                            baUsers={baUsers} 
                          />
                        ) : (
                          partner.lead.assignedBa?.name || "Unassigned"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && partner.status === 'INACTIVE' && (
                            <>
                              <form action={`/api/partners/${partner.id}/approve`} method="POST">
                                <button type="submit" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              </form>
                              <form action={`/api/partners/${partner.id}/reject`} method="POST">
                                <button type="submit" className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </form>
                            </>
                          )}
                          <a href={`tel:${partner.phone}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Call">
                            <Phone className="h-4 w-4" />
                          </a>
                          <Link href={`/dashboard/partners/${partner.id}`} className="p-1.5 text-gray-400 hover:text-gray-900 rounded" title="View Partner">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Mobile Card Row */}
                    <tr className="md:hidden">
                      <td colSpan={6} className="p-0">
                        <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{partner.companyName}</h3>
                              <p className="text-sm text-gray-600">{partner.contactPerson || "No Contact Person"}</p>
                            </div>
                            <span className={`badge text-xs ${partner.status === 'ACTIVE' ? 'badge-primary' : 'bg-red-100 text-red-800'}`}>
                              {partner.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 uppercase tracking-wider">Phone</span>
                              <span className="font-medium text-gray-900">{partner.phone}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 uppercase tracking-wider">Location</span>
                              <span className="font-medium text-gray-900">{partner.city || "-"} {partner.state ? `, ${partner.state}` : ""}</span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-xs text-gray-400 uppercase tracking-wider">Assigned BA</span>
                              <span className="font-medium text-gray-900">{partner.lead.assignedBa?.name || "Unassigned"}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                            <a
                              href={`tel:${partner.phone}`}
                              className="flex-1 flex justify-center items-center py-2.5 px-3 text-blue-600 bg-blue-50 rounded-md active:bg-blue-100 transition-colors"
                              title="Call"
                            >
                              <Phone className="h-5 w-5" />
                            </a>
                            <Link
                              href={`/dashboard/partners/${partner.id}`}
                              className="flex-[2] flex justify-center items-center gap-2 py-2.5 px-3 text-gray-700 bg-gray-100 rounded-md active:bg-gray-200 transition-colors font-medium"
                              title="View Partner"
                            >
                              <Eye className="h-5 w-5" />
                              <span>View Profile</span>
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{skip + 1}</span> to <span className="font-medium">{Math.min(skip + take, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> results
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/dashboard/partners?page=${page - 1}${search ? `&search=${search}` : ''}`} className="btn-secondary px-3 py-1 text-sm">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/dashboard/partners?page=${page + 1}${search ? `&search=${search}` : ''}`} className="btn-secondary px-3 py-1 text-sm">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
