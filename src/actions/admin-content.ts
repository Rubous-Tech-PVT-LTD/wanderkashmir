"use server";

import prisma from "@/lib/prisma";

export async function getContentAssets(seoPageId: string) {
  try {
    const assets = await prisma.contentAsset.findMany({
      where: { seoPageId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, assets };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateContentAssetStatus(id: string, publishStatus: string) {
  try {
    const asset = await prisma.contentAsset.update({
      where: { id },
      data: { publishStatus },
    });
    return { success: true, asset };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateContentAsset(id: string, content: string, title?: string) {
  try {
    const asset = await prisma.contentAsset.update({
      where: { id },
      data: { 
        content,
        ...(title ? { title } : {}) 
      },
    });
    return { success: true, asset };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function duplicateContentAsset(id: string) {
  try {
    const original = await prisma.contentAsset.findUnique({ where: { id } });
    if (!original) throw new Error("Original asset not found");
    
    // Create duplicate but keep platform name with a suffix so it doesn't conflict
    const asset = await prisma.contentAsset.create({
      data: {
        seoPageId: original.seoPageId,
        platform: `${original.platform}-copy-${Date.now()}`,
        title: `${original.title} (Copy)`,
        content: original.content,
        jsonData: original.jsonData || undefined,
        contentType: original.contentType,
        publishStatus: "Draft",
      }
    });
    return { success: true, asset };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContentAsset(id: string) {
  try {
    await prisma.contentAsset.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
