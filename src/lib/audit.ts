"use server";

import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { getClientIp } from "./security";
import { getRequestHeaders } from "./request";

export async function logAudit(input: {
  actorType: "owner" | "user" | "system";
  actorId: number;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: Record<string, unknown>;
}) {
  try {
    const h = await getRequestHeaders();
    const ip = getClientIp(h);
    await db.insert(auditLog).values({
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      details: input.details ?? {},
      ip,
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
