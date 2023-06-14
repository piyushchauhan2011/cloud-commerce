/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Triggered when order is being closed, must create payment transaction and return info
 */
export interface CreateTransactionResponse {
  /**
   * Created payment transaction object
   */
  transaction: {
    /**
     * Direct link to pay current transaction
     */
    payment_link?: string;
    /**
     * Additional text instructions for manual payments
     */
    payment_instructions?: string;
    /**
     * Transaction properties in the intermediator
     */
    intermediator?: {
      /**
       * Transaction ID in the intermediator
       */
      transaction_id?: string;
      /**
       * Transaction code in the intermediator
       */
      transaction_code?: string;
      /**
       * Transaction reference code
       */
      transaction_reference?: string;
      /**
       * Payment method as defined by intermediator
       */
      payment_method?: {
        /**
         * Payment method code
         */
        code: string;
        /**
         * Short description for payment method
         */
        name?: string;
      };
      /**
       * ID of customer account in the intermediator
       */
      buyer_id?: string;
    };
    /**
     * Credit card data, if payment was done with credit card
     */
    credit_card?: {
      /**
       * Full name of the holder, as it is on the credit card
       */
      holder_name?: string;
      /**
       * Response code from AVS: http://www.emsecommerce.net/avs_cvv2_response_codes.htm
       */
      avs_result_code?: string | null;
      /**
       * Response code from credit card company, such as AVS result code
       */
      cvv_result_code?: string | null;
      /**
       * Issuer identification number (IIN), known as bank identification number (BIN)
       */
      bin?: number;
      /**
       * Credit card issuer name, eg.: Visa, American Express, MasterCard
       */
      company?: string;
      /**
       * Last digits (up to 4) of credit card number
       */
      last_digits?: string;
      /**
       * Unique credit card token
       */
      token?: string;
      /**
       * Credit card processing standardized error code
       */
      error_code?:
        | 'incorrect_number'
        | 'invalid_number'
        | 'invalid_expiry_date'
        | 'invalid_cvc'
        | 'expired_card'
        | 'incorrect_cvc'
        | 'incorrect_zip'
        | 'incorrect_address'
        | 'card_declined'
        | 'processing_error'
        | 'call_issuer'
        | 'pick_up_card';
    };
    /**
     * Banking billet data, if payment was done with banking billet
     */
    banking_billet?: {
      /**
       * Ticket code, generally a barcode number
       */
      code?: string;
      /**
       * Date and time of expiration, in ISO 8601 standard representation
       */
      valid_thru?: string;
      /**
       * Text lines on ticket
       *
       * @maxItems 5
       */
      text_lines?: string[];
      /**
       * Direct link (URI) to banking billet
       */
      link?: string;
    };
    /**
     * If paid with loyalty points, specify how many points and what program was consumed
     */
    loyalty_points?: {
      /**
       * The name of the loyalty points program
       */
      name?: string;
      /**
       * Unique identifier, program name using only lowercase, numbers and underscore
       */
      program_id: string;
      /**
       * Number of loyalty points applied from customer account
       */
      points_value: number;
      /**
       * The ratio of a point when converted to currency
       */
      ratio?: number;
    };
    /**
     * Account deposit data, if payment was done with account deposit
     */
    account_deposit?: {
      /**
       * Date and time of expiration, in ISO 8601 standard representation
       */
      valid_thru?: string;
      /**
       * Information notes to payment
       *
       * @maxItems 5
       */
      text_lines?: string[];
    };
    /**
     * Currency ID specific for this transaction, if different of order currency ID
     */
    currency_id?: string;
    /**
     * Currency symbol specific for this transaction
     */
    currency_symbol?: string;
    /**
     * Discount by payment method, negative if value was additionated (not discounted)
     */
    discount?: number;
    /**
     * Transaction amount, disregarding installment rates
     */
    amount: number;
    /**
     * Installments option
     */
    installments?: {
      /**
       * Number of installments
       */
      number: number;
      /**
       * Installment value
       */
      value?: number;
      /**
       * Tax applied
       */
      tax?: boolean;
      /**
       * Total value, sum of all plots
       */
      total?: number;
    };
    /**
     * Cost data collected
     */
    creditor_fees?: {
      /**
       * Installment fee
       */
      installment?: number;
      /**
       * Operation fee
       */
      operational?: number;
      /**
       * Intermediation fee, if transaction have an intermediary
       */
      intermediation?: number;
      /**
       * Sum of other transaction rates
       */
      other?: number;
    };
    /**
     * Financial status and date of change
     */
    status?: {
      /**
       * Last status change, date and time in ISO 8601 standard representation
       */
      updated_at?: string;
      /**
       * Payment status
       */
      current:
        | 'pending'
        | 'under_analysis'
        | 'authorized'
        | 'unauthorized'
        | 'paid'
        | 'in_dispute'
        | 'refunded'
        | 'voided'
        | 'unknown';
    };
    /**
     * Flags to associate additional info
     *
     * @maxItems 10
     */
    flags?: string[];
    /**
     * List of custom fields
     *
     * @maxItems 10
     */
    custom_fields?: {
      /**
       * Field name
       */
      field: string;
      /**
       * Field value
       */
      value: string;
    }[];
    /**
     * Optional notes with additional info about this transaction
     */
    notes?: string;
  };
  /**
   * Whether the buyer should be redirected to payment link right after checkout
   */
  redirect_to_payment?: boolean;
}
