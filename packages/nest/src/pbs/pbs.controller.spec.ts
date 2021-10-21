import { Test, TestingModule } from '@nestjs/testing';
import { PBSController } from './pbs.controller';

describe('PBSController', () => {
  let controller: PBSController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PBSController],
    }).compile();

    controller = module.get<PBSController>(PBSController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
