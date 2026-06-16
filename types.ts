export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  clientName: string;
  clientType: string; // e.g., "Training", "Workshop"
  issuedDate: string;
  dueDate: string;
  amountPaid: number;
  amountDue: number;
  items: InvoiceItem[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Quote {
  id: string;
  number: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  clientName: string;
  clientType: string;
  createdDate: string;
  validUntil: string;
  total: number;
  items: QuoteItem[];
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
}

export interface Proposal {
  id: string;
  number: string;
  title: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Signed' | 'Declined';
  clientName: string;
  clientEmail: string;
  projectType: string;
  createdDate: string;
  validUntil: string;
  totalValue: number;
  sections: ProposalSection[];
  clientSignature?: string;
  clientSignedAt?: string;
  senderSignature?: string;
  senderSignedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | 'Accountant';
  status: 'Active' | 'Invited' | 'Disabled';
  lastActive: string;
  avatarUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: 'Design' | 'Development' | 'Consulting' | 'Support' | 'Other';
  price: number;
  taxRate: number;
  unit: string;
  createdAt: string;
}

export interface Stat {
  label: string;
  value: number;
  trend: number; // percentage
  trendDirection: 'up' | 'down';
  countLabel?: string; // e.g. "Drafts (2)"
}

export enum Tab {
  INVOICE = 'Invoice',
  PAID = 'Paid',
  REPEATING = 'Repeating',
}

export enum Page {
  DASHBOARD = 'Dashboard',
  SALES_OVERVIEW = 'SALES_OVERVIEW',
  INVOICES = 'INVOICES',
  ACCOUNTS = 'Accounts',
  INVOICE_DETAILS = 'INVOICE_DETAILS',
  CREATE_INVOICE = 'CREATE_INVOICE',
  QUOTES = 'QUOTES',
  CREATE_QUOTE = 'CREATE_QUOTE',
  QUOTE_DETAILS = 'QUOTE_DETAILS',
  SETTINGS = 'SETTINGS',
  CLIENTS = 'CLIENTS',
  PRODUCTS = 'PRODUCTS',
  PROPOSALS = 'PROPOSALS',
  CREATE_PROPOSAL = 'CREATE_PROPOSAL',
  PROPOSAL_DETAILS = 'PROPOSAL_DETAILS',
  LEGAL_CASES = 'LEGAL_CASES',
  LAWYERS = 'LAWYERS',
  REPORTS = 'REPORTS',
}