CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY,
  display_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('staff', 'manager')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_sessions (
  token_hash text PRIMARY KEY,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS worker_sessions_expiry_idx ON worker_sessions(expires_at);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  client_request_id uuid NOT NULL UNIQUE,
  request_hash text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('dinein', 'takeaway', 'delivery')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_details jsonb NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('counter', 'cash_on_delivery', 'demo_online')),
  subtotal_paise integer NOT NULL CHECK (subtotal_paise >= 0),
  packaging_paise integer NOT NULL CHECK (packaging_paise >= 0),
  delivery_paise integer NOT NULL CHECK (delivery_paise >= 0),
  discount_paise integer NOT NULL CHECK (discount_paise >= 0),
  total_paise integer NOT NULL CHECK (total_paise >= 0),
  assigned_worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_queue_idx ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_assignee_idx ON orders(assigned_worker_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_no integer NOT NULL,
  item_id text NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
  line_total_paise integer NOT NULL CHECK (line_total_paise >= 0),
  customizations jsonb NOT NULL,
  PRIMARY KEY (order_id, line_no)
);

CREATE TABLE IF NOT EXISTS order_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor_worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('created', 'claimed', 'status_changed')),
  from_status text,
  to_status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id, created_at DESC);
