-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'client') NOT NULL DEFAULT 'client',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `themes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theme_name` VARCHAR(191) NOT NULL,
    `folder_path` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `theme_id` INTEGER NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invitations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wedding_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `bridegroom_name` VARCHAR(191) NOT NULL,
    `bridegroom_short_name` VARCHAR(191) NOT NULL,
    `bridegroom_parent` VARCHAR(191) NOT NULL,
    `bride_name` VARCHAR(191) NOT NULL,
    `bride_short_name` VARCHAR(191) NOT NULL,
    `bride_parent` VARCHAR(191) NOT NULL,
    `akad_date` DATE NOT NULL,
    `akad_time` VARCHAR(191) NOT NULL,
    `akad_location` TEXT NOT NULL,
    `akad_maps_url` TEXT NULL,
    `reception_date` DATE NOT NULL,
    `reception_time` VARCHAR(191) NOT NULL,
    `reception_location` TEXT NOT NULL,
    `reception_maps_url` TEXT NULL,
    `love_story` TEXT NULL,
    `live_streaming_url` VARCHAR(191) NULL,

    UNIQUE INDEX `wedding_details_invitation_id_key`(`invitation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `galleries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `type` ENUM('slider', 'gallery', 'background') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digital_wallets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `account_owner` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `guest_name` VARCHAR(191) NOT NULL,
    `rsvp` ENUM('hadir', 'tidak_hadir', 'ragu_ragu') NOT NULL,
    `wishes` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_theme_id_fkey` FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wedding_details` ADD CONSTRAINT `wedding_details_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `galleries` ADD CONSTRAINT `galleries_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digital_wallets` ADD CONSTRAINT `digital_wallets_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_books` ADD CONSTRAINT `guest_books_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
