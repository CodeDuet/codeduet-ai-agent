PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_language_model_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`api_base_url` text,
	`env_var_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_language_model_providers`("id", "name", "api_base_url", "env_var_name", "created_at", "updated_at") SELECT "id", "name", "api_base_url", "env_var_name", "created_at", "updated_at" FROM `language_model_providers`;--> statement-breakpoint
DROP TABLE `language_model_providers`;--> statement-breakpoint
ALTER TABLE `__new_language_model_providers` RENAME TO `language_model_providers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;