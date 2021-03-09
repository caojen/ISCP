export class User {
  uid?: number;
  username?: string;
  password?: string;    // 不应该直接展示数据库的内容
  name?: string;
  school?: School;
  usertype?: 'admin' | 'user';
  sessionId?: string;
};

export class School {
  sid?: number;
  name?: string;
};

export class RegisterBody {
  username: string;
  password: string;
  name: string;
  school: string;
}
