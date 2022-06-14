/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Trigger object model
 */
export interface Triggers {
  _id: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  /**
   * When event occurred, date and time in ISO 8601 standard representation
   */
  datetime: string;
  /**
   * ID of used authentication, should be a valid hexadecimal
   */
  authentication_id?: string | null;
  /**
   * Method (HTTP verb) of the event
   */
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /**
   * Type of action taken
   */
  action: 'create' | 'change' | 'delete';
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
   * Subresource slug (which appears in the URL), if specified
   */
  subresource?: string;
  /**
   * Subresource ID, if specified
   */
  subresource_id?: string;
  /**
   * Document fields involved (created or updated) with the event
   */
  fields?: string[];
  /**
   * Unique ID of created object, only for POST method
   */
  inserted_id?: string;
  /**
   * Request body, limitations: https://docs.mongodb.com/manual/reference/limits/#bson-documents
   */
  body?: {
    [k: string]: unknown;
  };
  /**
   * Response received, limits: https://docs.mongodb.com/manual/reference/limits/#bson-documents
   */
  response?: {
    [k: string]: unknown;
  };
}
