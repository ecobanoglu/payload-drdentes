import * as migration_20261117_142905_initial from './20261117_142905_initial';
import * as migration_20261117_150320_email_verification from './20261117_150320_email_verification';
import * as migration_20261117_151943_nested_pages from './20261117_151943_nested_pages';
import * as migration_20261117_155552_scene3d_hero from './20261117_155552_scene3d_hero';
import * as migration_20261117_161023_card_sets from './20261117_161023_card_sets';
import * as migration_20261117_161233_card_title_optional_locales from './20261117_161233_card_title_optional_locales';
import * as migration_20261117_174443_media_storage_prefix from './20261117_174443_media_storage_prefix';
import * as migration_20261117_192931_product_site from './20261117_192931_product_site';
import * as migration_20261117_205719_site_content_fields from './20261117_205719_site_content_fields';
import * as migration_20261117_212503_hero_video from './20261117_212503_hero_video';

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
    name: '20261117_151943_nested_pages',
  },
  {
    up: migration_20261117_155552_scene3d_hero.up,
    down: migration_20261117_155552_scene3d_hero.down,
    name: '20261117_155552_scene3d_hero',
  },
  {
    up: migration_20261117_161023_card_sets.up,
    down: migration_20261117_161023_card_sets.down,
    name: '20261117_161023_card_sets',
  },
  {
    up: migration_20261117_161233_card_title_optional_locales.up,
    down: migration_20261117_161233_card_title_optional_locales.down,
    name: '20261117_161233_card_title_optional_locales',
  },
  {
    up: migration_20261117_174443_media_storage_prefix.up,
    down: migration_20261117_174443_media_storage_prefix.down,
    name: '20261117_174443_media_storage_prefix',
  },
  {
    up: migration_20261117_192931_product_site.up,
    down: migration_20261117_192931_product_site.down,
    name: '20261117_192931_product_site',
  },
  {
    up: migration_20261117_205719_site_content_fields.up,
    down: migration_20261117_205719_site_content_fields.down,
    name: '20261117_205719_site_content_fields',
  },
  {
    up: migration_20261117_212503_hero_video.up,
    down: migration_20261117_212503_hero_video.down,
    name: '20261117_212503_hero_video'
  },
];
