import type { ResourceId } from '@cloudcommerce/types';
import type { PageContent } from '@@sf/content';
import type { RouteContext } from '@@sf/ssr-context';
import type { Props as UseBannerProps } from '@@sf/composables/use-banner';
import type { Props as UseHeroSliderProps } from '@@sf/composables/use-hero-slider';
import type { Props as UseProductShelfProps } from '@@sf/composables/use-product-shelf';
import { useProductShelf } from '@@sf/composables/use-product-shelf';

export interface Props {
  routeContext: RouteContext;
}

const now = Date.now();
const parseBanners = (banners: Partial<PageContent['hero']['slides'][0]>[]) => {
  const validBanners: UseBannerProps[] = [];
  banners.forEach(({
    img,
    start,
    end,
    mobile_img: mobileImg,
    button_link: buttonLink,
    button_text: buttonText,
    ...rest
  }) => {
    if (start && new Date(start).getTime() < now) return;
    if (end && new Date(end).getTime() > now) return;
    validBanners.push({
      ...rest,
      img,
      mobileImg,
      buttonLink,
      buttonText,
    });
  });
  return validBanners;
};

export const usePageHero = async ({ routeContext }: Props) => {
  const { cmsContent } = routeContext;
  const heroSlider: UseHeroSliderProps = { slides: [] };
  const heroContent = cmsContent?.hero;
  if (heroContent) {
    heroSlider.autoplay = heroContent.autoplay;
    if (heroContent.slides) {
      heroSlider.slides = parseBanners(heroContent.slides);
    }
  }
  return { heroSlider };
};

export const usePageSections = async ({ routeContext }: Props) => {
  const sectionsContent = routeContext.cmsContent?.sections;
  const sections: Array<
    { type: 'product-shelf', props: UseProductShelfProps }
    | { type: 'banners-grid', props: { banners: UseBannerProps[] } }
  > = [];
  if (sectionsContent) {
    await Promise.all(sectionsContent.map(async ({ type, ...sectionContent }, index) => {
      if (type === 'product-shelf') {
        const {
          collection_id: collectionIdAndInfo,
          headless: isHeadless,
          shuffle: isShuffle,
          ...rest
        } = sectionContent;
        let { sort, title } = sectionContent;
        switch (sort) {
          case 'offers':
            sort = '-price_discount';
            break;
          case 'news':
            sort = '-_id';
            break;
          case 'lowest_price':
            sort = 'price';
            break;
          case 'highest_price':
            sort = '-price';
            break;
          default:
        }
        let collectionId: ResourceId | null = null;
        let searchQuery: `&${string}` | undefined;
        let titleLink: string | undefined;
        if (collectionIdAndInfo) {
          const [_id, resource, name, path] = (collectionIdAndInfo as string)
            .split(':') as [
              ResourceId,
              string | undefined,
              string | undefined,
              string | undefined,
            ];
          collectionId = _id;
          if (resource === 'categories') {
            searchQuery = `&categories._id=${_id}`;
          } else if (resource === 'brands') {
            searchQuery = `&brands._id=${_id}`;
          }
          if (!title && title !== null && name) {
            title = name;
          }
          titleLink = path;
        }
        const props = {
          ...rest,
          collectionId,
          searchQuery,
          sort,
          title: isHeadless ? null : title,
          titleLink,
          isShuffle,
        };
        const { fetching, products } = useProductShelf(props);
        await fetching;
        sections[index] = {
          type,
          props: {
            ...rest,
            collectionId,
            searchQuery,
            sort,
            title: isHeadless ? null : title,
            titleLink,
            isShuffle,
            products,
          },
        };
        return;
      }

      if (type === 'banners-grid') {
        sections[index] = {
          type,
          props: {
            banners: parseBanners(sectionContent.banners || []),
          },
        };
        // return;
      }
    }));
  }
  /*
  if (import.meta.env.DEV) {
    console.log('> Sections loaded');
  }
  */
  return {
    sections,
  };
};
