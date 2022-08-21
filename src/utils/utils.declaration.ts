import { CommandDeclaration } from 'src/models/command-declaration';

const clearCommand: CommandDeclaration<undefined, undefined> = {
  command: {
    command: 'clear',
    describe: 'Xoá màn hình',
  },
  positionals: {},
  options: {},
};

const exitCommand: CommandDeclaration<undefined, undefined> = {
  command: {
    command: 'exit',
    describe: 'Thoát',
  },
  positionals: {},
  options: {},
};

export const declaration: {
  clear: typeof clearCommand;
  exit: typeof exitCommand;
} = {
  clear: clearCommand,
  exit: exitCommand,
};
