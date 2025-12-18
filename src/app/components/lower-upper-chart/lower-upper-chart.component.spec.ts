import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowerUpperChartComponent } from './lower-upper-chart.component';

describe('LowerUpperChartComponent', () => {
  let component: LowerUpperChartComponent;
  let fixture: ComponentFixture<LowerUpperChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowerUpperChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowerUpperChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
