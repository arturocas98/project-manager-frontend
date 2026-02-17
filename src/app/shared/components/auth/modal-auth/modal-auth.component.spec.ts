import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAuthComponent } from './modal-auth.component';

describe('ModalAuthComponent', () => {
  let component: ModalAuthComponent;
  let fixture: ComponentFixture<ModalAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
