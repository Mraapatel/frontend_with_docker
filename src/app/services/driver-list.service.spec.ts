import { TestBed } from '@angular/core/testing';

import { DriverListService } from './driver-list.service';

describe('DriverListService', () => {
  let service: DriverListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
