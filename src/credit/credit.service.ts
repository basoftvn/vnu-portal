import { green } from 'chalk';
import { load } from 'cheerio';
import { Command, Option } from 'nestjs-command';
import { Endpoints } from 'src/constants/endpoints';
import { Subject } from 'src/models/subject';
import { SessionStoreService } from 'src/session/session-store.service';

import { Injectable } from '@nestjs/common';

import columnify = require('columnify');
import request = require('request-promise-native');
@Injectable()
export class CreditService {
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

  public constructor(
    private readonly sessionStoreService: SessionStoreService,
  ) {}

  @Command({
    command: 'credit:list',
    describe: 'Liệt kê các môn học',
  })
  public async listCredits(
    @Option({
      name: 'by',
      alias: 'b',
      describe: 'Liệt kê các môn theo s(ngành)/a(toàn trường)/r(đã đăng ký)',
      type: 'string',
      choices: ['s', 'a', 'r'],
      default: 'a',
    })
    by: string,
    @Option({
      name: 'name',
      alias: 'n',
      describe: 'Tên môn học (không áp dụng cho đã đăng ký)',
      type: 'string',
    })
    name: string,
    @Option({
      name: 'code',
      alias: 'c',
      describe: 'Mã lớp học (không áp dụng cho đã đăng ký)',
      type: 'string',
    })
    code: string,
    @Option({
      name: 'lecturer',
      alias: 'l',
      describe: 'Tên giảng viên (không áp dụng cho đã đăng ký)',
      type: 'string',
    })
    lecturer: string,
    @Option({
      name: 'limit',
      alias: 'lm',
      describe: 'Giới hạn số lượng môn học được in ra (start-count)',
      type: 'string',
      default: '0-9999',
    })
    _limit: string,
  ): Promise<void> {
    if (!_limit.match(/^\d+\-\d+$/)) {
      console.error('Giới hạn không hợp lệ');
      return;
    }

    const limit = _limit.split('-').map(Number);

    const endpoint = Endpoints[`ListBy${by.toUpperCase()}`];

    const raw = await request(endpoint, {
      method: 'POST',
      jar: this.sessionStoreService.getCurrentSession().getCookieJar(),
    });

    const $raw = load(`<table>${raw}</table>`);

    const rows = [...$raw('tr')];

    const result: Subject[] = [];

    for (const row of rows) {
      const cells = $raw(row).find('td');

      const subject: Subject = {
        id:
          by === 'r'
            ? -1
            : +($raw(cells[0]).find('input')?.attr('data-rowindex') ?? -1),
        name:
          $raw(cells[1])
            .text()
            .trim()
            .replace(/(\s\s+)/g, ' ') ?? '',
        creditCount: +$raw(cells[2]).text().trim() ?? 0,
        code:
          $raw(cells[by === 'r' ? 3 : 4])
            .text()
            .trim()
            .replace(/(\s\s+)/g, ' ') ?? '',
        maxSlots: by === 'r' ? -1 : +$raw(cells[5]).text().trim() ?? 0,
        currentSlots: by === 'r' ? -1 : +$raw(cells[6]).text().trim() ?? 0,
        lecturer:
          $raw(cells[by === 'r' ? 4 : 7])
            .text()
            .trim() ?? '',
        fee:
          by === 'r'
            ? -1
            : +($raw(cells[8]).text().trim().replace(/\D/g, '') || '0'),
        schedule:
          $raw(cells[by === 'r' ? 5 : 9])
            .text()
            .trim() ?? '',
      };

      result.push(subject);
    }

    const uName = name?.toUpperCase();
    const uCode = code?.toUpperCase();
    const uLecturer = lecturer?.toUpperCase();

    const filteredResult: Subject[] = result.filter((subject) => {
      if (by === 'r') return true;

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
      columnify(filteredResult.slice(limit[0], limit[0] + limit[1]), {
        columnSplitter: '|',
        maxLineWidth: process.stdout.getWindowSize()[0],
        headingTransform: (header) => CreditService.HEADER_MAP[header],
      }),
    );

    if (by === 'r')
      console.log(
        `Tổng số tín: ${green(
          `[${result.reduce((a, b) => a + b.creditCount, 0)}]`,
        )}`,
      );
  }
}
