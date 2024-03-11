const fs = require('fs');
const { resolve: resolvePath } = require('path');
const deepmerge = require('@fastify/deepmerge')();
const colors = require('tailwindcss/colors');
const chroma = require('chroma-js');
require('./storefront.cms.js');

let defaultThemeOptions = {
  baseColor: 'slate',
  successColor: 'emerald',
  warningColor: 'amber',
  dangerColor: 'rose',
  // IntelliSense for UnoCSS icons
  brandIconSets: ['fa6-brands'],
  brandIconShortcuts: [
    'facebook',
    'twitter',
    'instagram',
    'threads',
    'linkedin',
    'youtube',
    'google',
    'pinterest',
    'tiktok',
    'telegram',
    'whatsapp',
    'messenger',
    'pix',
  ],
  logoIconSets: ['logos'],
  logoIconShortcuts: [
    'visa',
    'mastercard',
    'paypal',
    'apple-pay',
    'google-pay',
    'amex',
    'elo',
    'hipercard',
    'dinersclub',
    'discover',
  ],
  generalIconSets: ['heroicons'],
  iconAliases: {
    close: 'x-mark',
    'chevron-right': 'chevron-right',
  },
};
if (globalThis.$storefrontThemeOptions) {
  defaultThemeOptions = deepmerge(defaultThemeOptions, globalThis.$storefrontThemeOptions);
}

const { primaryColor, secondaryColor } = global.__storefrontCMS(fs, resolvePath);
const brandColors = {
  primary: primaryColor,
  secondary: secondaryColor || primaryColor,
  ...globalThis.$storefrontBrandColors,
};
const brandColorsPalletes = {};
const onBrandColors = {};
Object.keys(brandColors).forEach((colorName) => {
  const hex = brandColors[colorName];
  const color = chroma(hex);
  let subtle;
  let bold;
  const luminance = color.luminance();
  if (luminance >= 0.1) {
    subtle = chroma(hex).brighten(1.5);
    bold = chroma(hex).darken(1.25);
  } else if (luminance > 0.03) {
    subtle = chroma(hex).brighten();
    bold = chroma(hex).darken();
  } else {
    subtle = chroma(hex).darken();
    bold = chroma(hex).brighten();
  }
  const toRGB = (_color) => _color.css().replace(/,/g, ' ');
  const pallete = {
    subtle: toRGB(subtle),
    DEFAULT: toRGB(color),
    bold: toRGB(bold),
  };
  let scaleRefColor = '';
  let deltaE = 101;
  Object.keys(colors).forEach((twColor) => {
    if (twColor !== twColor.toLowerCase()) return;
    const twPallete = colors[twColor];
    if (!twPallete?.['50']) return;
    Object.values(twPallete).forEach((compareHex) => {
      const _deltaE = chroma.deltaE(hex, compareHex);
      if (_deltaE < deltaE) {
        scaleRefColor = twColor;
        deltaE = _deltaE;
      }
    });
  });
  const refPallete = colors[scaleRefColor];
  Object.keys(refPallete).forEach((palleteIndex) => {
    const refHex = refPallete[palleteIndex];
    const l = chroma(refHex).luminance();
    pallete[palleteIndex] = toRGB(color.luminance(l));
  });
  brandColorsPalletes[colorName] = pallete;
  const colorVariants = { color, subtle, bold };
  Object.keys(colorVariants).forEach((tone) => {
    const label = tone === 'color' ? colorName : `${colorName}-${tone}`;
    const lightness = colorVariants[tone].get('lab.l');
    if (lightness > 90) {
      onBrandColors[label] = pallete['800'];
    } else if (lightness > 76) {
      onBrandColors[label] = pallete['900'];
    } else if (lightness > 67) {
      onBrandColors[label] = pallete['950'];
    } else {
      onBrandColors[label] = `var(--c-on-${(lightness > 60 ? 'light' : 'dark')})`;
    }
  });
});

const genTailwindConfig = (themeOptions = {}) => {
  const {
    baseColor,
    successColor,
    warningColor,
    dangerColor,
    brandIconSets,
    brandIconShortcuts,
    logoIconSets,
    logoIconShortcuts,
    generalIconSets,
    iconAliases,
  } = deepmerge(defaultThemeOptions, themeOptions);
  const config = {
    content: ['./src/**/*.{vue,astro,tsx,jsx,md,html,svelte}'],
    theme: {
      extend: {
        colors: {
          ...brandColorsPalletes,
          on: onBrandColors,
          base: typeof baseColor === 'string' ? colors[baseColor] : baseColor,
          success: typeof successColor === 'string' ? colors[successColor] : successColor,
          warning: typeof warningColor === 'string' ? colors[warningColor] : warningColor,
          danger: typeof dangerColor === 'string' ? colors[dangerColor] : dangerColor,
        },
        fontFamily: {
          sans: ['var(--font-sans)'],
          mono: ['var(--font-mono)'],
          brand: ['var(--font-brand, var(--font-sans))'],
        },
      },
    },
    plugins: [
      ({ addUtilities, addVariant }) => {
        addUtilities({
          ...Object.keys(onBrandColors).reduce((utilities, colorLabel) => {
            const [colorName, tone] = colorLabel.split('-');
            const textColor = onBrandColors[colorLabel];
            const backgroundColor = brandColorsPalletes[colorName][tone || 'DEFAULT'];
            utilities[`.${colorLabel}`] = {
              'background-color': `var(--c-${colorLabel}, ${backgroundColor})`,
              color: `var(--c-on-${colorLabel}, ${textColor})`,
            };
            return utilities;
          }, {}),
          ...[
            /* Reverse because custom icon sets are pushed to arrays after
            default theme ones on `deepmerge`, we want custom icon sets first */
            ...generalIconSets.reverse().map((iconset) => {
              return typeof iconset === 'string' ? { iconset } : iconset;
            }),
            ...brandIconSets.reverse().map((iconset) => ({
              iconset,
              shortcuts: brandIconShortcuts,
            })),
            ...logoIconSets.reverse().map((iconset) => ({
              iconset,
              shortcuts: logoIconShortcuts,
            })),
          ].reduce((utilities, { iconset, shortcuts }) => {
            if (iconset) {
              const { icons } = require(`@iconify-json/${iconset}`);
              if (!shortcuts) {
                shortcuts = Object.keys(icons.icons);
                Object.keys(iconAliases).forEach((alias) => {
                  if (alias !== iconAliases[alias]) {
                    shortcuts.push([alias, iconAliases[alias]]);
                  }
                });
              }
              shortcuts.forEach((shortcut) => {
                let selector;
                let icon;
                if (typeof shortcut === 'string') {
                  selector = `.i-${shortcut}`;
                  icon = shortcut;
                } else {
                  selector = `.i-${shortcut[0]}`;
                  icon = shortcut[1];
                }
                if (utilities[selector]) {
                  // Same shortcut from previous icon set
                  return;
                }
                utilities[selector] = {
                  '--collection': iconset,
                  '--icon': icon,
                  '--view': `"https://icones.js.org/collection/${iconset}?s=${icon}"`,
                };
              });
              Object.keys(icons.icons).forEach((icon) => {
                const selector = `.i-${iconset}-${icon}`;
                if (utilities[selector]) return;
                utilities[selector] = {
                  '--collection': iconset,
                  '--icon': icon,
                  '--view': `"https://icones.js.org/collection/${iconset}?s=${icon}"`,
                };
              });
            }
            return utilities;
          }, {}),
          // require('@tailwindcss/typography'),
          // https://github.com/unocss/unocss/tree/main/packages/preset-typography
          ...['prose', 'not-prose', 'prose-invert'].reduce((utilities, proseClass) => {
            utilities[`.${proseClass}`] = {
              [`--un-${proseClass}`]: 'default',
            };
            return utilities;
          }, {}),
          // Inspired by https://www.tailwindcss-animated.com/configurator.html
          '.animate-once': {
            'animation-iteration-count': '1',
          },
          '.animate-twice': {
            'animation-iteration-count': '2',
          },
          '.animate-thrice': {
            'animation-iteration-count': '3',
          },
          '.animate-infinite': {
            'animation-iteration-count': 'infinite',
          },
        });
        addVariant('sticky-header', 'body.StickyHeader &');
      },
    ],
  };
  const uiElNames = [];
  try {
    const styleCSSFile = resolvePath(process.env.STOREFRONT_BASE_DIR, 'src/assets/style.css');
    const styleCSS = fs.readFileSync(styleCSSFile, 'utf8');
    // '.ui-btn { color: green }; .ui-title { font-size: 18px }'.split(/\.ui-/i)
    // => [ "", "btn { color: green }; ", "title { font-size: 18px }" ]
    styleCSS.split(/[.=]ui-/).forEach((partCSS, i) => {
      if (i === 0) return;
      const elName = partCSS.replace(/[^\w-].*/g, '');
      if (elName) {
        let [, styles] = partCSS.split(/[{}]/);
        if (!styles && /,[\n\s]+$/.test(partCSS)) {
          styles = styleCSS.split(partCSS)[1]?.split(/[{}]/)[1];
        }
        styles = styles?.replace(/\n/g, ' ').trim().replace(/\s\s/g, ' ') || '';
        // .ui-btn -> .ui-btn-primary
        const parentEl = uiElNames.find((el) => elName.startsWith(`${el.elName}-`));
        if (parentEl) {
          styles = `${parentEl.styles} ${styles}`;
        }
        const uiEl = uiElNames.find((el) => el.elName === elName);
        if (!uiEl) {
          uiElNames.push({ elName, styles });
        } else {
          uiEl.styles += ` ${styles}`;
        }
      }
    });
  } catch {
    //
  }
  if (uiElNames.length) {
    config.plugins.push(({ addUtilities }) => {
      addUtilities(uiElNames.reduce((utilities, { elName, styles }) => {
        utilities[`.ui-${elName}`] = {
          [`--${elName}`]: `"${styles}" /* Consistent UI element from assets/style.css */`,
        };
        return utilities;
      }, {}));
    });
  }
  if (globalThis.$storefrontTailwindConfig) {
    return deepmerge(config, globalThis.$storefrontTailwindConfig);
  }
  return config;
};

module.exports = {
  genTailwindConfig,
  defaultThemeOptions,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
};
