import { Test, TestingModule } from '@nestjs/testing';
import { ZipCodeController } from './zip-code.controller';

describe('ZipCodeController', () => {
  let controller: ZipCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZipCodeController],
    }).compile();

    controller = module.get<ZipCodeController>(ZipCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
