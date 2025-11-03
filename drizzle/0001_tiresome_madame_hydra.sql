CREATE TABLE `posted_tweets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int NOT NULL,
	`tweet_text` text NOT NULL,
	`image_url` text,
	`source_news_url` text,
	`posted_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posted_tweets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `twitter_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`x_api_key` text NOT NULL,
	`x_api_key_secret` text NOT NULL,
	`x_access_token` text NOT NULL,
	`x_access_token_secret` text NOT NULL,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `twitter_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `posted_tweets` ADD CONSTRAINT `posted_tweets_config_id_twitter_configs_id_fk` FOREIGN KEY (`config_id`) REFERENCES `twitter_configs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `twitter_configs` ADD CONSTRAINT `twitter_configs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;