import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ApiResponse } from '../models/cve_list';

@Injectable({
  providedIn: 'root'
})
export class DiseaseDbService {
  private apiUrl = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) { }

  getDisease(column1: string, column2: string): Observable<any> {
    let fullUrl = this.apiUrl + 'unique_columns';
    const params = new HttpParams()
      .set('column1', column1)
      .set('column2', column2);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getUniqueColumns(requests: string[][]): Observable<ApiResponse[]> {
    let listOfRequests:Observable<ApiResponse>[] = [];
    let fullUrl = this.apiUrl + 'unique_columns';
    requests.map(columns =>{
      let request1: Observable<ApiResponse> = this.http.get<ApiResponse>(`${fullUrl}?column1=${columns[0]}&column2=${columns[1]}`);
      listOfRequests.push(request1)
    })
    return forkJoin(listOfRequests);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
