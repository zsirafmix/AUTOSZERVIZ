import { prisma } from "./prisma";

interface LogAuditParams {
  userId?: string;
  userName?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE" | "PRICE_CHANGE" | "STOCK_CHANGE" | "LOGIN" | "APPROVAL";
  entityType: string;
  entityId?: string;
  oldValue?: string | null;
  newValue?: string | null;
  description: string;
  ipAddress?: string;
}

export async function logAuditAction(params: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName || "Rendszer",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        description: params.description,
        ipAddress: params.ipAddress || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
