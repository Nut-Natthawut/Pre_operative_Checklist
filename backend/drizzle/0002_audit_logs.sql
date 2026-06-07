CREATE TABLE `audit_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `username` text,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text,
  `form_id` text,
  `details` text NOT NULL,
  `created_at` text NOT NULL
);
