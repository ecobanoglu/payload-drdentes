import * as migration_20261117_142905_initial from './20261117_142905_initial';
import * as migration_20261117_150320_email_verification from './20261117_150320_email_verification';
import * as migration_20261117_151943_nested_pages from './20261117_151943_nested_pages';

export const migrations = [
  {
    up: migration_20261117_142905_initial.up,
    down: migration_20261117_142905_initial.down,
    name: '20261117_142905_initial',
  },
  {
    up: migration_20261117_150320_email_verification.up,
    down: migration_20261117_150320_email_verification.down,
    name: '20261117_150320_email_verification',
  },
  {
    up: migration_20261117_151943_nested_pages.up,
    down: migration_20261117_151943_nested_pages.down,
    name: '20261117_151943_nested_pages'
  },
];
