/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Procedure object model
 */
export interface Procedures {
  _id: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * Procedure title
   */
  title: string;
  /**
   * Short procedure description in plain text
   */
  short_description?: string;
  /**
   * List of events that call this procedure
   */
  triggers: {
    /**
     * Method (HTTP verb) of the event, if undefined will match any method
     */
    method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    /**
     * Type of action taken, if undefined will match any action
     */
    action?: 'create' | 'change' | 'delete';
    /**
     * API resource
     */
    resource:
      | 'authentications'
      | 'products'
      | 'categories'
      | 'brands'
      | 'collections'
      | 'grids'
      | 'customers'
      | 'carts'
      | 'orders'
      | 'applications'
      | 'stores';
    /**
     * Resource ID, if specified
     */
    resource_id?: string;
    /**
     * Subresource slug (URL path), use wildcard `*` to match either none or any subresource
     */
    subresource?: string | null;
    /**
     * Subresource ID, if specified
     */
    subresource_id?: string;
    /**
     * Property created or updated with the event, if undefined will match any fields
     */
    field?: string;
  }[];
  /**
   * List of notifications to be sent when this procedure is called. In some properties you can use variables from trigger object with (tr.*) notation, eg.: (tr.body.name)
   */
  webhooks: {
    /**
     * API where notification should be sent
     */
    api: {
      /**
       * Use this property if webhook is to store API (api.e-com.plus)
       */
      store_api?: {
        /**
         * API endpoint, such as /products.json, you can also include variables
         */
        endpoint?: string;
        /**
         * API version
         */
        version?: 'v1' | 'current';
      };
      /**
       * Use this property if webhook is to any external API (not api.e-com.plus)
       */
      external_api?: {
        /**
         * Full URL to external API endpoint, you can also use variables here
         */
        uri: string;
        /**
         * List of headers to be sent on the request
         */
        headers?: {
          /**
           * Header field name, eg.: X-Access-Token
           */
          name: string;
          /**
           * Header field value, you can also use variables here
           */
          value: string;
        }[];
      };
    };
    /**
     * Method (HTTP verb) to send request
     */
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    /**
     * Send body on notification, if true and map_body undefined, trigger object will be sent
     */
    send_body?: boolean;
    /**
     * Object to send, it is possible to use variables as properties values
     */
    map_body?: {
      [k: string]: unknown;
    };
  }[];
  /**
   * Tag to identify object, use only lowercase letters, digits and underscore
   */
  tag?: string;
  /**
   * Flags to associate additional info
   */
  flags?: string[];
  /**
   * Optional notes with additional info about this procedure
   */
  notes?: string;
}
