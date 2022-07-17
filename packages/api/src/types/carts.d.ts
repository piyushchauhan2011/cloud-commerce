/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Shopping cart object model
 */
export interface Carts {
  _id: string & { length: 24 };
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * Whether cart was created by staff and is trusted
   */
  staff_signature?: boolean;
  /**
   * Whether cart still available to complete checkout
   */
  available?: boolean;
  /**
   * If the cart has been completed, generating an order
   */
  completed?: boolean;
  /**
   * URL to this cart's page
   */
  permalink?: string;
  /**
   * Status defined by seller
   */
  status?: string;
  /**
   * UTM campaign HTTP parameters
   */
  utm?: {
    /**
     * Parameter 'utm_source', the referrer: (e.g. 'google', 'newsletter')
     */
    source?: string;
    /**
     * Parameter 'utm_medium', the marketing medium: (e.g. 'cpc', 'banner', 'email')
     */
    medium?: string;
    /**
     * Parameter 'utm_campaign', the product, promo code, or slogan (e.g. 'spring_sale')
     */
    campaign?: string;
    /**
     * Parameter 'utm_term', identifies the paid keywords
     */
    term?: string;
    /**
     * Parameter 'utm_content', used to differentiate ads
     */
    content?: string;
  };
  /**
   * The website that the customer clicked on to come to the shop
   */
  referring_site?: string;
  /**
   * Code to identify the affiliate that referred the customer
   */
  affiliate_code?: string;
  /**
   * List of customers associated with this cart
   *
   * @maxItems 3000
   */
  customers?: string[];
  /**
   * Whether cart is available for other customers too (anyone)
   */
  other_customers?: boolean;
  /**
   * Products composing the cart
   *
   * @maxItems 3000
   */
  items: {
    /**
     * Cart item ID (ObjectID) [auto]
     */
    _id?: string;
    /**
     * Product ID
     */
    product_id: string;
    /**
     * ID to specify the variation added to cart, if product has variations
     */
    variation_id?: string;
    /**
     * Product or variation SKU (reference code)
     */
    sku?: string;
    /**
     * Product or variation full name, or other label for this cart item
     */
    name?: string;
    /**
     * Product or variation picture for this cart item
     */
    picture?: {
      /**
       * Image size variation
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^small|normal|big|zoom|custom$".
       */
      [k: string]: {
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
    };
    /**
     * Item customization fields
     *
     * @maxItems 100
     */
    customizations?: {
      /**
       * Title for this customization field, can be the grid title
       */
      label?: string;
      /**
       * Option chosen or created by customer
       */
      option: {
        /**
         * Option ID (ObjectID) if it was predefined (not custom value created by customer)
         */
        _id?: string;
        /**
         * Option text value displayed for the client
         */
        text: string;
      };
      /**
       * URL of file attached by customer to this field
       */
      attachment?: string;
      /**
       * Price alteration due to this customization
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
     * Parent kit product for this item
     */
    kit_product?: {
      /**
       * Kit product ID (ObjectID)
       */
      _id: string & { length: 24 };
      /**
       * Kit product full name
       */
      name?: string;
      /**
       * Total quantity of items to close a kit unit
       */
      pack_quantity?: number;
      /**
       * Kit total pack price
       */
      price?: number;
      /**
       * Current kit composition
       *
       * @maxItems 100
       */
      composition?: {
        /**
         * Product ID (ObjectID)
         */
        _id: string & { length: 24 };
        /**
         * Selected variation ID (ObjectID) if any
         */
        variation_id?: string;
        /**
         * Kit item quantity
         */
        quantity?: number;
      }[];
    };
    /**
     * Item quantity in cart
     */
    quantity: number;
    /**
     * Minimum item quantity for this cart
     */
    min_quantity?: number;
    /**
     * Maximum item quantity for this cart
     */
    max_quantity?: number;
    /**
     * Deadline for production or handling of pre-ordered item
     */
    production_time?: {
      /**
       * Number of days to post the product after purchase, deadline for production or handling
       */
      days: number;
      /**
       * If the deadline is calculated in working days
       */
      working_days?: boolean;
      /**
       * If the production time is cumulative per item unit
       */
      cumulative?: boolean;
      /**
       * When cumulative, increase the term proportionally up to this maximum (in days)
       */
      max_time?: number;
    };
    /**
     * Designator of currency according to ISO 4217 (3 uppercase letters)
     */
    currency_id?: string;
    /**
     * Graphic symbol used as a shorthand for currency's name
     */
    currency_symbol?: string;
    /**
     * Product sale price specifically for this cart
     */
    price: number;
    /**
     * Final item price including additions due to customizations (auto-calculated)
     */
    final_price?: number;
    /**
     * Flags to associate additional info
     *
     * @maxItems 10
     */
    flags?: string[];
  }[];
  /**
   * The sum of all items prices (auto-calculated)
   */
  subtotal?: number;
  /**
   * List of orders completed with this cart
   *
   * @maxItems 3000
   */
  orders?: string[];
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
