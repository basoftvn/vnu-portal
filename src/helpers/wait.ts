import { sleep } from './sleep';
import { bySeconds } from './timespan';

export async function wait(): Promise<void> {
  await sleep(Math.random() * bySeconds(3) + bySeconds(2));
}
