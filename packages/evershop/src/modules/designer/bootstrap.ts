import path from 'path';
import { registerJob } from '../../lib/cronjob/jobManager.js';

export default function bootstrap() {
  registerJob({
    name: 'designerReleaseCommissions',
    schedule: '15 2 * * *',
    resolve: path.resolve(import.meta.dirname, 'jobs', 'releaseCommissions.js'),
    enabled: true
  });
  registerJob({
    name: 'designerMonthlyBonus',
    schedule: '30 2 1 * *',
    resolve: path.resolve(import.meta.dirname, 'jobs', 'monthlyBonus.js'),
    enabled: true
  });
}
