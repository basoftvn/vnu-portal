import { green, red, yellow } from 'chalk';
import { Command, Option, Positional } from 'nestjs-command';
import { replaceAt } from 'src/helpers/string';
import { Subject } from 'src/models/subject';

import { Injectable } from '@nestjs/common';

import { declaration } from './credit.declaration';
import { CreditService } from './credit.service';

import columnify = require('columnify');

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
    invalid: '',
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

      const filteredList: Subject[] = list
        .map((subject): Subject => {
          if (by === 'r') return subject;

          if (registrable && subject.invalid) return null;
          if (!registrable && !subject.invalid) return null;

          if (typeof name === 'string') {
            const index = subject.name.toUpperCase().indexOf(uName);

            if (index === -1) return null;

            subject.name = replaceAt(
              subject.name,
              index,
              green(subject.name.slice(index, index + uName.length)),
              uName.length,
            );
          }

          if (typeof code === 'string') {
            const index = subject.code.toUpperCase().indexOf(uCode);

            if (index === -1) return null;

            subject.code = replaceAt(
              subject.code,
              index,
              green(subject.code.slice(index, index + uCode.length)),
              uCode.length,
            );
          }

          if (typeof lecturer === 'string') {
            const indices = subject.lecturer.map((l) =>
              l.toUpperCase().indexOf(uLecturer),
            );

            if (!indices.find((i) => i !== -1)) return null;

            subject.lecturer = subject.lecturer.map((l, i) =>
              replaceAt(
                l,
                indices[i],
                green(l.slice(indices[i], indices[i] + uLecturer.length)),
                uLecturer.length,
              ),
            );
          }

          return subject;
        })
        .filter((s) => s);

      console.log(
        columnify(
          filteredList.slice(limit[0], limit[0] + limit[1]).map((subject) => ({
            ...subject,
            lecturer: subject.lecturer.join('\n'),
            schedule: subject.schedule.join('\n'),
          })),
          {
            columnSplitter: '|',
            maxLineWidth: process.stdout.getWindowSize()[0],
            headingTransform: (header) => CreditController.HEADER_MAP[header],
            columns: Object.keys(filteredList[0]).filter(
              (l) => l !== 'invalid',
            ),
            config: {
              lecturer: {
                preserveNewLines: true,
              },
              schedule: {
                preserveNewLines: true,
              },
            },
          },
        ),
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
    @Option(declaration.register.options.verbose)
    verbose: boolean,
  ): Promise<void> {
    try {
      if (force && verbose)
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
        [...creditIdSet].map((id) => this.creditService.select(id, force)),
      );

      await this.creditService.confirmSelections();

      console.log(
        `Đăng ký thành công [${green(result.filter((r) => r)).length}] lớp học`,
      );
    } catch (err) {
      if (verbose) console.error(red(err.message));

      console.error(red('Đăng ký học không thành công'));
    }
  }
}
