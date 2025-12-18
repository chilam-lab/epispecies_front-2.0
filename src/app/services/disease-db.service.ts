import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
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
  private headers = new HttpHeaders({
      'Content-Type': 'application/json'
  });

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

  getPopulationBy(year: string, cve_state:string, cve_metropoli: string,
                  age_group: string, gender:string, cvegeo:string): Observable<number> {
    let fullUrl = this.apiUrl + 'get_all_population';
    let params = new HttpParams().set('year', year)

    if (cvegeo) params = params.set('cvegeo', cvegeo);
    if (cve_metropoli && cve_metropoli == environment.selectedMetropoli) params = params.set('cve_metropoli', "all");
    if (cve_metropoli && cve_metropoli != environment.selectedMetropoli) params = params.set('cve_metropoli', cve_metropoli);
    if (cve_state) params = params.set('cve_state', cve_state);
    if (age_group) params = params.set('age_group', age_group);
    if (gender == "1") params = params.set('gender', "HOMBRES");
    if (gender == "2") params = params.set('gender', "MUJERES");

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPopulationByCveList(year: string, cve_state:String[],
                  age_group: string, gender:string, cvegeo:String[]): Observable<{ [key: string]: number }>{
    let fullUrl = this.apiUrl + 'get_population_batch';
    const body: any = { year };

    if (cvegeo.length > 0) body.cvegeos = cvegeo;
    if (cve_state.length > 0) body.cve_states = cve_state;
    if (age_group) body.age_group = age_group;
    if (gender == "1") body.gender = "HOMBRES";
    if (gender == "2") body.gender = "MUJERES";
    console.log("PARMAS🛼")
    console.log(body)

    return this.http.post<{ [key: string]: number }>(fullUrl, body, { headers: this.headers })
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

  getCategoriesBy(year: string, cve_metropoli:string, cve_estado: number): Observable<any> {
    let fullUrl = this.apiUrl + 'categories';
    let params = new HttpParams().set('year', year)

    if (cve_metropoli && cve_metropoli == environment.selectedMetropoli) params = params.set('cve_metropoli', "all");
    if (cve_metropoli && cve_metropoli != environment.selectedMetropoli) params = params.set('cve_metropoli', cve_metropoli);
    if (cve_estado) params = params.set('cve_state', cve_estado);

    return this.http.get<any>(fullUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getCalcVariablesByMultiple(
    categories: string[],
    year: string,
    cve_enfermedad: string,
    cve_grupo: string,
    cve_causa_def: string,
    cve_metropoli: string,
    cve_estado: string,
    age: string,
    gender: string
  ): Observable<any[]> {
    const fullUrl = this.apiUrl + 'calculate_variables';
    const listOfRequests: Observable<any>[] = [];

    categories.forEach(category => {
      let params = new HttpParams()
        .set('category', category)
        .set('year', year)
        .set('cve_enfermedad', cve_enfermedad);

      if (cve_grupo != environment.placeholderSecondClass) {
        params = params.set('cve_grupo', cve_grupo);
      }
      if (cve_causa_def != environment.placeholderThirdClass) {
        params = params.set('cve_causa_def', cve_causa_def);
      }
      if (cve_metropoli && cve_metropoli == environment.selectedMetropoli) {
        params = params.set('cve_metropoli', "all");
      }
      if (cve_metropoli && cve_metropoli != environment.selectedMetropoli) {
        params = params.set('cve_metropoli', cve_metropoli);
      }
      if (cve_estado) {
        params = params.set('cve_estado', Number(cve_estado));
      }
      if (age != environment.placeholderAge) {
        params = params.set('age', age);
      }
      if (gender != environment.placeholderGender) {
        params = params.set('gender', gender);
      }

      const request = this.http.get<any>(fullUrl, { params })
        .pipe(catchError(this.handleError));
      listOfRequests.push(request);
    });

    return forkJoin(listOfRequests);
  }


  getCalcVariablesBy(category:string, year: string, cve_enfermedad:string, cve_grupo:string,
                     cve_causa_def:string, cve_metropoli: string, cve_estado: string,
                     age: string, gender:string): Observable<any> {
    let fullUrl = this.apiUrl + 'calculate_variables';
    let params = new HttpParams()
      .set('category', category)
      .set('year', year)
      .set('cve_enfermedad', cve_enfermedad);

    if (cve_grupo != environment.placeholderSecondClass) params = params.set('cve_grupo', cve_grupo);
    if (cve_causa_def != environment.placeholderThirdClass) params = params.set('cve_causa_def', cve_causa_def);
    if (cve_metropoli && cve_metropoli == environment.selectedMetropoli) params = params.set('cve_metropoli', "all");
    if (cve_metropoli && cve_metropoli != environment.selectedMetropoli) params = params.set('cve_metropoli', cve_metropoli);
    if (cve_estado) params = params.set('cve_estado', Number(cve_estado));
    if (age != environment.placeholderAge) params = params.set('age', age);
    if (gender != environment.placeholderGender) params = params.set('gender', gender);

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
