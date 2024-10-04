import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialDescansoComponent } from './historial-descanso.component';

describe('HistorialDescansoComponent', () => {
  let component: HistorialDescansoComponent;
  let fixture: ComponentFixture<HistorialDescansoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialDescansoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialDescansoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
