import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { DiseaseDbService } from './disease-db.service';

describe('DiseaseDbService', () => {
  let service: DiseaseDbService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DiseaseDbService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DiseaseDbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should fetch unique pairs with query parameters', () => {
    const mockResponse = [{ cve_enfermedad: '123', enfermedad: 'Test Disease' }];
    const column1 = 'cve_enfermedad';
    const column2 = 'enfermedad';

    service.getDisease(column1, column2).subscribe({
      next: (data) => {
        expect(data).toEqual(mockResponse);
      }
    });

    const req = httpMock.expectOne(
      `http://127.0.0.1:8000/search/unique-pairs?column1=${column1}&column2=${column2}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('column1')).toBe(column1);
    expect(req.request.params.get('column2')).toBe(column2);
    req.flush(mockResponse);
  });

  it('should handle http error', () => {
    const column1 = 'cve_enfermedad';
    const column2 = 'enfermedad';

    service.getDisease(column1, column2).subscribe({
      next: () => fail('Should have failed with 500 error'),
      error: (error) => {
        expect(error.message).toContain('500');
      }
    });

    const req = httpMock.expectOne(
      `http://127.0.0.1:8000/search/unique-pairs?column1=${column1}&column2=${column2}`
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

});