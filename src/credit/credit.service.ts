import { load } from 'cheerio';
import { Endpoints } from 'src/constants/endpoints';
import { Subject } from 'src/models/subject';
import { SessionStoreService } from 'src/session/session-store.service';

import { Injectable } from '@nestjs/common';

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

  public async fetchCreditList(by: string): Promise<Subject[]> {
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

    return result;
  }

  public async select(id: number, force: boolean): Promise<void> {
    const jar = this.sessionStoreService.getCurrentSession().getCookieJar();
    let succeeded = false;

    do {
      const selectRes = await request(
        Endpoints.Select.replace('$', id.toString()),
        {
          method: 'POST',
          jar,
          json: true,
        },
      );

      if (selectRes.success) {
        succeeded = true;
        continue;
      }

      if (!selectRes.success && !force) throw new Error(selectRes.message);
    } while (force && !succeeded);
  }

  public async confirmSelections(): Promise<void> {
    const jar = this.sessionStoreService.getCurrentSession().getCookieJar();

    const confirmRes = await request(Endpoints.ConfirmRegistration, {
      method: 'POST',
      jar,
      json: true,
    });

    if (!confirmRes.success) throw new Error(confirmRes.message);
  }
}
