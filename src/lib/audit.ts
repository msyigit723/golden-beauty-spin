import { supabase } from './supabase';
import { NextRequest } from 'next/server';
import { getIp } from './ratelimit';

export async function logAdminAction({
  req,
  adminId,
  adminUsername,
  actionType,
  targetId,
  details
}: {
  req: NextRequest;
  adminId?: string;
  adminUsername?: string;
  actionType: string;
  targetId?: string;
  details?: any;
}) {
  const ip_address = getIp(req);

  try {
    await supabase.from('audit_logs').insert({
      admin_id: adminId || null,
      admin_username: adminUsername || 'system',
      action_type: actionType,
      target_id: targetId || null,
      details: details || null,
      ip_address
    });
  } catch (error) {
    // We swallow errors here because we don't want audit logging failure to break the main admin action
    console.error('Audit log failed:', error);
  }
}
