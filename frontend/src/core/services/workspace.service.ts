import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { Observable } from 'rxjs';

export interface WorkspaceSessionResponse {
  id: string;
  toolType: string;
  title: string;
  language: string;
  inputCode: string;
  aiResponse: string;
  tokensUsed: number;
  executionTimeMs: number;
  favorite: boolean;
  pinned: boolean;
  shared: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

import { getApiBaseUrl } from './api-config';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  private readonly API_URL = `${getApiBaseUrl()}/api/workspace`;

  getHistory(toolType?: string): Observable<ApiResponse<WorkspaceSessionResponse[]>> {
    const url = toolType ? `${this.API_URL}/history?toolType=${toolType}` : `${this.API_URL}/history`;
    return this.http.get<ApiResponse<WorkspaceSessionResponse[]>>(url);
  }

  getSession(id: string): Observable<ApiResponse<WorkspaceSessionResponse>> {
    return this.http.get<ApiResponse<WorkspaceSessionResponse>>(`${this.API_URL}/history/${id}`);
  }

  toggleFavorite(id: string): Observable<ApiResponse<WorkspaceSessionResponse>> {
    return this.http.put<ApiResponse<WorkspaceSessionResponse>>(`${this.API_URL}/history/${id}/favorite`, {});
  }

  togglePin(id: string): Observable<ApiResponse<WorkspaceSessionResponse>> {
    return this.http.put<ApiResponse<WorkspaceSessionResponse>>(`${this.API_URL}/history/${id}/pin`, {});
  }

  deleteSession(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/history/${id}`);
  }

  async analyzeStream(
    payload: any,
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (err: any) => void,
    signal?: AbortSignal
  ) {
    try {
      const response = await fetch(`${this.API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tokenService.getAccessToken()}`
        },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `Request failed with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported by response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataContent = trimmed.substring(5).trim();
            if (dataContent) {
              onChunk(dataContent);
            }
          }
        }
      }

      if (buffer.trim().startsWith('data:')) {
        const dataContent = buffer.trim().substring(5).trim();
        if (dataContent) {
          onChunk(dataContent);
        }
      }

      onComplete();
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        onError(e);
      }
    }
  }
}
