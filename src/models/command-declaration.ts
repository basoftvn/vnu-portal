import {
  CommandOption,
  CommandPositionalOption,
  CommandOptionsOption,
} from 'nestjs-command';

export type CommandDeclaration<
  PositionalNames extends string,
  OptionNames extends string,
> = {
  command: CommandOption;
  positionals: Record<PositionalNames, CommandPositionalOption>;
  options: Record<OptionNames, CommandOptionsOption>;
};
