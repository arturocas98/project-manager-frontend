import { TestBed } from '@angular/core/testing';

import { TimedModalService } from './timed-modal.service';

describe('TimedModalService', () => {
  let service: TimedModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimedModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
