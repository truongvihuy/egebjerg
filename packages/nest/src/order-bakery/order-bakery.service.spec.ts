import { Test, TestingModule } from '@nestjs/testing';
import { OrderBakeryService } from './order-bakery.service';

describe('OrderBakeryService', () => {
  let service: OrderBakeryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderBakeryService],
    }).compile();

    service = module.get<OrderBakeryService>(OrderBakeryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
