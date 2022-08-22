import { CommandDeclaration } from 'src/models/command-declaration';

const loginCommand: CommandDeclaration<undefined, 'force' | 'verbose'> = {
  command: {
    command: 'session:login',
    describe: 'Đăng nhập vào trang đăng ký học bằng một phiên mới',
  },
  positionals: {},
  options: {
    force: {
      name: 'force',
      alias: 'f',
      describe: 'Thử lại đăng nhập đến khi được',
      type: 'boolean',
      default: false,
    },
    verbose: {
      name: 'verbose',
      alias: 'vv',
      describe: 'Hiển thị nhiều thông tin hơn',
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
