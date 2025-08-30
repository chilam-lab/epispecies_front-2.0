import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = 'https://nutricion.c3.unam.mx/chilam/mallas/regions/region-grids';

  constructor(private http: HttpClient) { }


  //http://chilamdev.c3.unam.mx:5001/regions/region-cells/18
  //https://nutricion.c3.unam.mx/chilam/mallas/regions/region-grids/18

  getStates(id: number): Observable<any> {
    let fullUrl = this.apiUrl + '/'+ id;

    return this.http.get<any>(fullUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCauseDeathList(search_id_first_class: string, search_id_second_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_third_level_class';
    const params = new HttpParams()
      .set('search_id_first_class', search_id_first_class)
      .set('search_id_second_class', search_id_second_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getGroupList(search_id_first_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'get_second_level_class';
    const params = new HttpParams()
      .set('search_id_first_class', search_id_first_class);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }


  getDataByYear(year: string, search_id_first_class: string): Observable<any> {
    let fullUrl = this.apiUrl + 'records_by_year_by_column';
    const params = new HttpParams()
      .set('year', year)
      .set('search_id_first_class', search_id_first_class.toLowerCase());

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
