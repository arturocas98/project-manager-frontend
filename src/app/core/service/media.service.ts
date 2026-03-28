import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  constructor(private apiService: ApiService) {}

  uploadMedia(file: File, modelType: string, modelId: number, collectionName?: string): Observable<any> {
    const formData = new FormData();
    formData.append('model_type', modelType);
    formData.append('model_id', modelId.toString());
    formData.append('file', file);
    if (collectionName) {
      formData.append('collection_name', collectionName);
    }

    // Using post with omitContentType true because of multipart forma
    return this.apiService.post<any>('media', formData, { omitContentType: true })
      .pipe(map(res => res.data || res));
  }

  getMedia(modelType?: string, modelId?: number, collectionName?: string): Observable<any[]> {
    let queryParams = [];
    if (modelType) queryParams.push(`filter[model_type]=${encodeURIComponent(modelType)}`);
    if (modelId) queryParams.push(`filter[model_id]=${modelId}`);
    if (collectionName) queryParams.push(`filter[collection_name]=${encodeURIComponent(collectionName)}`);

    // Sort from newest to oldest
    queryParams.push(`sort=-created_at`);

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    return this.apiService.get<any>(`media${queryString}`)
      .pipe(map(res => res.data || res));
  }

  deleteMedia(mediaId: number): Observable<void> {
    return this.apiService.delete<void>(`media/${mediaId}`);
  }
}
