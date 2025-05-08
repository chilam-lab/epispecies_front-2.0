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

  getCauseDeathList(id_sickness: string, id_group: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_third_class';
    const params = new HttpParams()
      .set('id_sick', id_sickness)
      .set('id_second_class', id_group);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getGroupList(id_sickness: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_second_class';
    const params = new HttpParams()
      .set('id_sick', id_sickness);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }
 
  getUniqueValues(columns_name: string[]): Observable<any[]> {
    let listOfRequests:Observable<any>[] = [];
    let fullUrl = this.apiUrl + 'unique_columns';
    columns_name.map(column =>{
      let request: Observable<ApiResponse> = this.http.get<ApiResponse>(`${fullUrl}?column_name=${column[0]}`);
      listOfRequests.push(request)
    })
    return forkJoin(listOfRequests);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
