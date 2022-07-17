/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Brands {
  _id: string & { length: 24 };
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * @maxItems 10
   */
  channel_ids?: string[];
  /**
   * Brand full name
   */
  name: string;
  /**
   * Slug to complete page URL, starting with number or lowercase letter
   */
  slug?: string;
  /**
   * Short brand description in plain text
   */
  short_description?: string;
  /**
   * Full brand description, may use HTML tags
   */
  body_html?: string;
  /**
   * Full brand description, plain text only
   */
  body_text?: string;
  /**
   * Title tag for page SEO
   */
  meta_title?: string;
  /**
   * Meta description tag for page SEO
   */
  meta_description?: string;
  /**
   * Text translations for internationalization
   */
  i18n?: {
    /**
     * Language specific text fields
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-z]{2}(_[a-z]{2})?$".
     */
    [k: string]: {
      /**
       * Brand full name
       */
      name?: string;
      /**
       * Short brand description in plain text
       */
      short_description?: string;
      /**
       * Full brand description, may use HTML tags
       */
      body_html?: string;
      /**
       * Full brand description, plain text only
       */
      body_text?: string;
      /**
       * Title tag for page SEO
       */
      meta_title?: string;
      /**
       * Meta description tag for page SEO
       */
      meta_description?: string;
    };
  };
  /**
   * Brand logo
   */
  logo?: {
    /**
     * Image link
     */
    url: string;
    /**
     * Image size (width x height) in px, such as 100x50 (100px width, 50px height)
     */
    size?: string;
    /**
     * Alternative text, HTML alt tag (important for SEO)
     */
    alt?: string;
  };
  /**
   * List of brand images
   *
   * @maxItems 50
   */
  pictures?: {
    /**
     * Picture ID (ObjectID) [auto]
     */
    _id?: string;
    /**
     * Tag to identify object, use only lowercase letters, digits and underscore
     */
    tag?: string;
    /**
     * Image link
     */
    url: string;
    /**
     * Image size (width x height) in px, such as 100x50 (100px width, 50px height)
     */
    size?: string;
    /**
     * Alternative text, HTML alt tag (important for SEO)
     */
    alt?: string;
  }[];
  /**
   * List of custom attributes
   *
   * @maxItems 100
   */
  metafields?: {
    /**
     * String to help distinguish who (or which app) created and can use the metafield
     */
    namespace?: string;
    /**
     * Field name
     */
    field?: string;
    /**
     * Custom property value
     */
    value: {
      [k: string]: unknown;
    };
  }[];
  /**
   * Flags to associate additional info
   *
   * @maxItems 10
   */
  flags?: string[];
  /**
   * Optional notes with additional info about this brand
   */
  notes?: string;
}
