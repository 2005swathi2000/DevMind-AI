import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './workspace.service';

export interface JobResponse {
  id: string;
  toolType: string;
  provider: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  inputCode: string;
  language: string;
  response: string;
  errorMessage: string;
  retryCount: number;
  createdAt: string;
  startedAt: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/jobs';

  submitJob(payload: {
    code: string;
    toolType: string;
    language: string;
    provider: string;
  }): Observable<ApiResponse<JobResponse>> {
    return this.http.post<ApiResponse<JobResponse>>(this.API_URL, payload);
  }

  getJobs(): Observable<ApiResponse<JobResponse[]>> {
    return this.http.get<ApiResponse<JobResponse[]>>(this.API_URL);
  }

  getJob(id: string): Observable<ApiResponse<JobResponse>> {
    return this.http.get<ApiResponse<JobResponse>>(`${this.API_URL}/${id}`);
  }

  cancelOrDeleteJob(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
