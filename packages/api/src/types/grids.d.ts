/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Grids {
  _id: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * Grid title
   */
  title: string;
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
       * Grid title
       */
      title?: string;
    };
  };
  /**
   * Identifier for integrations and syncronizations, generally the grid name normalized
   */
  grid_id?: string;
  /**
   * Pre-defined options for this grid, used in specifications, customization and variations
   */
  options?: {
    /**
     * Option ID (ObjectID) [auto]
     */
    _id?: string;
    /**
     * Option text value displayed for the client
     */
    text: string;
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
         * Option text value displayed for the client
         */
        text?: string;
      };
    };
    /**
     * Default normalized value to use in integrations
     */
    value?: string;
    /**
     * Normalized values to use in specific integrations (ID in property)
     */
    external_values?: {
      /**
       * Attribute text value
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^[a-z0-9_]{2,30}$".
       */
      [k: string]: string;
    };
    /**
     * Option color palette (if the grid involves colors), starting by main color
     */
    colors?: string[];
    /**
     * Default price alteration for product with this option for customization or variations
     */
    add_to_price?: {
      /**
       * Type of price addition
       */
      type?: 'percentage' | 'fixed';
      /**
       * Additional value, could be negative
       */
      addition: number;
    };
  }[];
  /**
   * If this grid accept custom value defined by customer (product customization)
   */
  custom_value?: boolean;
  /**
   * If this grid accept customer file attachment
   */
  attachment?: boolean;
  /**
   * Default price alteration for product with this grid for customization or variations
   */
  add_to_price?: {
    /**
     * Type of price addition
     */
    type?: 'percentage' | 'fixed';
    /**
     * Additional value, could be negative
     */
    addition: number;
  };
  /**
   * List of custom attributes
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
   */
  flags?: string[];
  /**
   * Optional notes with additional info about this product
   */
  notes?: string;
}
