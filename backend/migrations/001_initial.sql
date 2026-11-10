-- The five tables created by hand on Aiven before migrations existed.
-- `IF NOT EXISTS` makes it safe to run on that database: nothing changes there,
-- and the migration is only recorded in `schema_migrations`.

CREATE TABLE IF NOT EXISTS `entity_user` (
  `firebase_uid` VARCHAR(128) NOT NULL,
  `username`     VARCHAR(50)  NOT NULL,
  `email`        VARCHAR(255) NULL,
  `role`         ENUM('moe_magical', 'haku_sama', 'senpai') NOT NULL,
  `is_adult`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `folder` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_uid`   VARCHAR(128) NOT NULL,
  `name`       VARCHAR(100) NOT NULL,
  `kind`       ENUM('custom', 'favorites', 'to_watch') NOT NULL DEFAULT 'custom',
  `is_deleted` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_folder_user` (`user_uid`),
  CONSTRAINT `fk_folder_user` FOREIGN KEY (`user_uid`)
    REFERENCES `entity_user` (`firebase_uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `folder_item` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `folder_id`   INT          NOT NULL,
  `mal_id`      INT          NOT NULL,
  `anime_title` VARCHAR(255) NULL,
  `anime_image` VARCHAR(512) NULL,
  `is_deleted`  TINYINT(1)   NOT NULL DEFAULT 0,
  `added_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_folder_anime` (`folder_id`, `mal_id`),
  CONSTRAINT `fk_item_folder` FOREIGN KEY (`folder_id`)
    REFERENCES `folder` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rating` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_uid`   VARCHAR(128) NOT NULL,
  `mal_id`     INT          NOT NULL,
  `score`      TINYINT      NOT NULL,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_anime_rating` (`user_uid`, `mal_id`),
  CONSTRAINT `chk_score` CHECK (`score` BETWEEN 1 AND 10),
  CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_uid`)
    REFERENCES `entity_user` (`firebase_uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comment` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `user_uid`   VARCHAR(128) NOT NULL,
  `mal_id`     INT          NOT NULL,
  `body`       TEXT         NOT NULL,
  `is_deleted` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_user_anime` (`user_uid`, `mal_id`),
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_uid`)
    REFERENCES `entity_user` (`firebase_uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
