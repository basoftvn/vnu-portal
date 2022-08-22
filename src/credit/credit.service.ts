import { load } from 'cheerio';
import { Endpoints } from 'src/constants/endpoints';
import { wait } from 'src/helpers/wait';
import { Subject } from 'src/models/subject';
import { SessionStoreService } from 'src/session/session-store.service';

import { Injectable } from '@nestjs/common';

import request = require('request-promise-native');

@Injectable()
export class CreditService {
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
      const $row = $raw(row);
      const cells = $row.find('td');

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
        lecturer: [
          ...new Set(
            (
              $raw(cells[by === 'r' ? 4 : 7])
                .text()
                .trim() ?? ''
            ).split(/,\s*/),
          ),
        ],
        fee:
          by === 'r'
            ? -1
            : +($raw(cells[8]).text().trim().replace(/\D/g, '') || '0'),
        schedule: [
          ...new Set(
            (
              $raw(cells[by === 'r' ? 5 : 9])
                .text()
                .trim() ?? ''
            ).split(/,\s*/),
          ),
        ],
        invalid: false,
      };

      if (subject.id === -1) subject.invalid = true;
      if ($row.attr('title')?.includes('bị trùng lịch học'))
        subject.invalid = true;

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

      await wait();
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
