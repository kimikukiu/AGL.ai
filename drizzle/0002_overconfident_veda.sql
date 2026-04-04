CREATE TABLE `aiModels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`emoji` varchar(10),
	`tagline` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiModels_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiModels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialTokensRemaining` int DEFAULT 100000;--> statement-breakpoint
ALTER TABLE `users` ADD `isTrialActive` boolean DEFAULT false NOT NULL;