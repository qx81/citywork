CREATE DATABASE IF NOT EXISTS city_life_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE city_life_platform;

CREATE TABLE IF NOT EXISTS user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '昵称',
  phone VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
  password VARCHAR(100) NOT NULL COMMENT '密码',
  avatar VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像',
  address VARCHAR(255) NOT NULL DEFAULT '' COMMENT '地址',
  bio VARCHAR(255) NOT NULL DEFAULT '' COMMENT '个人简介',
  city VARCHAR(50) NOT NULL DEFAULT '杭州' COMMENT '所在城市',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_city(city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS skill_service (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT '家政',
  price DECIMAL(10,2) NOT NULL,
  price_unit ENUM('hour','time') NOT NULL DEFAULT 'hour',
  service_area VARCHAR(100) NOT NULL DEFAULT '',
  service_time VARCHAR(100) NOT NULL DEFAULT '',
  images VARCHAR(1000) NOT NULL DEFAULT '',
  is_recommend TINYINT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_skill_user(user_id),
  INDEX idx_skill_category(category),
  INDEX idx_skill_area(service_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能服务表';

CREATE TABLE IF NOT EXISTS second_hand (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  condition_level VARCHAR(20) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  images VARCHAR(1000) NOT NULL DEFAULT '',
  is_recommend TINYINT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_second_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_second_user(user_id),
  INDEX idx_second_price(price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二手闲置表';

CREATE TABLE IF NOT EXISTS play_together (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  play_type VARCHAR(50) NOT NULL,
  play_time DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  budget DECIMAL(10,2) NOT NULL,
  max_people INT NOT NULL,
  current_people INT NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_play_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_play_user(user_id),
  INDEX idx_play_time(play_time),
  INDEX idx_play_distance(distance_km)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='线下约玩表';

CREATE TABLE IF NOT EXISTS local_business (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  score DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  recommend_reason VARCHAR(255) NOT NULL,
  avg_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  images VARCHAR(1000) NOT NULL DEFAULT '',
  likes INT NOT NULL DEFAULT 0,
  is_recommend TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_business_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_business_score(score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='本地商家表';

CREATE TABLE IF NOT EXISTS `order` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  content_id BIGINT NOT NULL,
  content_type ENUM('skill','second_hand','play') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0待支付 1已支付 2待完成 3已完成 4已取消',
  service_time DATETIME NULL,
  remark VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_order_user(user_id),
  INDEX idx_order_content(content_type, content_id),
  INDEX idx_order_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

CREATE TABLE IF NOT EXISTS collection (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content_id BIGINT NOT NULL,
  content_type ENUM('skill','second_hand','play','business') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_collection_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE KEY uk_collection(user_id, content_id, content_type),
  INDEX idx_collection_user(user_id),
  INDEX idx_collection_type(content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

INSERT INTO user(username, phone, password, city, bio) VALUES
('小王', '13800000001', '123456', '杭州', '擅长家电维修'),
('小李', '13800000002', '123456', '杭州', '二手好物搬运工'),
('阿宁', '13800000003', '123456', '杭州', '喜欢桌游和露营'),
('店主A', '13800000004', '123456', '杭州', '本地美食推荐'),
('小周', '13800000005', '123456', '杭州', '摄影师');

INSERT INTO skill_service(user_id,title,description,category,price,price_unit,service_area,service_time,is_recommend) VALUES
(1,'空调清洗','上门清洗挂机/柜机', '家政', 120.00, 'time', '杭州市西湖区', '周末全天',1),
(5,'人像摄影','提供外景拍摄与修图', '摄影', 199.00, 'hour', '杭州市滨江区', '工作日晚间',1),
(1,'电脑系统重装','支持Win/Mac基础维护', '维修', 88.00, 'time', '杭州市拱墅区', '每天18:00后',0),
(5,'短视频剪辑','企业宣传片剪辑', '设计', 150.00, 'hour', '杭州市上城区', '可预约',0),
(1,'家电安装','灯具、窗帘、电视安装', '安装', 99.00, 'time', '杭州市余杭区', '周一到周日',1);

INSERT INTO second_hand(user_id,title,description,original_price,price,condition_level,pickup_address,contact_phone,is_recommend) VALUES
(2,'九成新山地车','学生代步，正常骑行',1200,680,'9成新','西湖区古墩路','13800000002',1),
(2,'iPad 9代','仅学习使用，无维修',2999,1800,'95新','滨江区江南大道','13800000002',1),
(5,'佳能入门相机','含18-55镜头',3500,2200,'8成新','上城区解放路','13800000005',0),
(1,'办公椅','人体工学，坐感舒适',699,260,'8成新','拱墅区湖州街','13800000001',0),
(3,'露营帐篷','双人防雨帐篷',499,280,'9成新','余杭区仓前街道','13800000003',1);

INSERT INTO play_together(user_id,title,play_type,play_time,location,distance_km,budget,max_people,current_people,description) VALUES
(3,'周六羽毛球局','打球','2026-03-12 19:00:00','滨江体育馆',3.2,35,8,4,'新手友好，拍子可借'),
(3,'桌游德州体验','桌游','2026-03-10 20:00:00','拱墅区桌游吧',5.8,50,6,2,'会有基础教学'),
(1,'周末露营','露营','2026-03-20 10:00:00','良渚郊野公园',12.5,120,10,5,'AA拼车拼餐'),
(5,'Citywalk摄影','徒步','2026-03-08 14:00:00','西湖断桥',2.1,0,12,6,'边走边拍'),
(2,'飞盘新手局','飞盘','2026-03-09 16:00:00','钱江世纪公园',4.4,20,14,7,'装备自备');

INSERT INTO local_business(user_id,name,address,score,recommend_reason,avg_cost,likes,is_recommend) VALUES
(4,'阿福面馆','西湖区文三路88号',4.8,'汤头香浓，分量足',28,65,1),
(4,'老街烧烤','拱墅区运河广场',4.6,'夜宵氛围好',68,40,1),
(4,'星野咖啡','滨江区物联网街',4.7,'适合办公约谈',45,52,1),
(4,'江南小馆','上城区河坊街',4.5,'杭帮菜性价比高',62,30,0),
(4,'拾光甜品','余杭区未来科技城',4.9,'拍照出片，口味稳定',39,74,1);

INSERT INTO `order`(order_no,user_id,content_id,content_type,amount,status,service_time,remark) VALUES
('CW20260228001',1,1,'skill',120,0,'2026-03-01 10:00:00','请自带工具'),
('CW20260228002',2,2,'second_hand',1800,1,NULL,'当面验机'),
('CW20260228003',3,1,'play',35,2,'2026-03-12 19:00:00','已组队'),
('CW20260228004',5,3,'second_hand',2200,3,NULL,'已自提完成'),
('CW20260228005',1,4,'play',0,4,'2026-03-08 14:00:00','临时有事取消');

INSERT INTO collection(user_id,content_id,content_type) VALUES
(1,1,'skill'),
(1,2,'second_hand'),
(2,1,'business'),
(3,3,'play'),
(5,4,'skill');
