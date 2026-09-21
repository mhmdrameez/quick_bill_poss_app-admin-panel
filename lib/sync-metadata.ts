// lib/sync-metadata.ts
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { AuditEvent } from './types';

export function generateOperationId(): string {
  return `op_${uuidv4()}`;
}

export function buildSyncMetadata(existingRev: number = 0) {
  return {
    _rev: Math.max(0, Math.floor(existingRev || 0)) + 1,
    _lastOpId: generateOperationId(),
    _lastModifiedBy: 'ADMIN_WEB',
    _serverUpdatedAt: serverTimestamp(),
  };
}

/**
 * Creates an immutable audit event sub-document under `users/{uid}/sales/{saleId}/audit_events/{eventId}`
 */
export async function createAuditEvent(
  uid: string,
  saleId: string,
  operationType: 'CREATE' | 'EDIT' | 'CANCEL',
  operationId: string,
  rev: number,
  details: Record<string, any> = {}
): Promise<AuditEvent> {
  const eventId = `audit_${uuidv4()}`;
  const timestamp = Date.now();
  
  const eventData: AuditEvent = {
    id: eventId,
    saleId,
    actorUid: uid,
    operationId,
    rev,
    operationType,
    source: 'ADMIN_WEB',
    timestamp,
    details,
  };

  try {
    if (db) {
      const auditRef = doc(db, `users/${uid}/sales/${saleId}/audit_events/${eventId}`);
      await setDoc(auditRef, {
        ...eventData,
        _serverUpdatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Failed to write Firestore audit event:', err);
  }

  return eventData;
}
