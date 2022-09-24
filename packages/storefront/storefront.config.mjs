import fs from 'fs';
import { resolve as resolvePath } from 'path';
import config from '@cloudcommerce/config';

const getEnvVar = (name) => {
  return import.meta.env?.[name] || process.env[name];
};

export default () => {
  const STOREFRONT_BASE_DIR = getEnvVar('STOREFRONT_BASE_DIR');
  const VITE_ECOM_STORE_ID = getEnvVar('VITE_ECOM_STORE_ID');

  let baseDir;
  if (STOREFRONT_BASE_DIR) {
    baseDir = resolvePath(process.cwd(), STOREFRONT_BASE_DIR);
  } else {
    baseDir = process.cwd();
  }
  const dirContent = resolvePath(baseDir, 'content');
  if (VITE_ECOM_STORE_ID) {
    config.set({ storeId: Number(VITE_ECOM_STORE_ID) });
  }

  const {
    storeId,
    lang,
    countryCode,
    currency,
    currencySymbol,
  } = config.get();

  const cms = (filename) => {
    if (filename.endsWith('/')) {
      const dirColl = resolvePath(dirContent, filename);
      return fs.readdirSync(dirColl).map((_filename) => _filename.replace('.json', ''));
    }
    const filepath = resolvePath(dirContent, `${filename}.json`);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  };

  const settings = cms('settings');
  const { domain } = settings;
  const primaryColor = settings.primary_color || '#20c997';
  const secondaryColor = settings.secondary_color || '#343a40';

  return {
    storeId,
    lang,
    countryCode,
    currency,
    currencySymbol,
    domain,
    primaryColor,
    secondaryColor,
    settings,
    cms,
  };
};
