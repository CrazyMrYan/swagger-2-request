import { apiClient } from './client';
import { filterQueryParams, validateRequestBody, createRequestConfig } from './utils';
import type * as Types from './types';

/**
 * uploads an image
 * POST /pet/{petId}/uploadImage
 * @tags pet
 */
export async function petPetIdUploadImagePost(petId: number, options?: Types.RequestOptions): Promise<Types.PetPetIdUploadImagePostResponse> {
  if (petId === undefined || petId === null) {
    throw new Error('Required parameter "petId" is missing');
  }

  const url = `/pet/${petId}/uploadImage`;

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Add a new pet to the store
 * POST /pet
 * @tags pet
 */
export async function petPost(options?: Types.RequestOptions): Promise<any> {
  const url = '/pet';

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Update an existing pet
 * PUT /pet
 * @tags pet
 */
export async function petPut(options?: Types.RequestOptions): Promise<any> {
  const url = '/pet';

  const config = {
    method: 'PUT' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 * GET /pet/findByStatus
 * @tags pet
 */
export async function petFindByStatusGet(params?: Types.PetFindByStatusGetParams, options?: Types.RequestOptions): Promise<Types.PetFindByStatusGetResponse> {
  if (params) {
    if (params.status === undefined || params.status === null) {
      throw new Error('Required query parameter "status" is missing');
    }
  }

  const url = '/pet/findByStatus';

  const config = {
    method: 'GET' as const,
    url,
    params: params ? filterQueryParams(params, ["status"]) : undefined,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Finds Pets by tags
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 * GET /pet/findByTags
 * @tags pet
 */
export async function petFindByTagsGet(params?: Types.PetFindByTagsGetParams, options?: Types.RequestOptions): Promise<Types.PetFindByTagsGetResponse> {
  if (params) {
    if (params.tags === undefined || params.tags === null) {
      throw new Error('Required query parameter "tags" is missing');
    }
  }

  const url = '/pet/findByTags';

  const config = {
    method: 'GET' as const,
    url,
    params: params ? filterQueryParams(params, ["tags"]) : undefined,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Find pet by ID
 * Returns a single pet
 * GET /pet/{petId}
 * @tags pet
 */
export async function petPetIdGet(petId: number, options?: Types.RequestOptions): Promise<Types.PetPetIdGetResponse> {
  if (petId === undefined || petId === null) {
    throw new Error('Required parameter "petId" is missing');
  }

  const url = `/pet/${petId}`;

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Updates a pet in the store with form data
 * POST /pet/{petId}
 * @tags pet
 */
export async function petPetIdPost(petId: number, options?: Types.RequestOptions): Promise<any> {
  if (petId === undefined || petId === null) {
    throw new Error('Required parameter "petId" is missing');
  }

  const url = `/pet/${petId}`;

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Deletes a pet
 * DELETE /pet/{petId}
 * @tags pet
 */
export async function petPetIdDelete(petId: number, options?: Types.RequestOptions): Promise<any> {
  if (petId === undefined || petId === null) {
    throw new Error('Required parameter "petId" is missing');
  }

  const url = `/pet/${petId}`;

  const config = {
    method: 'DELETE' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Returns pet inventories by status
 * Returns a map of status codes to quantities
 * GET /store/inventory
 * @tags store
 */
export async function storeInventoryGet(options?: Types.RequestOptions): Promise<Types.StoreInventoryGetResponse> {
  const url = '/store/inventory';

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Place an order for a pet
 * POST /store/order
 * @tags store
 */
export async function storeOrderPost(options?: Types.RequestOptions): Promise<Types.StoreOrderPostResponse> {
  const url = '/store/order';

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Find purchase order by ID
 * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 * GET /store/order/{orderId}
 * @tags store
 */
export async function storeOrderOrderIdGet(orderId: number, options?: Types.RequestOptions): Promise<Types.StoreOrderOrderIdGetResponse> {
  if (orderId === undefined || orderId === null) {
    throw new Error('Required parameter "orderId" is missing');
  }

  const url = `/store/order/${orderId}`;

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Delete purchase order by ID
 * For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 * DELETE /store/order/{orderId}
 * @tags store
 */
export async function storeOrderOrderIdDelete(orderId: number, options?: Types.RequestOptions): Promise<any> {
  if (orderId === undefined || orderId === null) {
    throw new Error('Required parameter "orderId" is missing');
  }

  const url = `/store/order/${orderId}`;

  const config = {
    method: 'DELETE' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Creates list of users with given input array
 * POST /user/createWithList
 * @tags user
 */
export async function userCreateWithListPost(options?: Types.RequestOptions): Promise<any> {
  const url = '/user/createWithList';

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Get user by user name
 * GET /user/{username}
 * @tags user
 */
export async function userUsernameGet(username: string, options?: Types.RequestOptions): Promise<Types.UserUsernameGetResponse> {
  if (username === undefined || username === null) {
    throw new Error('Required parameter "username" is missing');
  }

  const url = `/user/${username}`;

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Updated user
 * This can only be done by the logged in user.
 * PUT /user/{username}
 * @tags user
 */
export async function userUsernamePut(username: string, options?: Types.RequestOptions): Promise<any> {
  if (username === undefined || username === null) {
    throw new Error('Required parameter "username" is missing');
  }

  const url = `/user/${username}`;

  const config = {
    method: 'PUT' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Delete user
 * This can only be done by the logged in user.
 * DELETE /user/{username}
 * @tags user
 */
export async function userUsernameDelete(username: string, options?: Types.RequestOptions): Promise<any> {
  if (username === undefined || username === null) {
    throw new Error('Required parameter "username" is missing');
  }

  const url = `/user/${username}`;

  const config = {
    method: 'DELETE' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Logs user into the system
 * GET /user/login
 * @tags user
 */
export async function userLoginGet(params?: Types.UserLoginGetParams, options?: Types.RequestOptions): Promise<Types.UserLoginGetResponse> {
  if (params) {
    if (params.username === undefined || params.username === null) {
      throw new Error('Required query parameter "username" is missing');
    }
    if (params.password === undefined || params.password === null) {
      throw new Error('Required query parameter "password" is missing');
    }
  }

  const url = '/user/login';

  const config = {
    method: 'GET' as const,
    url,
    params: params ? filterQueryParams(params, ["username","password"]) : undefined,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Logs out current logged in user session
 * GET /user/logout
 * @tags user
 */
export async function userLogoutGet(options?: Types.RequestOptions): Promise<any> {
  const url = '/user/logout';

  const config = {
    method: 'GET' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Creates list of users with given input array
 * POST /user/createWithArray
 * @tags user
 */
export async function userCreateWithArrayPost(options?: Types.RequestOptions): Promise<any> {
  const url = '/user/createWithArray';

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}

/**
 * Create user
 * This can only be done by the logged in user.
 * POST /user
 * @tags user
 */
export async function userPost(options?: Types.RequestOptions): Promise<any> {
  const url = '/user';

  const config = {
    method: 'POST' as const,
    url,
    ...options,
  };

  const response = await apiClient.request(config);
  return response.data;
}
