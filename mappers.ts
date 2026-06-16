import type { ApiInvoice, ApiUser } from './api.types.ts';
import type { Invoice, User } from './types';

export function mapApiInvoiceToInvoice(api: ApiInvoice): Invoice {
  const issuedDate = new Date(api.issuedAt);
  const dueDate = new Date(api.dueAt);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

  return {
    id: String(api.id),
    number: api.number,
    status: api.status as Invoice['status'],
    clientName: api.clientName,
    clientType: api.clientType,
    issuedDate: isNaN(issuedDate.getTime()) ? api.issuedAt : issuedDate.toLocaleDateString('en-GB', opts),
    dueDate: isNaN(dueDate.getTime()) ? api.dueAt : dueDate.toLocaleDateString('en-GB', opts),
    amountPaid: api.amountPaid,
    amountDue: api.amountDue,
    items: api.items.map((item) => ({
      id: String(item.id),
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

export function mapApiUserToUser(api: ApiUser): User {
  return {
    id: String(api.id),
    name: api.name,
    email: api.email,
    role: api.role as User['role'],
    status: api.status as User['status'],
    lastActive: 'Just now',
    avatarUrl: undefined,
  };
}
