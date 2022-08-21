import { CommandDeclaration } from 'src/models/command-declaration';

const loginCommand: CommandDeclaration<'username' | 'password', 'force'> = {
  command: {
    command: 'session:login <username> <password>',
    describe: 'Đăng nhập vào trang đăng ký học bằng một phiên mới',
  },
  positionals: {
    username: {
      name: 'username',
      alias: 'u',
      describe: 'Tên đăng nhập (mã số sinh viên)',
      type: 'string',
    },
    password: {
      name: 'password',
      alias: 'p',
      describe: 'Mật khẩu',
      type: 'string',
    },
  },
  options: {
    force: {
      name: 'force',
      alias: 'f',
      describe: 'Thử lại đăng nhập đến khi được',
      type: 'boolean',
      default: false,
    },
  },
};

export const declaration: {
  login: typeof loginCommand;
} = {
  login: loginCommand,
};
