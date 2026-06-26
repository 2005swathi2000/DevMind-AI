import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface AnalyticsSummaryResponse {
  totalRequests: number;
  averageLatencyMs: number;
  cacheHitRate: number;
  successRate: number;
  totalEstimatedTokens: number;
  requestsByProvider: { [key: string]: number };
  requestsByToolType: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/analytics';

  getSummary(): Observable<ApiResponse<AnalyticsSummaryResponse>> {
    return this.http.get<ApiResponse<AnalyticsSummaryResponse>>(`${this.API_URL}/summary`);
  }
}
