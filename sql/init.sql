create table if not exists `iscp`.`school` (
  `sid` integer not null auto_increment,
  `name` varchar(128) not null,
  primary key (`sid`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

create table if not exists `iscp`.`user` (
  `uid` integer not null auto_increment,
  `username` varchar(64) not null,
  `password` varchar(1024) not null,
  `usertype` enum('admin', 'user') not null default 'user',
  `sid` integer not null,
  `name` varchar(64) not null,
  primary key (`uid`),
  unique index `user_username_unique_index` (`username` asc),
  constraint `user_sid_ref_school_sid`
    foreign key (`sid`)
    references `school` (`sid`)
    on delete cascade
    on update cascade
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

create table if not exists `iscp`.`contest` (
  `cid` integer not null auto_increment,
  `title` varchar(128) not null,
  `due` datetime not null,
  `code` varchar(64) not null,
  `config` varchar(1024) not null,
  primary key `contest` (`cid`),
  unique index `contest_code_unique` (`code`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

create table if not exists `iscp`.`enroll` (
  `eid` integer not null auto_increment,
  `uid` integer not null,
  `cid` integer not null,
  `detail` text not null,
  primary key `enroll` (`eid`),
  constraint `enroll_uid_ref_user_uid`
    foreign key (`uid`)
    references `user` (`uid`)
    on delete cascade
    on update cascade,
  constraint `enroll_cid_ref_contest_cid`
    foreign key (`cid`)
    references `contest` (`cid`)
    on delete cascade
    on update cascade
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;
