CREATE TABLE `preop_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`form_date` text NOT NULL,
	`form_time` text NOT NULL,
	`ward` text NOT NULL,
	`time_field` text,
	`preparer` text,
	`hn` text NOT NULL,
	`an` text,
	`patient_name` text NOT NULL,
	`sex` text,
	`age` text,
	`dob` text,
	`department` text,
	`weight` text,
	`right_side` text,
	`allergy` text,
	`attending_physician` text,
	`bed` text,
	`or_checklist` text,
	`anes_checklist` text,
	`anes_lab` text,
	`consult_med` text,
	`risk_conditions` text,
	`consent_data` text,
	`npo_data` text,
	`iv_data` text,
	`premedication` text,
	`other_notes` text,
	`result_or` text,
	`result_anes` text,
	`qr_code_data` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`full_name` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);