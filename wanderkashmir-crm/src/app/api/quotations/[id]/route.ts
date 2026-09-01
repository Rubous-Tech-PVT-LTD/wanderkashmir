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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const data = await req.json();

    const existing = await prisma.crmQuotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);

    // BA ownership check
    if (!isAdminOrManager && existing.baId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Role-based status protection
    if (!isAdminOrManager && !["DRAFT", "REVISED"].includes(existing.status)) {
      return NextResponse.json({ error: "Cannot modify quotation in current status" }, { status: 400 });
    }

    // Admins can't edit CONFIRMED quotes generally, but we'll enforce a basic check
    if (existing.status === "CONFIRMED") {
      return NextResponse.json({ error: "Confirmed quotations cannot be modified" }, { status: 400 });
    }

    const items = data.items || [];
    
    // Server-side financial recalculation
    let totalCost = 0;
    let totalSellingPrice = 0;

    for (const item of items) {
      // Use numeric values and default to 0 to prevent NaN
      const qty = Number(item.quantity) || 1;
      const unitC = Number(item.unitCost) || 0;
      const unitS = Number(item.unitSellingPrice) || 0;
      
      const itemTC = qty * unitC;
      const itemTS = qty * unitS;
      
      totalCost += itemTC;
      totalSellingPrice += itemTS;
    }

    const discount = Number(data.discount) || 0;
    const finalSellingPrice = totalSellingPrice - discount;
    const partnerPrice = finalSellingPrice; // Assuming partnerPrice = finalSellingPrice
    const grossMargin = finalSellingPrice - totalCost;
    // Assuming netMargin and wanderKashmirMargin for now are similar logic or 0 if not calculated differently
    const wanderKashmirMargin = grossMargin; 
    const netMargin = grossMargin;

    // Diff-based item updates
    const itemsToKeep = items.filter((i: any) => i.id).map((i: any) => i.id);

    // Run within a transaction
    const updatedQuotation = await prisma.$transaction(async (tx) => {
      // Delete removed items
      if (itemsToKeep.length > 0) {
        await tx.crmQuotationItem.deleteMany({
          where: { quotationId: id, id: { notIn: itemsToKeep } },
        });
      } else {
        await tx.crmQuotationItem.deleteMany({
          where: { quotationId: id },
        });
      }

      // Upsert items
      for (const item of items) {
        const qty = Number(item.quantity) || 1;
        const unitC = Number(item.unitCost) || 0;
        const unitS = Number(item.unitSellingPrice) || 0;
        const itemTC = qty * unitC;
        const itemTS = qty * unitS;

        if (item.id) {
          // Update existing
          await tx.crmQuotationItem.update({
            where: { id: item.id },
            data: {
              category: item.category || "OTHER",
              description: item.description || "",
              quantity: qty,
              unit: item.unit || "Per Person",
              unitCost: unitC,
              unitSellingPrice: unitS,
              totalCost: itemTC,
              totalSellingPrice: itemTS,
            },
          });
        } else {
          // Create new
          await tx.crmQuotationItem.create({
            data: {
              quotationId: id,
              category: item.category || "OTHER",
              description: item.description || "",
              quantity: qty,
              unit: item.unit || "Per Person",
              unitCost: unitC,
              unitSellingPrice: unitS,
              totalCost: itemTC,
              totalSellingPrice: itemTS,
            },
          });
        }
      }

      // Update Quotation
      return await tx.crmQuotation.update({
        where: { id },
        data: {
          terms: data.terms,
          cancellationPolicy: data.cancellationPolicy,
          discount,
          discountType: data.discountType || "FIXED",
          totalCost,
          totalSellingPrice,
          partnerPrice,
          grossMargin,
          netMargin,
          wanderKashmirMargin,
        },
        include: { items: true },
      });
    });

    // Audit log
    await prisma.crmAuditLog.create({
      data: {
        userId: user.userId,
        userRole: user.role,
        action: "QUOTATION_DRAFT_SAVED",
        entity: "CrmQuotation",
        entityId: id,
        newValue: { totalCost, totalSellingPrice, discount, status: existing.status } as any,
      }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error: any) {
    console.error("Quotation save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
