CREATE DATABASE `game_server`;
USE `game_server`;

DROP TABLE `account`;

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

--INSERT INTO `account` (username, password, email, state, expires, logincount, lastlogin, last_ip, auth_token)
--VALUES ('john_doe', 'password123', 'johndoe@example.com', 0, 0, 0, NOW(), '127.0.0.1', '');

INSERT INTO `account` (username, password, email, state, expires, logincount, lastlogin, last_ip, auth_token)
VALUES ('john_doe', SHA2(CONCAT('password123', 'your_unique_salt'), 512), 'johndoe@example.com', 0, 0, 0, NOW(), '127.0.0.1', '');


--
-- Table structure for table `player` TODO, this is not yet complete
--
CREATE TABLE IF NOT EXISTS `player` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `account_id` int(11) unsigned NOT NULL default '0',
  `name` varchar(30) NOT NULL DEFAULT '',
  `job` smallint(6) unsigned NOT NULL default '0',
  `base_level` smallint(6) unsigned NOT NULL default '1',
  `job_level` smallint(6) unsigned NOT NULL default '1',
  `base_exp` int(11) unsigned NOT NULL default '0',
  `job_exp` int(11) unsigned NOT NULL default '0',
  `money` int(11) unsigned NOT NULL default '0',
  `str` smallint(4) unsigned NOT NULL default '0',
  `agi` smallint(4) unsigned NOT NULL default '0',
  `vit` smallint(4) unsigned NOT NULL default '0',
  `int` smallint(4) unsigned NOT NULL default '0',
  `dex` smallint(4) unsigned NOT NULL default '0',
  `luk` smallint(4) unsigned NOT NULL default '0',
  `crit` smallint(4) unsigned NOT NULL default '0',
  `max_hp` int(11) unsigned NOT NULL default '0',
  `hp` int(11) unsigned NOT NULL default '0',
  `max_sp` int(11) unsigned NOT NULL default '0',
  `sp` int(11) unsigned NOT NULL default '0',
  `max_ap` int(11) unsigned NOT NULL default '0',
  `party_id` int(11) unsigned NOT NULL default '0',
  `elemental_id` int(11) unsigned NOT NULL default '0',
  `hair` tinyint(4) unsigned NOT NULL default '0',
  `hair_color` smallint(5) unsigned NOT NULL default '0',
  `clothes_color` smallint(5) unsigned NOT NULL default '0',
  `body` smallint(5) unsigned NOT NULL default '0',
  `weapon` smallint(6) unsigned NOT NULL default '0',
  `shield` smallint(6) unsigned NOT NULL default '0',
  `head_top` smallint(6) unsigned NOT NULL default '0',
  `head_mid` smallint(6) unsigned NOT NULL default '0',
  `head_bottom` smallint(6) unsigned NOT NULL default '0',
  `robe` SMALLINT(6) UNSIGNED NOT NULL DEFAULT '0',
  `last_map` varchar(11) NOT NULL default '',
  `last_x` smallint(4) unsigned NOT NULL default '0',
  `last_y` smallint(4) unsigned NOT NULL default '0',
  `save_map` varchar(11) NOT NULL default '',
  `save_x` smallint(4) unsigned NOT NULL default '0',
  `save_y` smallint(4) unsigned NOT NULL default '0',
  `sex` ENUM('M','F') NOT NULL,
  `last_login` datetime DEFAULT NULL,

  PRIMARY KEY  (`id`),
  UNIQUE KEY `name_key` (`name`),
  KEY `account_id` (`account_id`),
  KEY `party_id` (`party_id`)
) AUTO_INCREMENT=1;
