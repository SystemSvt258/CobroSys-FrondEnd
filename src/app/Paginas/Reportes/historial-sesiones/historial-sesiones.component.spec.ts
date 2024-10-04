import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialSesionesComponent } from './historial-sesiones.component';

describe('HistorialSesionesComponent', () => {
  let component: HistorialSesionesComponent;
  let fixture: ComponentFixture<HistorialSesionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialSesionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialSesionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
