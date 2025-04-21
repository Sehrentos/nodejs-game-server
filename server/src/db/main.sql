-- MariaDB/MySQL database
CREATE DATABASE IF NOT EXISTS `game_server`;

USE `game_server`;

-- Drop the table if it exists
-- and create the table again
DROP TABLE IF EXISTS `account`;

--
-- Table structure for table `account`
-- For SHA256, a varchar(64) would be sufficient
--
CREATE TABLE IF NOT EXISTS `account` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `username` varchar(30) NOT NULL default '',
  `password` varchar(130) NOT NULL default '',
  `email` varchar(40) NOT NULL default '',
  `state` int(11) unsigned NOT NULL default '0',
  `expires` int(11) unsigned NOT NULL default '0',
  `logincount` mediumint(9) unsigned NOT NULL default '0',
  `lastlogin` datetime,
  `last_ip` varchar(100) NOT NULL default '',
  `auth_token` varchar(2048) DEFAULT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `auth_token` (`auth_token`),
  KEY `name` (`username`)
);

--
-- Dumping data for table `account`
--
INSERT INTO `account` (username, password, email, state, expires, logincount, lastlogin, last_ip, auth_token)
VALUES ('tester', SHA2(CONCAT('password123', 'your_unique_salt'), 512), 'tester@example.com', 0, 0, 0, NOW(), '127.0.0.1', '');

-- Drop the table if it exists
-- and create the table again
DROP TABLE IF EXISTS `player`;

--
-- Table structure for table `player`
--
CREATE TABLE IF NOT EXISTS `player` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `account_id` int(11) unsigned NOT NULL default '0',
  `name` varchar(30) NOT NULL DEFAULT '',
  `base_level` smallint(6) unsigned NOT NULL default '1',
  `base_exp` int(11) unsigned NOT NULL default '0',
  `job` smallint(6) unsigned NOT NULL default '0',
  `job_level` smallint(6) unsigned NOT NULL default '1',
  `job_exp` int(11) unsigned NOT NULL default '0',
  `money` int(11) unsigned NOT NULL default '0',
  `str` smallint(4) unsigned NOT NULL default '0',
  `agi` smallint(4) unsigned NOT NULL default '0',
  `vit` smallint(4) unsigned NOT NULL default '0',
  `int` smallint(4) unsigned NOT NULL default '0',
  `dex` smallint(4) unsigned NOT NULL default '0',
  `luk` smallint(4) unsigned NOT NULL default '0',
  `hp` int(11) unsigned NOT NULL default '0',
  `hp_max` int(11) unsigned NOT NULL default '0',
  `mp` int(11) unsigned NOT NULL default '0',
  `mp_max` int(11) unsigned NOT NULL default '0',
  `party_id` int(11) unsigned NOT NULL default '0',
  `last_map` varchar(50) NOT NULL default '',
  `last_x` smallint(4) unsigned NOT NULL default '0',
  `last_y` smallint(4) unsigned NOT NULL default '0',
  `save_map` varchar(50) NOT NULL default '',
  `save_x` smallint(4) unsigned NOT NULL default '0',
  `save_y` smallint(4) unsigned NOT NULL default '0',
  `sex` smallint(1) unsigned NOT NULL default '0',
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `name_key` (`name`),
  KEY `account_id` (`account_id`),
  KEY `party_id` (`party_id`)
) AUTO_INCREMENT=1;

--
-- Table structure for table `inventory`
--
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `item_id` int(11) unsigned NOT NULL default '0',
  `player_id` int(11) unsigned NOT NULL default '0',
  `amount` smallint(4) unsigned NOT NULL default '0',
  `slot` smallint(4) unsigned NOT NULL default '0',
  PRIMARY KEY  (`id`),
  KEY `player_id` (`player_id`),
  KEY `item_id` (`item_id`)
) AUTO_INCREMENT=1;

