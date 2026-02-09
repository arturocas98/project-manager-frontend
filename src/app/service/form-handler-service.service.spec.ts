import { TestBed } from '@angular/core/testing';

import { FormHandlerServiceService } from './form-handler-service.service';

describe('FormHandlerServiceService', () => {
  let service: FormHandlerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormHandlerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
