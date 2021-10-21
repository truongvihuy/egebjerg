import { Test, TestingModule } from '@nestjs/testing';
import { NewspapersService } from './newspapers.service';

describe('NewspapersService', () => {
  let service: NewspapersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewspapersService],
    }).compile();

    service = module.get<NewspapersService>(NewspapersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
