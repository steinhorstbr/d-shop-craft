import { supabase } from "@/integrations/supabase/client";

export async function logAudit({
  storeId,
  userId,
  entityType,
  entityId,
  action,
  details,
}: {
  storeId: string;
  userId: string;
  entityType: "product" | "order" | "filament" | "customer" | "packaging" | "printer";
  entityId: string;
  action: "created" | "updated" | "deleted" | "status_changed";
  details?: Record<string, any>;
}) {
  try {
    await supabase.from("audit_log").insert({
      store_id: storeId,
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      details: details || null,
    });
  } catch (e) {
    // Fail silently - audit log should not block operations
    console.warn("Audit log failed:", e);
  }
}
