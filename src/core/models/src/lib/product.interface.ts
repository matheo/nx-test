/**
 * Shared product contract. Dates are ISO 8601 strings, as delivered by JSON.
 */
export interface ProductInterface {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}
