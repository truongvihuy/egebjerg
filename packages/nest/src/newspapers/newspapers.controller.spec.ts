import { Test, TestingModule } from '@nestjs/testing';
import { NewspapersController } from './newspapers.controller';

describe('NewspapersController', () => {
  let controller: NewspapersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewspapersController],
    }).compile();

    controller = module.get<NewspapersController>(NewspapersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
