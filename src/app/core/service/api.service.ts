// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, of, TimeoutError } from 'rxjs';
import { catchError, timeout, switchMap } from 'rxjs/operators';
import { HttpHeadersService, ExtraKeys } from './http-headers.service';
import { ErrorService } from './error.service';
import { environment } from 'src/environments/environment';
import { ApiEmptyResponse, ApiResponse } from '../../shared/models/api-response.model';

export enum HttpMethodType {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  private readonly TIMEOUT = 15000;

  constructor(
    private http: HttpClient,
    private headersService: HttpHeadersService,
    private errorService: ErrorService
  ) {}

  /**
   * Construye la URL base
   */
  private buildBaseUrl(endPoint: string): string {
    if (!endPoint.startsWith('http')) {
      return `${this.API_URL}/${endPoint}`;
    }
    return endPoint;
  }

  /**
   * Extrae el data de la respuesta si tiene estructura ApiResponse
   */
  private extractDataFromResponse<T>(responseBody: any): T {
    // Si la respuesta tiene la estructura ApiResponse { data: ..., meta: ..., links: ... }
    if (responseBody && typeof responseBody === 'object' && 'data' in responseBody) {
      return responseBody.data as T;
    }

    // Si no tiene esa estructura, retorna el body completo
    return responseBody as T;
  }

  /**
   * Método principal para construir y ejecutar peticiones HTTP
   */
  buildHttpResponse<T>(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.GET,
    request?: any,
    extraKeys?: ExtraKeys
  ): Observable<HttpResponse<T>> {
    const headers = this.headersService.buildHeaderTokens(extraKeys, endPoint);
    const url = this.buildBaseUrl(endPoint);

    console.log(`URL (${method}): ${url}`);

    if (
      request &&
      (method === HttpMethodType.POST || method === HttpMethodType.PUT || method === HttpMethodType.PATCH)
    ) {
      console.log('Request:', JSON.stringify(request));
    }

    let httpCall: Observable<HttpResponse<T>>;

    switch (method) {
      case HttpMethodType.POST:
        httpCall = this.http.post<T>(url, request, {
          headers,
          observe: 'response',
        });
        break;
      case HttpMethodType.PUT:
        httpCall = this.http.put<T>(url, request, {
          headers,
          observe: 'response',
        });
        break;
      case HttpMethodType.DELETE:
        httpCall = this.http.delete<T>(url, {
          headers,
          observe: 'response',
        });
        break;
      case HttpMethodType.PATCH:
        httpCall = this.http.patch<T>(url, request, {
          headers,
          observe: 'response',
        });
        break;
      default: // GET
        httpCall = this.http.get<T>(url, {
          headers,
          observe: 'response',
        });
    }

    return httpCall.pipe(
      timeout(this.TIMEOUT),
      catchError(error => this.handleHttpError(error))
    );
  }

  /**
   * Maneja errores HTTP genéricos
   */
  private handleHttpError(error: any): Observable<never> {
    console.error('HTTP Error:', error);

    if (!navigator.onLine) {
      this.errorService.showModal('No internet connection available', 'error', 'NETWORK_ERROR', 'Network Error');
      return throwError(() => new Error('Internet not available'));
    }

    if (error instanceof TimeoutError) {
      this.errorService.showModal(
        'Request timeout. Please try again.',
        'warning',
        'TIMEOUT_ERROR',
        'Request Timeout',
        4000
      );
      return throwError(() => new Error('Request timeout'));
    }

    if (error instanceof HttpErrorResponse) {
      this.errorService.handleError(error);
    } else {
      this.errorService.showModal('Something went wrong', 'error', 'UNKNOWN_ERROR', 'Error');
    }

    return throwError(() => error);
  }

  /**
   * Maneja la respuesta HTTP y retorna SOLO el data
   */
  handleResponse<T>(response: HttpResponse<T>): Observable<T> {
    // Verificar conexión a internet
    if (!navigator.onLine) {
      this.errorService.showModal('No internet connection available', 'error', 'NETWORK_ERROR', 'Network Error');
      return throwError(() => new Error('Internet not available'));
    }

    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 300) {
      try {
        const body = response.body;
        // Extraer automáticamente el data de la respuesta
        const extractedData = this.extractDataFromResponse<T>(body);
        return of(extractedData);
      } catch (error) {
        this.errorService.showModal('Invalid response format from server', 'error', 'PARSE_ERROR', 'Parse Error');
        return throwError(() => new Error('Invalid response format'));
      }
    }

    const errorMessage = this.errorService.mapError(statusCode, response.body);
    console.log('error message:', errorMessage);

    this.errorService.showModalByStatusCode(statusCode, errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Maneja la respuesta HTTP y retorna la ApiResponse completa
   */
  handleFullResponse<T>(response: HttpResponse<T>): Observable<ApiResponse<T>> {
    if (!navigator.onLine) {
      this.errorService.showModal('No internet connection available', 'error', 'NETWORK_ERROR', 'Network Error');
      return throwError(() => new Error('Internet not available'));
    }

    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 300) {
      try {
        const body = response.body as ApiResponse<T>;
        return of(body);
      } catch (error) {
        this.errorService.showModal('Invalid response format from server', 'error', 'PARSE_ERROR', 'Parse Error');
        return throwError(() => new Error('Invalid response format'));
      }
    }

    const errorMessage = this.errorService.mapError(statusCode, response.body);
    this.errorService.showModalByStatusCode(statusCode, errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Maneja respuestas vacías (HTTP 204 No Content, etc)
   */
  handleEmptyResponse(response: HttpResponse<any>): Observable<ApiEmptyResponse> {
    if (!navigator.onLine) {
      this.errorService.showModal('No internet connection available', 'error', 'NETWORK_ERROR', 'Network Error');
      return throwError(() => new Error('Internet not available'));
    }

    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 300) {
      return of({
        success: true,
        status: statusCode,
        message: 'Operation completed successfully',
      });
    }

    const errorMessage = this.errorService.mapError(statusCode, response.body);
    this.errorService.showModalByStatusCode(statusCode, errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Método principal de solicitud - Retorna SOLO el data
   */
  request<T>(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.GET,
    data?: any,
    extraKeys?: ExtraKeys
  ): Observable<T> {
    return this.buildHttpResponse<T>(endPoint, method, data, extraKeys).pipe(
      switchMap(response => this.handleResponse<T>(response))
    );
  }

  /**
   * Método que retorna la respuesta COMPLETA (con meta, links)
   */
  requestFull<T>(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.GET,
    data?: any,
    extraKeys?: ExtraKeys
  ): Observable<ApiResponse<T>> {
    return this.buildHttpResponse<T>(endPoint, method, data, extraKeys).pipe(
      switchMap(response => this.handleFullResponse<T>(response))
    );
  }

  /**
   * Método para peticiones que esperan respuesta vacía (DELETE, etc)
   */
  requestEmpty(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.DELETE,
    data?: any,
    extraKeys?: ExtraKeys
  ): Observable<ApiEmptyResponse> {
    return this.buildHttpResponse<any>(endPoint, method, data, extraKeys).pipe(
      switchMap(response => this.handleEmptyResponse(response))
    );
  }

  /**
   * GET request - Retorna SOLO el data
   */
  get<T>(endPoint: string, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.GET, undefined, extraKeys);
  }

  pat<T>(endPoint: string, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.PATCH, undefined, extraKeys);
  }

  /**
   * GET request - Retorna la respuesta COMPLETA
   */
  getFull<T>(endPoint: string, extraKeys?: ExtraKeys): Observable<ApiResponse<T>> {
    return this.requestFull<T>(endPoint, HttpMethodType.GET, undefined, extraKeys);
  }

  /**
   * POST request - Retorna SOLO el data
   */
  post<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.POST, data, extraKeys);
  }

  /**
   * POST request - Retorna la respuesta COMPLETA
   */
  postFull<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiResponse<T>> {
    return this.requestFull<T>(endPoint, HttpMethodType.POST, data, extraKeys);
  }

  /**
   * POST request - Para cuando no esperas data en respuesta
   */
  postEmpty(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiEmptyResponse> {
    return this.requestEmpty(endPoint, HttpMethodType.POST, data, extraKeys);
  }

  /**
   * PUT request - Retorna SOLO el data
   */
  put<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.PUT, data, extraKeys);
  }

  /**
   * PUT request - Retorna la respuesta COMPLETA
   */
  putFull<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiResponse<T>> {
    return this.requestFull<T>(endPoint, HttpMethodType.PUT, data, extraKeys);
  }

  /**
   * PUT request - Para cuando no esperas data en respuesta
   */
  putEmpty(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiEmptyResponse> {
    return this.requestEmpty(endPoint, HttpMethodType.PUT, data, extraKeys);
  }

  /**
   * DELETE request - Retorna SOLO el data
   */
  delete<T>(endPoint: string, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.DELETE, undefined, extraKeys);
  }

  /**
   * DELETE request - Retorna la respuesta COMPLETA
   */
  deleteFull<T>(endPoint: string, extraKeys?: ExtraKeys): Observable<ApiResponse<T>> {
    return this.requestFull<T>(endPoint, HttpMethodType.DELETE, undefined, extraKeys);
  }

  /**
   * DELETE request - Para cuando no esperas data en respuesta (recomendado para DELETE)
   */
  deleteEmpty(endPoint: string, extraKeys?: ExtraKeys): Observable<ApiEmptyResponse> {
    return this.requestEmpty(endPoint, HttpMethodType.DELETE, undefined, extraKeys);
  }

  /**
   * PATCH request - Retorna SOLO el data
   */
  patch<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<T> {
    return this.request<T>(endPoint, HttpMethodType.PATCH, data, extraKeys);
  }

  /**
   * PATCH request - Retorna la respuesta COMPLETA
   */
  patchFull<T>(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiResponse<T>> {
    return this.requestFull<T>(endPoint, HttpMethodType.PATCH, data, extraKeys);
  }

  /**
   * PATCH request - Para cuando no esperas data en respuesta
   */
  patchEmpty(endPoint: string, data: any, extraKeys?: ExtraKeys): Observable<ApiEmptyResponse> {
    return this.requestEmpty(endPoint, HttpMethodType.PATCH, data, extraKeys);
  }

  /**
   * Métodos específicos para operaciones comunes con mensajes de éxito
   */

  // Crear registro
  create<T>(endPoint: string, data: any): Observable<T> {
    return this.post<T>(endPoint, data).pipe(
      switchMap(response => {
        this.errorService.showSuccess('Record created successfully');
        return of(response);
      })
    );
  }

  // Crear registro (con respuesta completa)
  createFull<T>(endPoint: string, data: any): Observable<ApiResponse<T>> {
    return this.postFull<T>(endPoint, data).pipe(
      switchMap(response => {
        this.errorService.showSuccess('Record created successfully');
        return of(response);
      })
    );
  }

  // Actualizar registro
  update<T>(endPoint: string, data: any): Observable<T> {
    return this.put<T>(endPoint, data).pipe(
      switchMap(response => {
        this.errorService.showSuccess('Record updated successfully');
        return of(response);
      })
    );
  }

  // Actualizar registro (con respuesta completa)
  updateFull<T>(endPoint: string, data: any): Observable<ApiResponse<T>> {
    return this.putFull<T>(endPoint, data).pipe(
      switchMap(response => {
        this.errorService.showSuccess('Record updated successfully');
        return of(response);
      })
    );
  }

  // Eliminar registro
  remove(endPoint: string): Observable<ApiEmptyResponse> {
    return this.deleteEmpty(endPoint).pipe(
      switchMap(response => {
        this.errorService.showSuccess('Record deleted successfully');
        return of(response);
      })
    );
  }

  /**
   * Método para peticiones con manejo específico de errores de login
   */
  loginRequest<T>(request: any): Observable<T> {
    return this.post<T>('auth/login', request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.errorService.showModal('Invalid email or password', 'error', 'LOGIN_ERROR', 'Login Failed', 5000);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Login con respuesta completa (por si necesitas tokens en meta, etc)
   */
  loginFullRequest<T>(request: any): Observable<ApiResponse<T>> {
    return this.postFull<T>('auth/login', request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.errorService.showModal('Invalid email or password', 'error', 'LOGIN_ERROR', 'Login Failed', 5000);
        }
        return throwError(() => error);
      })
    );
  }
}
