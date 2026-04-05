/**
 * Resolve organization approval for API access.
 * Supports legacy `approved: true` and new `approvalStatus` enum.
 */
export function getApprovalState(org) {
  if (!org) {
    return { isApproved: false, status: 'pending', rejectionReason: null };
  }
  const hasExplicitStatus =
    org.approvalStatus != null && String(org.approvalStatus).length > 0;
  if (hasExplicitStatus) {
    const status = org.approvalStatus;
    return {
      isApproved: status === 'approved',
      status,
      rejectionReason: org.rejectionReason || null,
    };
  }
  const legacyApproved = org.approved === true;
  return {
    isApproved: legacyApproved,
    status: legacyApproved ? 'approved' : 'pending',
    rejectionReason: null,
  };
}

export function assertOrgCanIssue(org) {
  const { isApproved, status, rejectionReason } = getApprovalState(org);
  if (isApproved) return;
  const msg =
    status === 'rejected'
      ? `Organization not approved: ${rejectionReason || 'rejected'}`
      : 'Your organization is pending admin approval. You cannot issue certificates yet.';
  const err = new Error(msg);
  err.statusCode = 403;
  err.code = 'ORG_NOT_APPROVED';
  throw err;
}
