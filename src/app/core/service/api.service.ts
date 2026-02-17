// api.service.ts
import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from "@angular/common/http";
import { Observable, throwError, of, TimeoutError } from "rxjs";
import { catchError, timeout, switchMap } from "rxjs/operators";
import { HttpHeadersService, ExtraKeys } from "./http-headers.service";
import { ErrorService } from "./error.service";
import { environment } from "src/environments/environment";

export enum HttpMethodType {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  private readonly TIMEOUT = 15000;

  constructor(
    private http: HttpClient,
    private headersService: HttpHeadersService,
    private errorService: ErrorService,
  ) {}

  /**
   * Construye la URL base
   */
  private buildBaseUrl(endPoint: string): string {
    if (!endPoint.startsWith("http")) {
      return `${this.API_URL}/${endPoint}`;
    }
    return endPoint;
  }

  /**
   * Método principal para construir y ejecutar peticiones HTTP
   * Similar a buildHttpResponse de Dart
   */
  buildHttpResponse<T>(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.GET,
    request?: any,
    extraKeys?: ExtraKeys,
  ): Observable<HttpResponse<T>> {
    const headers = this.headersService.buildHeaderTokens(extraKeys, endPoint);
    const url = this.buildBaseUrl(endPoint);

    console.log(`URL (${method}): ${url}`);

    if (
      request &&
      (method === HttpMethodType.POST ||
        method === HttpMethodType.PUT ||
        method === HttpMethodType.PATCH)
    ) {
      console.log("Request:", JSON.stringify(request));
    }

    let httpCall: Observable<HttpResponse<T>>;

    switch (method) {
      case HttpMethodType.POST:
        httpCall = this.http.post<T>(url, request, {
          headers,
          observe: "response",
        });
        break;
      case HttpMethodType.PUT:
        httpCall = this.http.put<T>(url, request, {
          headers,
          observe: "response",
        });
        break;
      case HttpMethodType.DELETE:
        httpCall = this.http.delete<T>(url, {
          headers,
          observe: "response",
        });
        break;
      case HttpMethodType.PATCH:
        httpCall = this.http.patch<T>(url, request, {
          headers,
          observe: "response",
        });
        break;
      default: // GET
        httpCall = this.http.get<T>(url, {
          headers,
          observe: "response",
        });
    }

    return httpCall.pipe(
      timeout(this.TIMEOUT),
      catchError((error) => this.handleHttpError(error)),
    );
  }

  /**
   * Maneja errores HTTP genéricos
   */
  private handleHttpError(error: any): Observable<never> {
    console.error("HTTP Error:", error);

    // Usar modal para errores de red
    if (!navigator.onLine) {
      this.errorService.showModal(
        "No internet connection available",
        "error",
        "NETWORK_ERROR",
        "Network Error",
      );
      return throwError(() => new Error("Internet not available"));
    }

    if (error instanceof TimeoutError) {
      this.errorService.showModal(
        "Request timeout. Please try again.",
        "warning",
        "TIMEOUT_ERROR",
        "Request Timeout",
        4000,
      );
      return throwError(() => new Error("Request timeout"));
    }

    // Para otros errores HTTP
    if (error instanceof HttpErrorResponse) {
      this.errorService.handleError(error);
    } else {
      this.errorService.showModal(
        "Something went wrong",
        "error",
        "UNKNOWN_ERROR",
        "Error",
      );
    }

    return throwError(() => error);
  }

  /**
   * Maneja la respuesta HTTP y la transforma usando un parser
   * Similar a handleResponse de Dart
   */
  handleResponse<T>(
    response: HttpResponse<T>,
    parser: (data: any, status?: number) => T,
  ): Observable<T> {
    // Verificar conexión a internet
    if (!navigator.onLine) {
      this.errorService.showModal(
        "No internet connection available",
        "error",
        "NETWORK_ERROR",
        "Network Error",
      );
      return throwError(() => new Error("Internet not available"));
    }

    const statusCode = response.status;

    if (statusCode >= 200 && statusCode < 300) {
      try {
        const body = response.body;
        return of(parser(body, statusCode));
      } catch (error) {
        this.errorService.showModal(
          "Invalid response format from server",
          "error",
          "PARSE_ERROR",
          "Parse Error",
        );
        return throwError(() => new Error("Invalid response format"));
      }
    }

    // Usar modal para errores HTTP específicos
    const errorMessage = this.errorService.mapError(statusCode, response.body);
    this.errorService.showModalByStatusCode(statusCode, errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Método principal de solicitud - similar al patrón de Dart
   */
  request<T>(
    endPoint: string,
    method: HttpMethodType = HttpMethodType.GET,
    data?: any,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.buildHttpResponse<T>(endPoint, method, data, extraKeys).pipe(
      switchMap((response) =>
        this.handleResponse(
          response,
          parser || ((d: any, s?: number) => d as T),
        ),
      ),
    );
  }

  /**
   * Métodos helpers para tipos de petición específicos
   * Similar a los métodos estáticos de Dart
   */

  // GET request
  get<T>(
    endPoint: string,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.request<T>(
      endPoint,
      HttpMethodType.GET,
      undefined,
      extraKeys,
      parser,
    );
  }

  // POST request
  post<T>(
    endPoint: string,
    data: any,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.request<T>(
      endPoint,
      HttpMethodType.POST,
      data,
      extraKeys,
      parser,
    );
  }

  // PUT request
  put<T>(
    endPoint: string,
    data: any,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.request<T>(
      endPoint,
      HttpMethodType.PUT,
      data,
      extraKeys,
      parser,
    );
  }

  // DELETE request
  delete<T>(
    endPoint: string,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.request<T>(
      endPoint,
      HttpMethodType.DELETE,
      undefined,
      extraKeys,
      parser,
    );
  }

  // PATCH request
  patch<T>(
    endPoint: string,
    data: any,
    extraKeys?: ExtraKeys,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.request<T>(
      endPoint,
      HttpMethodType.PATCH,
      data,
      extraKeys,
      parser,
    );
  }

  /**
   * Métodos específicos para operaciones comunes con mensajes de éxito
   */

  // Crear registro
  create<T>(
    endPoint: string,
    data: any,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.post<T>(endPoint, data, undefined, parser).pipe(
      switchMap((response) => {
        this.errorService.showSuccess("Record created successfully");
        return of(response);
      }),
    );
  }

  // Actualizar registro
  update<T>(
    endPoint: string,
    data: any,
    parser?: (data: any) => T,
  ): Observable<T> {
    return this.put<T>(endPoint, data, undefined, parser).pipe(
      switchMap((response) => {
        this.errorService.showSuccess("Record updated successfully");
        return of(response);
      }),
    );
  }

  // Eliminar registro
  remove<T>(endPoint: string, parser?: (data: any) => T): Observable<T> {
    return this.delete<T>(endPoint, undefined, parser).pipe(
      switchMap((response) => {
        this.errorService.showSuccess("Record deleted successfully");
        return of(response);
      }),
    );
  }

  /**
   * Método para peticiones con manejo específico de errores de login
   */
  loginRequest<T>(request: any, parser: (data: any) => T): Observable<T> {
    return this.post<T>("auth/login", request, undefined, parser).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.errorService.showModal(
            "Invalid email or password",
            "error",
            "LOGIN_ERROR",
            "Login Failed",
            5000,
          );
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Método genérico para cualquier tipo de petición con cualquier request
   * Similar al patrón de Dart que mostraste
   */
  staticRequest<T>(
    endPoint: string,
    method: HttpMethodType,
    request: any,
    parser: (data: any, status?: number) => T,
    extraKeys?: ExtraKeys,
  ): Observable<T> {
    return this.request<T>(endPoint, method, request, extraKeys, parser);
  }
}
