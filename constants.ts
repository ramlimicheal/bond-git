import { Invoice, Stat, User } from './types';

export const STATS_DATA: Stat[] = [
  {
    label: 'Drafts',
    countLabel: 'Drafts (2)',
    value: 18,
    trend: 4.2,
    trendDirection: 'up',
  },
  {
    label: 'Awaiting Payment',
    countLabel: 'Awaiting Payment (9)',
    value: 62,
    trend: 2.2,
    trendDirection: 'down',
  },
  {
    label: 'Awaiting Approval',
    countLabel: 'Awaiting Approval',
    value: 4,
    trend: 4.2,
    trendDirection: 'up',
  },
  {
    label: 'Overdue',
    countLabel: 'Overdue (92)',
    value: 4,
    trend: 4.2,
    trendDirection: 'up',
  },
];

export const INVOICES_DATA: Invoice[] = [
  {
    id: '1',
    number: 'INV-0002',
    status: 'Paid',
    clientName: 'Crypto web3',
    clientType: 'Training',
    issuedDate: '2 Jan 2022',
    dueDate: '03 Mar 2022',
    amountPaid: 234.00,
    amountDue: 234.00,
    items: [
      { id: '1a', description: 'Web3 Consultation', quantity: 2, price: 117.00 }
    ]
  },
  {
    id: '2',
    number: 'INV-0010',
    status: 'Paid',
    clientName: 'How to code',
    clientType: 'Workshop',
    issuedDate: '5 Jan 2022',
    dueDate: '04 Jun 2022',
    amountPaid: 99.00,
    amountDue: 99.00,
    items: [
      { id: '2a', description: 'Coding Workshop Entry', quantity: 1, price: 99.00 }
    ]
  },
  {
    id: '3',
    number: 'INV-0034',
    status: 'Paid',
    clientName: 'Design training',
    clientType: 'Training',
    issuedDate: '11 Feb 2022',
    dueDate: '05 Jul 2022',
    amountPaid: 12.00,
    amountDue: 12.00,
    items: [
      { id: '3a', description: 'Design Materials', quantity: 1, price: 12.00 }
    ]
  },
  {
    id: '4',
    number: 'INV-0089',
    status: 'Paid',
    clientName: 'How to draw',
    clientType: 'Manual Book',
    issuedDate: '2 Mar 2022',
    dueDate: '09 Dec 2022',
    amountPaid: 34.00,
    amountDue: 34.00,
    items: [
      { id: '4a', description: 'Drawing Manual', quantity: 1, price: 34.00 }
    ]
  },
  {
    id: '5',
    number: 'INV-0234',
    status: 'Paid',
    clientName: 'Product management',
    clientType: 'Course',
    issuedDate: '11 Mar 2022',
    dueDate: '05 Nov 2022',
    amountPaid: 7.00,
    amountDue: 7.00,
    items: [
      { id: '5a', description: 'PM Intro Course', quantity: 1, price: 7.00 }
    ]
  },
  {
    id: '6',
    number: 'INV-0003',
    status: 'Pending',
    clientName: 'Gaga Book Tech',
    clientType: 'Book',
    issuedDate: '5 Jan 2022',
    dueDate: '07 Apr 2022',
    amountPaid: 99.00,
    amountDue: 934.00,
    items: [
      { id: '6a', description: 'Technical Writing', quantity: 10, price: 80.00 },
      { id: '6b', description: 'Editing Services', quantity: 1, price: 134.00 }
    ]
  },
  {
    id: '7',
    number: 'INV-0056',
    status: 'Pending',
    clientName: 'School fees',
    clientType: 'Monthly support',
    issuedDate: '11 Feb 2022',
    dueDate: '01 Oct 2022',
    amountPaid: 0.00,
    amountDue: 57.00,
    items: [
      { id: '7a', description: 'Monthly Support Fee', quantity: 1, price: 57.00 }
    ]
  },
];

export const USERS_DATA: User[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    email: 'alex.j@company.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 mins ago',
    avatarUrl: 'https://i.pravatar.cc/150?u=u1',
  },
  {
    id: 'u2',
    name: 'Sarah Connor',
    email: 'sarah.c@company.com',
    role: 'Editor',
    status: 'Active',
    lastActive: '1 hour ago',
    avatarUrl: 'https://i.pravatar.cc/150?u=u2',
  },
  {
    id: 'u3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Viewer',
    status: 'Invited',
    lastActive: '-',
    avatarUrl: undefined,
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily.d@company.com',
    role: 'Accountant',
    status: 'Disabled',
    lastActive: '2 days ago',
    avatarUrl: 'https://i.pravatar.cc/150?u=u4',
  },
  {
    id: 'u5',
    name: 'David Wilson',
    email: 'david.w@company.com',
    role: 'Editor',
    status: 'Active',
    lastActive: '5 hours ago',
    avatarUrl: 'https://i.pravatar.cc/150?u=u5',
  },
];