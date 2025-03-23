import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { DiseaseDbService } from '../../services/disease-db.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Use this for testing

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [
        DiseaseDbService,
        provideHttpClient(withInterceptorsFromDi()) // Provide HttpClient for testing
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});