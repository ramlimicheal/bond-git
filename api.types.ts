export interface ApiInvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

export interface ApiInvoice {
  id: number;
  number: string;
  status: string;
  clientName: string;
  clientType: string;
  issuedAt: string;
  dueAt: string;
  amountPaid: number;
  amountDue: number;
  items: ApiInvoiceItem[];
}

export interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
