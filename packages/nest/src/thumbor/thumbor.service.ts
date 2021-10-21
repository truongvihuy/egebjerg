import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThumborService {

  constructor(
    private configService: ConfigService,
  ) { }
  private readonly thumborServerApi = this.configService.get<string>('thumborServer') + '/api';
  private readonly thumborToken = 'Bearer ' + this.configService.get<string>('thumborToken');

  async delete(condition) {
    try {
      await axios.delete(this.thumborServerApi, {
        data: `id=${condition.uuid}`,
        headers: {
          Authorization: this.thumborToken,
        }
      });
    } catch (e) {
      console.log(e.message);
    }

    return {
      success: true
    };
  }

  async deleteMany(uidList) {
    uidList.forEach(async (uid) => {
      try {
        await axios.delete(this.thumborServerApi, {
          data: `id=${uid}`,
          headers: {
            Authorization: this.thumborToken,
          }
        });
      } catch (e) {
        console.log(e);
      }
    });

    return {
      success: true
    };
  }
}