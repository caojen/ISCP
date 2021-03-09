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
