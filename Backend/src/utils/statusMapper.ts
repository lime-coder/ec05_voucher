import { VOUCHER_STATUS } from '../constants';

export function mapApiStatusToDb(apiStatus: string): string {
  switch (apiStatus.toLowerCase()) {
    case 'active':
      return VOUCHER_STATUS.ACTIVE;
    case 'pending_approval':
    case 'pending':
      return VOUCHER_STATUS.PENDING;
    case 'paused':
      return VOUCHER_STATUS.PAUSED;
    case 'rejected':
      return VOUCHER_STATUS.REJECTED;
    case 'deleted':
      return VOUCHER_STATUS.DELETED;
    case 'expired':
      return VOUCHER_STATUS.EXPIRED;
    case 'draft':
      return VOUCHER_STATUS.DRAFT;
    default:
      return VOUCHER_STATUS.DRAFT;
  }
}

export function mapDbStatusToApi(dbStatus: string): string {
  switch (dbStatus) {
    case VOUCHER_STATUS.ACTIVE:
      return 'active';
    case VOUCHER_STATUS.PENDING:
      return 'pending';
    case VOUCHER_STATUS.PAUSED:
      return 'paused';
    case VOUCHER_STATUS.REJECTED:
      return 'rejected';
    case VOUCHER_STATUS.DELETED:
      return 'deleted';
    case VOUCHER_STATUS.EXPIRED:
      return 'expired';
    case VOUCHER_STATUS.DRAFT:
    default:
      return 'draft';
  }
}
