import { HttpStatus, HttpException } from '@nestjs/common';
export class StatusException extends HttpException {
  constructor(data, status: HttpStatus) {
    super(data, status);
  }
}