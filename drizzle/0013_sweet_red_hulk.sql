ALTER TABLE `messages` ADD `checkpoint_hash` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `is_checkpoint` integer DEFAULT false;