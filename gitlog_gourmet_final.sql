-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: CURRENT_TIMESTAMP
-- Server version: 10.4.8-MariaDB
-- PHP Version: 7.3.10
-- FINAL DATABASE


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE TABLE `user` (
    user_ID INT NOT NULL AUTO_INCREMENT, 
    user_name VARCHAR(10) UNIQUE NOT NULL,
    password INT NOT NULL CHECK (password >= 0 AND password <= 9999),
    MG_highest_score INT,
    rating_MG INT,
    CB_highest_score INT,
    rating_CB INT,
    PRIMARY KEY(user_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `matching_game`(
    user_ID INT NOT NULL,
    MG_game_ID INT PRIMARY KEY AUTO_INCREMENT,
    MG_score INT,
    tiles_turned_count INT,  -- Stores the tile IDs (e.g., [1, 2, 3]) instead of file paths
    tile_placement JSON, -- Stores the tile placements (e.g., [1, 4, 2])
    time_elapsed INT,      -- Time limit in seconds
    last_time_accessed DATETIME,
    difficulty ENUM('Easy', 'Medium', 'Hard'),
    FOREIGN KEY(user_ID) REFERENCES `user`(user_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `code_breaker`(
    user_ID INT NULL,
    CB_game_ID INT PRIMARY KEY AUTO_INCREMENT,                    -- Unique identifier for the game                -- Username (foreign key relationship could be here)
    CB_score INT,
    correct_guess INT,
    correct_col INT,                       -- User's saved score for the game
    guesses_left INT,                        -- Number of remaining attempts
    last_time_accessed DATETIME,                   -- Last time the game was accessed
    attempts_combination JSON,                      -- JSON array of asset IDs for the correct combination
    user_combination JSON,                         -- JSON array of asset IDs for the user's guessed combination
    -- difficulty ENUM('Easy', 'Medium', 'Hard'),     -- Difficulty level of the game
    FOREIGN KEY(user_ID) REFERENCES `user`(user_ID)  -- Assuming there's a player table with usernames
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- CREATE TABLE game_assets (
--     asset_ID INT PRIMARY KEY AUTO_INCREMENT,
--     reference_code VARCHAR(10),                     -- Unique identifier for the asset
--     asset_name VARCHAR(100),                      -- Name of the asset (e.g., 'tile1', 'background1')
--     asset_type ENUM('game_1_resource','game_2_resource','homepage_resource','MG_tile', 'CB_icon'),  -- Standardized asset types
--     asset_file_path VARCHAR(512),                 -- Path to the asset file (increased length for longer URLs)
--     asset_description TEXT  
-- );

-- INSERT INTO game_assets (asset_ID, reference_code, asset_name, asset_type, asset_file_path, asset_description)
-- VALUES 
-- (1, 'IMG1', 'game1_logo', 'game_1_resource', 'assets/images/game1-house.png', 'icon image for matching game'),
-- (2, 'IMG2', 'game_logo', 'homepage_resource', 'assets/images/game-logo.png', 'egg logo for gitlog'),
-- (3, 'IMG3', 'game_screen_bg', 'game_1_resource', 'assets/images/game-screen-background.jpg', 'background image for games'),
-- (4, 'IMG4', 'home_screen_bg', 'homepage_resource', 'assets/images/home-screen-background.jpg', 'background image for homepage'),
-- (5, 'IMG5', 'question_mark_icon', 'game_2_resource', 'assets/images/question-mark.png', 'black question mark icon'),
-- (6, 'IMG6', 'tile_icon', 'game_1_resource', 'assets/images/tile.png', 'icon design for tile'),
-- (7, 'IMG7', 'title_card', 'homepage_resource', 'assets/images/title-card.png', 'web app title'),


-- -- Desserts
-- (8, 'CB_DESS_0', 'dessert-0', 'CB_icon', 'assets/cabinet/dessert-0.png', 'Dessert tile 0'),
-- (9, 'CB_DESS_1', 'dessert-1', 'CB_icon', 'assets/cabinet/dessert-1.png', 'Dessert tile 1'),
-- (10, 'CB_DESS_2', 'dessert-2', 'CB_icon', 'assets/cabinet/dessert-2.png', 'Dessert tile 2'),
-- (11, 'CB_DESS_3', 'dessert-3', 'CB_icon', 'assets/cabinet/dessert-3.png', 'Dessert tile 3'),
-- (12, 'CB_DESS_4', 'dessert-4', 'CB_icon', 'assets/cabinet/dessert-4.png', 'Dessert tile 4'),

-- -- Drinks
-- (13, 'CB_DRNK_0', 'drink-0', 'CB_icon', 'assets/cabinet/drink-0.png', 'Drink tile 0'),
-- (14, 'CB_DRNK_1', 'drink-1', 'CB_icon', 'assets/cabinet/drink-1.png', 'Drink tile 1'),
-- (15, 'CB_DRNK_2', 'drink-2', 'CB_icon', 'assets/cabinet/drink-2.png', 'Drink tile 2'),
-- (16, 'CB_DRNK_3', 'drink-3', 'CB_icon', 'assets/cabinet/drink-3.png', 'Drink tile 3'),
-- (17, 'CB_DRNK_4', 'drink-4', 'CB_icon', 'assets/cabinet/drink-4.png', 'Drink tile 4'),

-- -- Fruits
-- (18, 'CB_FRUT_0', 'fruit-0', 'CB_icon', 'assets/cabinet/fruit-0.png', 'Fruit tile 0'),
-- (19, 'CB_FRUT_1', 'fruit-1', 'CB_icon', 'assets/cabinet/fruit-1.png', 'Fruit tile 1'),
-- (20, 'CB_FRUT_2', 'fruit-2', 'CB_icon', 'assets/cabinet/fruit-2.png', 'Fruit tile 2'),
-- (21, 'CB_FRUT_3', 'fruit-3', 'CB_icon', 'assets/cabinet/fruit-3.png', 'Fruit tile 3'),
-- (22, 'CB_FRUT_4', 'fruit-4', 'CB_icon', 'assets/cabinet/fruit-4.png', 'Fruit tile 4'),

-- -- Mains
-- (23, 'CB_MAIN_0', 'main-0', 'CB_icon', 'assets/cabinet/main-0.png', 'Main dish tile 0'),
-- (24, 'CB_MAIN_1', 'main-1', 'CB_icon', 'assets/cabinet/main-1.png', 'Main dish tile 1'),
-- (25, 'CB_MAIN_2', 'main-2', 'CB_icon', 'assets/cabinet/main-2.png', 'Main dish tile 2'),
-- (26, 'CB_MAIN_3', 'main-3', 'CB_icon', 'assets/cabinet/main-3.png', 'Main dish tile 3'),
-- (27, 'CB_MAIN_4', 'main-4', 'CB_icon', 'assets/cabinet/main-4.png', 'Main dish tile 4'),

-- -- Tiles
-- (28, 'MG_TILE_0',  'tile-0',  'MG_tile', 'assets/cabinet/tile-0.png',  'Tile number 0'),
-- (29, 'MG_TILE_1',  'tile-1',  'MG_tile', 'assets/cabinet/tile-1.png',  'Tile number 1'),
-- (30, 'MG_TILE_2',  'tile-2',  'MG_tile', 'assets/cabinet/tile-2.png',  'Tile number 2'),
-- (31, 'MG_TILE_3',  'tile-3',  'MG_tile', 'assets/cabinet/tile-3.png',  'Tile number 3'),
-- (32, 'MG_TILE_4',  'tile-4',  'MG_tile', 'assets/cabinet/tile-4.png',  'Tile number 4'),
-- (33, 'MG_TILE_5',  'tile-5',  'MG_tile', 'assets/cabinet/tile-5.png',  'Tile number 5'),
-- (34, 'MG_TILE_6',  'tile-6',  'MG_tile', 'assets/cabinet/tile-6.png',  'Tile number 6'),
-- (35, 'MG_TILE_7',  'tile-7',  'MG_tile', 'assets/cabinet/tile-7.png',  'Tile number 7'),
-- (36, 'MG_TILE_8',  'tile-8',  'MG_tile', 'assets/cabinet/tile-8.png',  'Tile number 8'),
-- (37, 'MG_TILE_9',  'tile-9',  'MG_tile', 'assets/cabinet/tile-9.png',  'Tile number 9'),
-- (38, 'MG_TILE_10', 'tile-10', 'MG_tile', 'assets/cabinet/tile-10.png', 'Tile number 10'),
-- (39, 'MG_TILE_11', 'tile-11', 'MG_tile', 'assets/cabinet/tile-11.png', 'Tile number 11'),
-- (40, 'MG_TILE_12', 'tile-12', 'MG_tile', 'assets/cabinet/tile-12.png', 'Tile number 12'),
-- (41, 'MG_TILE_13', 'tile-13', 'MG_tile', 'assets/cabinet/tile-13.png', 'Tile number 13'),
-- (42, 'MG_TILE_14', 'tile-14', 'MG_tile', 'assets/cabinet/tile-14.png', 'Tile number 14'),
-- (43, 'MG_TILE_15', 'tile-15', 'MG_tile', 'assets/cabinet/tile-15.png', 'Tile number 15'),
-- (44, 'MG_TILE_16', 'tile-16', 'MG_tile', 'assets/cabinet/tile-16.png', 'Tile number 16'),
-- (45, 'MG_TILE_17', 'tile-17', 'MG_tile', 'assets/cabinet/tile-17.png', 'Tile number 17'),
-- (46, 'MG_TILE_18', 'tile-18', 'MG_tile', 'assets/cabinet/tile-18.png', 'Tile number 18'),
-- (47, 'MG_TILE_19', 'tile-19', 'MG_tile', 'assets/cabinet/tile-19.png', 'Tile number 19'),
-- (48, 'MG_TILE_20', 'tile-20', 'MG_tile', 'assets/cabinet/tile-20.png', 'Tile number 20'),
-- (49, 'MG_TILE_21', 'tile-21', 'MG_tile', 'assets/cabinet/tile-21.png', 'Tile number 21'),
-- (50, 'MG_TILE_22', 'tile-22', 'MG_tile', 'assets/cabinet/tile-22.png', 'Tile number 22'),
-- (51, 'MG_TILE_23', 'tile-23', 'MG_tile', 'assets/cabinet/tile-23.png', 'Tile number 23'),
-- (52, 'MG_TILE_24', 'tile-24', 'MG_tile', 'assets/cabinet/tile-24.png', 'Tile number 24'),
-- (53, 'MG_TILE_25', 'tile-25', 'MG_tile', 'assets/cabinet/tile-25.png', 'Tile number 25'),
-- (54, 'MG_TILE_26', 'tile-26', 'MG_tile', 'assets/cabinet/tile-26.png', 'Tile number 26'),
-- (55, 'MG_TILE_27', 'tile-27', 'MG_tile', 'assets/cabinet/tile-27.png', 'Tile number 27'),
-- (56, 'MG_TILE_28', 'tile-28', 'MG_tile', 'assets/cabinet/tile-28.png', 'Tile number 28'),
-- (57, 'MG_TILE_29', 'tile-29', 'MG_tile', 'assets/cabinet/tile-29.png', 'Tile number 29'),
-- (58, 'MG_TILE_30', 'tile-30', 'MG_tile', 'assets/cabinet/tile-30.png', 'Tile number 30'),
-- (59, 'MG_TILE_31', 'tile-31', 'MG_tile', 'assets/cabinet/tile-31.png', 'Tile number 31'),
-- (60, 'MG_TILE_32', 'tile-32', 'MG_tile', 'assets/cabinet/tile-32.png', 'Tile number 32'),
-- (61, 'MG_TILE_33', 'tile-33', 'MG_tile', 'assets/cabinet/tile-33.png', 'Tile number 33'),
-- (62, 'MG_TILE_34', 'tile-34', 'MG_tile', 'assets/cabinet/tile-34.png', 'Tile number 34'),
-- (63, 'MG_TILE_35', 'tile-35', 'MG_tile', 'assets/cabinet/tile-35.png', 'Tile number 35'),
-- (64, 'MG_TILE_36', 'tile-36', 'MG_tile', 'assets/cabinet/tile-36.png', 'Tile number 36'),
-- (65, 'MG_TILE_37', 'tile-37', 'MG_tile', 'assets/cabinet/tile-37.png', 'Tile number 37'),
-- (66, 'MG_TILE_38', 'tile-38', 'MG_tile', 'assets/cabinet/tile-38.png', 'Tile number 38'),
-- (67, 'MG_TILE_39', 'tile-39', 'MG_tile', 'assets/cabinet/tile-39.png', 'Tile number 39'),
-- (68, 'MG_TILE_40', 'tile-40', 'MG_tile', 'assets/cabinet/tile-40.png', 'Tile number 40'),
-- (69, 'MG_TILE_41', 'tile-41', 'MG_tile', 'assets/cabinet/tile-41.png', 'Tile number 41'),
-- (70, 'MG_TILE_42', 'tile-42', 'MG_tile', 'assets/cabinet/tile-42.png', 'Tile number 42'),
-- (71, 'MG_TILE_43', 'tile-43', 'MG_tile', 'assets/cabinet/tile-43.png', 'Tile number 43'),
-- (72, 'MG_TILE_44', 'tile-44', 'MG_tile', 'assets/cabinet/tile-44.png', 'Tile number 44'),
-- (73, 'MG_TILE_45', 'tile-45', 'MG_tile', 'assets/cabinet/tile-45.png', 'Tile number 45'),
-- (74, 'MG_TILE_46', 'tile-46', 'MG_tile', 'assets/cabinet/tile-46.png', 'Tile number 46'),
-- (75, 'MG_TILE_47', 'tile-47', 'MG_tile', 'assets/cabinet/tile-47.png', 'Tile number 47'),
-- (76, 'MG_TILE_48', 'tile-48', 'MG_tile', 'assets/cabinet/tile-48.png', 'Tile number 48'),
-- (77, 'MG_TILE_49', 'tile-49', 'MG_tile', 'assets/cabinet/tile-49.png', 'Tile number 49');










