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

  uniquePairColumns(column1: string, column2: string, table: string): Observable<any> {
    let fullUrl = this.apiUrl + 'unique_pair_columns';
    const params = new HttpParams()
      .set('column1', column1)
      .set('column2', column2)
      .set('table', table);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getThirdClassList(search_id_first_class: string, search_id_second_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_third_level_class';
    const params = new HttpParams()
      .set('search_id_first_class', search_id_first_class)
      .set('search_id_second_class', search_id_second_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getSecondClassList(search_id_first_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_second_level_class';
    const params = new HttpParams()
      .set('search_id_first_class', search_id_first_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }
 
  getUniqueValues(columns_name: string[]): Observable<any[]> {
    let listOfRequests:Observable<any>[] = [];
    let fullUrl = this.apiUrl + 'unique_values_by_column';
    columns_name.map(column =>{
      let request: Observable<ApiResponse> = this.http.get<ApiResponse>(`${fullUrl}?column_name=${column}&table=RAWDATA`);
      listOfRequests.push(request)
    })
    return forkJoin(listOfRequests);
  }

  getDataByYear(year: string, search_id_first_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'records_by_year_by_column';
    const params = new HttpParams()
      .set('year', year)
      .set('search_id_first_class', search_id_first_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }
  getAllFrom(table: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_all_by_table';
    const params = new HttpParams()
      .set('table', table)

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
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
