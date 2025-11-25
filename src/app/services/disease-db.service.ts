import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ApiResponse } from '../models/cve_list';
import { Record } from '../models/cve_list';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DiseaseDbService {
  private apiUrl = environment.urlDeseaseDB;

  constructor(private http: HttpClient) { }

  uniquePairColumns(column1: string, column2: string, table: string): Observable<any> {
    let fullUrl = this.apiUrl + 'unique_pair_columns';
    const params = new HttpParams()
      .set('column1', column1.toLowerCase())
      .set('column2', column2.toLowerCase())
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

  getDataByYear(year: string, search_id_first_class: string): Observable<Record[]> {
    let fullUrl = this.apiUrl + 'records_by_year_by_column';
    const params = new HttpParams()
      .set('year', year)
      .set('search_id_first_class', search_id_first_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getDataByYearInTable(year: string, table: string): Observable<any[]> {
    let fullUrl = this.apiUrl + 'records_by_year';
    const params = new HttpParams()
      .set('year', year)
      .set('table', table);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllFrom(table: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_all_by_table';
    const params = new HttpParams()
      .set('table', table.toUpperCase())

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getCategoriesBy(year: string): Observable<any> {
    let fullUrl = this.apiUrl + 'categories';
    const params = new HttpParams().set('year', year)
    return this.http.get<any>(fullUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getCalcVariablesBy(categoria:string, year: string, cve_enfermedad:string, cve_grupo:string,
                     cve_causa_def:string, cve_metropoli: string, cve_estado: string,
                     edad: string, genero:string): Observable<any> {
    let fullUrl = this.apiUrl + 'calculate_variables';
    let params = new HttpParams()
      .set('categoria', categoria)
      .set('year', year)
      .set('cve_enfermedad', cve_enfermedad);

    // if (cve_grupo) params = params.set('cve_grupo', cve_grupo);
    // if (cve_causa_def) params = params.set('cve_causa_def', cve_causa_def);
    // if (cve_metropoli) params = params.set('cve_metropoli', cve_metropoli);
    // if (cve_estado) params = params.set('cve_estado', cve_estado);
    // if (edad) params = params.set('edad', edad);
    // if (genero) params = params.set('genero', genero);

    return this.http.get<any>(fullUrl, { params })
      .pipe(catchError(this.handleError));
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
