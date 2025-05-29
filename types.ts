export enum TicketStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  SERVING = 'SERVING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  ABSENT = 'ABSENT',
}

export interface Ticket {
  id: string;
  number: number; // The numeric part of the ticket
  displayNumber: string; // Formatted ticket number, e.g., "A-001"
  status: TicketStatus;
  issuedAt: Date;
  calledAt?: Date;
  stationId?: string; // ID of the station that called/is serving this ticket
  serviceType: string; // e.g., "General Inquiry", "Payments" - can be expanded
}

export interface Station {
  id: string;
  name: string;
  currentTicketId: string | null; // Store ID of the ticket, not just number
  status: 'IDLE' | 'CALLING' | 'SERVING'; // CALLING state for when a ticket is called but not yet marked as serving
  supportedServiceTypes: string[]; // Which types of services this station handles
}

export interface AppState {
  tickets: Ticket[];
  // nextTicketNumber: number; // Deprecated: Managed per service type
  stations: Station[];
  showTicketModal: boolean;
  lastIssuedTicket: Ticket | null;
  currentView: 'customer' | 'admin'; // To switch between customer and admin views
  serviceTypes: ServiceType[];
  selectedServiceType: string | null; // For issuing new tickets
}

export interface ServiceType {
  id: string;
  name: string;
  prefix: string; // e.g., "A" for General, "B" for Payments
  nextNumber: number;
}