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
import * as migration_20261118_125956_hero_showcase from './20261118_125956_hero_showcase';
import * as migration_20261118_131608_hero_showcase_screens from './20261118_131608_hero_showcase_screens';
import * as migration_20261118_132731_hero_tag_icons from './20261118_132731_hero_tag_icons';
import * as migration_20261119_085422_cards_layout from './20261119_085422_cards_layout';
import * as migration_20261119_102011_hero_brand_button from './20261119_102011_hero_brand_button';
import * as migration_20261119_102743_cards_background from './20261119_102743_cards_background';
import * as migration_20261119_103843_cards_limit from './20261119_103843_cards_limit';

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
    name: '20261117_212503_hero_video',
  },
  {
    up: migration_20261118_125956_hero_showcase.up,
    down: migration_20261118_125956_hero_showcase.down,
    name: '20261118_125956_hero_showcase',
  },
  {
    up: migration_20261118_131608_hero_showcase_screens.up,
    down: migration_20261118_131608_hero_showcase_screens.down,
    name: '20261118_131608_hero_showcase_screens',
  },
  {
    up: migration_20261118_132731_hero_tag_icons.up,
    down: migration_20261118_132731_hero_tag_icons.down,
    name: '20261118_132731_hero_tag_icons',
  },
  {
    up: migration_20261119_085422_cards_layout.up,
    down: migration_20261119_085422_cards_layout.down,
    name: '20261119_085422_cards_layout',
  },
  {
    up: migration_20261119_102011_hero_brand_button.up,
    down: migration_20261119_102011_hero_brand_button.down,
    name: '20261119_102011_hero_brand_button',
  },
  {
    up: migration_20261119_102743_cards_background.up,
    down: migration_20261119_102743_cards_background.down,
    name: '20261119_102743_cards_background',
  },
  {
    up: migration_20261119_103843_cards_limit.up,
    down: migration_20261119_103843_cards_limit.down,
    name: '20261119_103843_cards_limit'
  },
];
