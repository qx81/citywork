-- 创建数据库
CREATE DATABASE IF NOT EXISTS city_life_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE city_life_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像',
  `address` VARCHAR(255) DEFAULT '' COMMENT '地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 技能服务表
CREATE TABLE IF NOT EXISTS `skill_service` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '技能服务ID',
  `user_id` INT NOT NULL COMMENT '发布用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT NOT NULL COMMENT '描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `category` VARCHAR(50) NOT NULL COMMENT '分类',
  `images` VARCHAR(500) DEFAULT '' COMMENT '图片',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-可接单，0-不可接单',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能服务表';

-- 二手闲置表
CREATE TABLE IF NOT EXISTS `second_hand` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '二手闲置ID',
  `user_id` INT NOT NULL COMMENT '发布用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT NOT NULL COMMENT '描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `category` VARCHAR(50) NOT NULL COMMENT '分类',
  `images` VARCHAR(500) DEFAULT '' COMMENT '图片',
  `pickup_address` VARCHAR(255) NOT NULL COMMENT '自提地址',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-在售，0-已售出',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二手闲置表';

-- 约玩表
CREATE TABLE IF NOT EXISTS `play_together` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '约玩ID',
  `user_id` INT NOT NULL COMMENT '发布用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT NOT NULL COMMENT '描述',
  `time` DATETIME NOT NULL COMMENT '时间',
  `location` VARCHAR(255) NOT NULL COMMENT '地点',
  `budget` DECIMAL(10,2) NOT NULL COMMENT 'AA预算',
  `max_people` INT NOT NULL COMMENT '最大人数',
  `current_people` INT DEFAULT 1 COMMENT '当前人数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-招募中，0-已结束',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='约玩表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `user_id` INT NOT NULL COMMENT '下单用户ID',
  `service_id` INT NOT NULL COMMENT '服务ID（技能/二手）',
  `service_type` TINYINT NOT NULL COMMENT '服务类型：1-技能服务，2-二手闲置',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `status` TINYINT NOT NULL COMMENT '状态：0-待支付，1-已支付，2-待完成，3-已完成',
  `address` VARCHAR(255) DEFAULT '' COMMENT '服务地址',
  `remark` VARCHAR(255) DEFAULT '' COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 为手机号添加唯一索引
CREATE UNIQUE INDEX idx_user_phone ON `user`(`phone`);

-- 为订单表添加服务ID和类型的复合索引
CREATE INDEX idx_order_service ON `order`(`service_id`, `service_type`);

-- 为技能服务表添加分类索引
CREATE INDEX idx_skill_category ON `skill_service`(`category`);

-- 为二手闲置表添加分类索引
CREATE INDEX idx_second_hand_category ON `second_hand`(`category`);

-- 为约玩表添加时间索引
CREATE INDEX idx_play_together_time ON `play_together`(`time`);