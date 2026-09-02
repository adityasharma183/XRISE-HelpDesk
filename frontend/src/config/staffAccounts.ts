export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  roleBadge: string;
  category: 'ADMIN' | 'AGENT';
  iconType: 'crown' | 'dispatch' | 'support' | 'escalation';
  description?: string;
}

/**
 * Predefined staff accounts configuration for evaluation and testing.
 * Source of truth for pre-configured staff accounts across the application.
 */
export const PREDEFINED_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'admin',
    name: 'System Administrator',
    email: 'admin@xriseai.com',
    password: 'admin@123',
    role: 'MASTER ADMIN',
    roleBadge: 'GLOBAL SUPERVISION',
    category: 'ADMIN',
    iconType: 'crown',
    description: 'Full oversight, global ticket distribution, and manual agent reassignment control.',
  },
  {
    id: 'agent1',
    name: 'Aarav Sharma',
    email: 'agent1@xriseai.com',
    password: 'agent1@123',
    role: 'DISPATCH AGENT',
    roleBadge: 'QUEUE ASSIGNED',
    category: 'AGENT',
    iconType: 'dispatch',
    description: 'Lead intake agent managing high-velocity tickets and initial customer triage.',
  },
  {
    id: 'agent2',
    name: 'Ananya Patel',
    email: 'agent2@xriseai.com',
    password: 'agent2@123',
    role: 'SUPPORT AGENT',
    roleBadge: 'QUEUE ASSIGNED',
    category: 'AGENT',
    iconType: 'support',
    description: 'Technical support engineer handling API integrations, webhooks, and backend errors.',
  },
  {
    id: 'agent3',
    name: 'Rohan Verma',
    email: 'agent3@xriseai.com',
    password: 'agent3@123',
    role: 'SUPPORT AGENT',
    roleBadge: 'QUEUE ASSIGNED',
    category: 'AGENT',
    iconType: 'support',
    description: 'Enterprise specialist responsible for SSO, SAML authentication, and complex inquiries.',
  },
];

export const MASTER_ADMIN_ACCOUNT = PREDEFINED_STAFF_ACCOUNTS.find((acc) => acc.category === 'ADMIN')!;
export const SUPPORT_STAFF_ACCOUNTS = PREDEFINED_STAFF_ACCOUNTS.filter((acc) => acc.category === 'AGENT');
