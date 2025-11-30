ALTER TABLE `twitter_configs` ADD `schedule_interval_minutes` int DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE `twitter_configs` ADD `schedule_start_hour` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `twitter_configs` ADD `schedule_end_hour` int DEFAULT 23 NOT NULL;