import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Filter, Download, Plus } from "lucide-react";
import LeadTableRow from "@/components/leads/LeadTableRow";
import NotifyBAsButton from "@/components/leads/NotifyBAsButton";
import { getSession } from "@/lib/auth";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const unassigned = resolvedParams.unassigned === "true";
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : "";
  const take = 15;
  const skip = (page - 1) * take;

  const whereClause: any = search
    ? {
        OR: [
          { companyName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  if (unassigned) {
    whereClause.assignedBaId = null;
  }
  
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const session = await getSession();

  if (session?.role === 'BUSINESS_ASSOCIATE') {
    whereClause.assignedBaId = session.userId;
  }

  const isAdmin = session?.role === 'CRM_ADMIN';

  const [leads, totalCount, baUsers] = await Promise.all([
    prisma.crmLead.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        phone: true,
        email: true,
        city: true,
        state: true,
        status: true,
        assignedBaId: true,
        assignedBa: { select: { name: true } },
      },
    }),
    prisma.crmLead.count({ where: whereClause }),
    isAdmin ? prisma.crmUser.findMany({
      where: { role: 'BUSINESS_ASSOCIATE', isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }) : Promise.resolve([])
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total {totalCount} leads found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && <NotifyBAsButton />}
          <Link href="/dashboard/leads/import" className="btn-secondary w-full sm:w-auto justify-center">
            <Download className="h-4 w-4 mr-2" /> Import CSV
          </Link>
          <Link href="/dashboard/leads/new" className="btn-primary w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" /> Add Lead
          </Link>
        </div>
      </div>

      <div className="card-white overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            {/* Using a standard HTML form for native searchparam updating */}
            <form action="/dashboard/leads" method="GET">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by company, phone, email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </form>
          </div>
          <button className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden md:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company / Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned BA
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <LeadTableRow key={lead.id} lead={lead} isAdmin={isAdmin} baUsers={baUsers} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{skip + 1}</span> to <span className="font-medium">{Math.min(skip + take, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> results
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/dashboard/leads?page=${page - 1}${search ? `&search=${search}` : ''}`} className="btn-secondary px-3 py-1 text-sm">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/dashboard/leads?page=${page + 1}${search ? `&search=${search}` : ''}`} className="btn-secondary px-3 py-1 text-sm">
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
