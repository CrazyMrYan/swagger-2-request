/**
 * Swagger Petstore
 * This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.
 * Version: 1.0.7
 */

// ============= Base Types =============

/** HTTP 方法类型 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/** 请求选项 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/** HTTP 响应包装 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// ============= API Schema Types =============

export interface ApiResponse {
  code?: number;
  type?: string;
  message?: string;
}

export interface Category {
  id?: number;
  name?: string;
}

export interface Pet {
  id?: number;
  category?: { id?: number; name?: string };
  name: string;
  photoUrls: Array<string>;
  tags?: Array<{ id?: number; name?: string }>;
  /** pet status in the store */
  status?: "available" | "pending" | "sold";
}

export interface Tag {
  id?: number;
  name?: string;
}

export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
}

export interface User {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  /** User Status */
  userStatus?: number;
}

// ============= Request Parameter Types =============

export type PetPetIdUploadImagePostResponse = { code?: number; type?: string; message?: string };

export interface PetFindByStatusGetParams {
  /** Status values that need to be considered for filter */
  status: any;
}

export type PetFindByStatusGetResponse = Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>;

export interface PetFindByTagsGetParams {
  /** Tags to filter by */
  tags: any;
}

export type PetFindByTagsGetResponse = Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>;

export type PetPetIdGetResponse = { id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" };

export type StoreInventoryGetResponse = Record<string, any>;

export type StoreOrderPostResponse = { id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean };

export type StoreOrderOrderIdGetResponse = { id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean };

export type UserUsernameGetResponse = { id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number };

export interface UserLoginGetParams {
  /** The user name for login */
  username: any;
  /** The password for login in clear text */
  password: any;
}

export type UserLoginGetResponse = string;
