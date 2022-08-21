import { red, yellow, green } from 'chalk';
import { Command, Option, Positional } from 'nestjs-command';
import { Subject } from 'src/models/subject';

import { Injectable } from '@nestjs/common';

import columnify = require('columnify');
import { CreditService } from './credit.service';
import { declaration } from './credit.declaration';

@Injectable()
export class CreditController {
  private static readonly HEADER_MAP: Record<keyof Subject, string> = {
    id: 'ID',
    name: 'Tên môn học',
    creditCount: 'Số tín',
    code: 'Mã lớp',
    maxSlots: 'Tổng SV',
    currentSlots: 'Đã ĐK',
    lecturer: 'Giảng viên',
    fee: 'Học phí',
    schedule: 'Lịch học',
  };

  public constructor(private readonly creditService: CreditService) {}

  @Command(declaration.list.command)
  public async listCredits(
    @Option(declaration.list.options.by)
    by: string,
    @Option(declaration.list.options.name)
    name: string,
    @Option(declaration.list.options.code)
    code: string,
    @Option(declaration.list.options.code)
    lecturer: string,
    @Option(declaration.list.options.registrable)
    registrable: boolean,
    @Option(declaration.list.options.limit)
    _limit: string,
  ): Promise<void> {
    try {
      if (!_limit.match(/^\d+\-\d+$/)) {
        console.error('Giới hạn không hợp lệ');
        return;
      }

      const limit = _limit.split('-').map(Number);

      const list = await this.creditService.fetchCreditList(by);

      const uName = name?.toUpperCase();
      const uCode = code?.toUpperCase();
      const uLecturer = lecturer?.toUpperCase();

      const filteredList: Subject[] = list.filter((subject) => {
        if (by === 'r') return true;

        if (registrable === true && subject.id === -1) return false;
        if (registrable === false && subject.id !== -1) return false;

        if (
          typeof name === 'string' &&
          !subject.name.toUpperCase().includes(uName)
        )
          return false;

        if (
          typeof code === 'string' &&
          !subject.code.toUpperCase().includes(uCode)
        )
          return false;

        if (
          typeof lecturer === 'string' &&
          !subject.lecturer.toUpperCase().includes(uLecturer)
        )
          return false;

        return true;
      });

      console.log(
        columnify(filteredList.slice(limit[0], limit[0] + limit[1]), {
          columnSplitter: '|',
          maxLineWidth: process.stdout.getWindowSize()[0],
          headingTransform: (header) => CreditController.HEADER_MAP[header],
        }),
      );

      if (by === 'r')
        console.log(
          `Tổng số tín: [${green(
            list.reduce((a, b) => a + b.creditCount, 0),
          )}]`,
        );
    } catch (err) {
      console.error(red(err.message));
    }
  }

  @Command(declaration.register.command)
  public async registerCredits(
    @Positional(declaration.register.positionals.creditIds)
    creditIds: number[],
    @Option(declaration.register.options.force)
    force: boolean,
  ): Promise<void> {
    try {
      if (force)
        console.log(
          yellow(
            'Bạn đã sử dụng flag --force, đăng kí học sẽ được thử đến khi đăng kí được',
          ),
        );

      console.log(yellow('Kiểm tra các Id môn học'));

      for (const id of creditIds)
        if (Number.isNaN(id)) {
          console.error('Id không hợp lệ');
          return;
        }

      const creditIdSet = new Set(creditIds);
      const tmpCreditIdSet = new Set(creditIdSet);

      const list = await this.creditService.fetchCreditList('a');

      for (const subject of list)
        if (tmpCreditIdSet.has(subject.id)) tmpCreditIdSet.delete(subject.id);

      if (tmpCreditIdSet.size !== 0) {
        console.error(
          `Id môn học không tồn tại: ${[...tmpCreditIdSet].join(', ')}`,
        );

        return;
      }

      console.log(green('Tất cả các Id hợp lệ'));

      const result = await Promise.all(
        [...creditIdSet].map((id) =>
          this.creditService.registerCredit(id, force),
        ),
      );

      console.log(
        `Đăng ký thành công [${green(result.filter((r) => r)).length}] lớp học`,
      );
    } catch (err) {
      console.error(red(err.message));
    }
  }
}
