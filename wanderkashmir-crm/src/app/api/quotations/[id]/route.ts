import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    
    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        items: true,
      }
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);
    if (!isAdminOrManager && quotation.baId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove internal financial fields for BAs
    if (!isAdminOrManager) {
      const sanitized = { ...quotation } as any;
      delete sanitized.totalCost;
      delete sanitized.grossMargin;
      delete sanitized.netMargin;
      delete sanitized.wanderKashmirMargin;
      delete sanitized.netCost;
      delete sanitized.markup;
      
      if (sanitized.items) {
        sanitized.items = sanitized.items.map((item: any) => {
          const { unitCost, totalCost, ...rest } = item;
          return rest;
        });
      }
      
      return NextResponse.json(sanitized);
    }

    return NextResponse.json(quotation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
