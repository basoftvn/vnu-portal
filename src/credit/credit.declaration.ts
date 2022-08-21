import { CommandDeclaration } from 'src/models/command-declaration';

const listCommand: CommandDeclaration<
  undefined,
  'by' | 'name' | 'code' | 'lecturer' | 'registrable' | 'limit'
> = {
  command: {
    command: 'credit:list',
    describe: 'Liệt kê các môn học',
  },
  positionals: {},
  options: {
    by: {
      name: 'by',
      alias: 'b',
      describe: 'Liệt kê các môn theo s(ngành)/a(toàn trường)/r(đã đăng ký)',
      type: 'string',
      choices: ['s', 'a', 'r'],
      default: 'a',
    },
    name: {
      name: 'name',
      alias: 'n',
      describe: 'Tên môn học (không áp dụng cho đã đăng ký)',
      type: 'string',
    },
    code: {
      name: 'code',
      alias: 'c',
      describe: 'Mã lớp học (không áp dụng cho đã đăng ký)',
      type: 'string',
    },
    lecturer: {
      name: 'lecturer',
      alias: 'l',
      describe: 'Tên giảng viên (không áp dụng cho đã đăng ký)',
      type: 'string',
    },
    registrable: {
      name: 'registrable',
      alias: 'r',
      describe:
        'Lọc những lớp có thể đăng ký hay không (không áp dụng cho đã đăng ký)',
      type: 'boolean',
      default: undefined,
    },
    limit: {
      name: 'limit',
      alias: 'lm',
      describe: 'Giới hạn số lượng môn học được in ra (start-count)',
      type: 'string',
      default: '0-9999',
    },
  },
};

const registerCommand: CommandDeclaration<'creditIds', 'force'> = {
  command: {
    command: 'credit:register <creditIds...>',
    describe: 'Đăng ký môn học',
  },
  positionals: {
    creditIds: {
      name: 'creditIds',
      describe: 'ID của môn học',
      type: 'number',
    },
  },
  options: {
    force: {
      name: 'force',
      alias: 'f',
      describe: 'Thử đăng ký tới khi được',
      type: 'boolean',
      default: false,
    },
  },
};

export const declaration: {
  list: typeof listCommand;
  register: typeof registerCommand;
} = {
  list: listCommand,
  register: registerCommand,
};
