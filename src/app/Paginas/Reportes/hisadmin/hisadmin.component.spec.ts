import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HisadminComponent } from './hisadmin.component';

describe('HisadminComponent', () => {
  let component: HisadminComponent;
  let fixture: ComponentFixture<HisadminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HisadminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HisadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
