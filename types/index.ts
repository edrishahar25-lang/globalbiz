export type CurrencyCode = 'ILS' | 'USD' | 'EUR' | 'GBP';

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateToIls: number;
};

export type Balance = {
  currency: CurrencyCode;
  amount: number;
};

export type KycLevel = 'verified' | 'pending' | 'basic';

export type TaxAuthorityConnection = {
  connected: boolean;
  certNumber: string;
  validUntil: string;
  invoicesValidatedThisMonth: number;
  totalAllocatedIls: number;
};

export type User = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  initials: string;
  country: 'IL';
  kycLevel: KycLevel;
  taxId: string;
  taxAuthority: TaxAuthorityConnection;
};

export type TransactionType = 'received' | 'sent';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionCategory = 'invoice' | 'subscription' | 'transfer' | 'refund' | 'fee';

export type Counterparty = {
  name: string;
  initials: string;
  country: string;
  flag: string;
  isBusiness: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  category: TransactionCategory;
  counterparty: Counterparty;
  amount: number;
  currency: CurrencyCode;
  amountIls: number;
  date: string;
  description: string;
  invoiceId?: string;
};

export type Contact = {
  id: string;
  name: string;
  initials: string;
  role: string;
  country: string;
  flag: string;
  lastInteractionAt?: string;
  preferredCurrency: CurrencyCode;
  isBusiness: boolean;
  totalSentIls: number;
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type AllocationStatus = 'approved' | 'pending' | 'not_required';

export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  client: {
    name: string;
    country: string;
    flag: string;
    email: string;
  };
  amount: number;
  currency: CurrencyCode;
  amountIls: number;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  items: InvoiceItem[];
  notes?: string;
  allocationStatus: AllocationStatus;
  allocationNumber?: string;
};

export type AiInsightType = 'opportunity' | 'warning' | 'info';

export type AiInsight = {
  id: string;
  type: AiInsightType;
  title: string;
  description: string;
  potentialSavingsIls?: number;
};

export type TaxReport = {
  month: string;
  monthLabel: string;
  incomeByCurrency: Balance[];
  totalIncomeIls: number;
  totalExpensesIls: number;
  estimatedIncomeTaxIls: number;
  estimatedBituachLeumiIls: number;
  estimatedVatIls: number;
  netProfitIls: number;
  aiInsights: AiInsight[];
};

export type QuickAction = {
  id: string;
  labelHe: string;
  icon: 'send' | 'receive' | 'invoice' | 'convert' | 'scan';
  route: string;
};
