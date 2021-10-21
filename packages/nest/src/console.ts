import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie from 'fastify-cookie';
import { TaskService } from './task/task.service';
const cookieParser = require('cookie-parser')
declare const module: any;
const parseArgv = () => {
  let argvList = process.argv.slice(2);
  let taskName = argvList.shift();
  let params = {};
  argvList.forEach(argv => {
    let splitArgv = argv.split('=');
    params[splitArgv[0]] = splitArgv[1];
  })
  return {
    ...params,
    taskName
  }
}
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule
  );
  const taskService = app.get(TaskService);
  let params = parseArgv();
  switch (params.taskName) {
    case 'updateProductAddStoreId':
      let storeId: any = process.argv.find(x => (x.indexOf('storeId') > -1));
      let setStoreList: any = process.argv.find(x => (x.indexOf('store_list') > -1));
      if (storeId) {
        storeId = storeId.replace('storeId=', '');
        if (storeId == 'all') {
          await taskService.updateProductAddAllStoreId();
        } else {
          storeId = +storeId;
          if (setStoreList) {
            setStoreList = setStoreList.replace('store_list=', '') == 'true';
          }
          await taskService.updateProductAddStoreId(storeId, !!setStoreList);
        }
      }
      break;
    default:
      if (typeof taskService[params.taskName] === 'function') {
        await taskService[params.taskName](params);
        break;
      } else {
        console.log('Command not found');
        process.exit(1);
      }
  }
  process.exit(0);
}
bootstrap();