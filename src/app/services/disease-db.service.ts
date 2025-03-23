import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiseaseDbService {
  private apiUrl = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) { }

  getDisease(column1: string, column2: string): Observable<any> {
    let fullUrl = this.apiUrl + 'search/unique-pairs';
    const params = new HttpParams()
      .set('column1', column1)
      .set('column2', column2);

    return this.http.get<any>(fullUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
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
