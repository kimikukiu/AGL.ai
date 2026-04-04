CREATE TABLE `adminAuth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`recoveryCode` varchar(255) NOT NULL,
	`lastLoginAt` timestamp,
	`loginAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminAuth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercentage` decimal(5,2) NOT NULL,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('free','starter','professional','elite') NOT NULL DEFAULT 'free',
	`tokensIncluded` int NOT NULL DEFAULT 0,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`stripeSubscriptionId` varchar(255),
	`promoCode` varchar(50),
	`discountPercentage` decimal(5,2) DEFAULT '0',
	`billingCycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isAdminAuthenticated` boolean DEFAULT false NOT NULL;