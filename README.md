CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  city TEXT,
  manager TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE employees (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  role TEXT,
  branch TEXT,
  email TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  employee_id UUID REFERENCES employees(id),
  amount NUMERIC(12,2),
  bank TEXT,
  account TEXT,
  reference TEXT,
  receipt_date TIMESTAMPTZ,
  source TEXT,
  verification_status TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_events (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  proof_id UUID REFERENCES payment_proofs(id),
  status TEXT NOT NULL,
  reason TEXT,
  checked_by TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC(12,2),
  verification_limit INTEGER,
  branches_limit INTEGER,
  employees_limit INTEGER,
  active BOOLEAN DEFAULT TRUE
);
