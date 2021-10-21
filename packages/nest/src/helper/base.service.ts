import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { camelCase } from 'lodash';
import { CounterService } from '../counter/counter.service';
import { processProjection } from './mongo.helper';
import { ConfigService } from '@nestjs/config';
import { ELASTIC_INDEX, MAX_RETRY_INSERT } from '../config/constants';
import { getNow, convertUnixTime } from '../helper/general.helper';

const fs = require('fs');
export default class BaseService {
  constructor(
    public counterService: CounterService,
    public configService: ConfigService
  ) { }
  protected elasticSearch = this.configService.get<any>('elasticSearch');

  public traceList = [];

  async save(model: any, collectionName: string, processFnPreSave: any = null, processFnRetry: any = null) {
    let retry = 0;
    let _id = null;

    while (retry < MAX_RETRY_INSERT) {
      try {
        _id = await this.counterService.getMaxIdByCounter(collectionName);
        if (typeof processFnPreSave === 'function') {
          await processFnPreSave(_id, model);
        }
        model._id = _id;
        const res = await model.save();
        await this.counterService.increaseCounter(collectionName);

        return res;
      } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          if (typeof processFnRetry === 'function') {
            await processFnRetry(_id, model);
          }
          retry++;
        } else {
          this.logError(err, collectionName, __filename);
          return this.processError(err);
        }
      }
    }
  }

  async updateById(_id: number, data: object, model: any, returnNew: boolean = true) {
    try {
      const res = await model.findByIdAndUpdate(
        { _id },
        data,
        {
          lean: true, // returned plain javascript objects, not Mongoose Documents
          new: returnNew, // returned new data
        }
      );

      return res;
    } catch (error) {
      this.logError(error, '', __filename);
      return this.processError(error);
    }
  }

  async remove(_id: number, model: any, collectionName: string, collectionListToCheck: null | string[] = null) {
    let item = await model.findOne({ _id });
    if (!item) {
      return {
        success: true
      };
    }

    if (collectionListToCheck) {
      let params = {};
      if (collectionName === 'zip_code') {
        params = {
          '$or': [
            {
              [`${collectionName}_id`]: _id,
            }, {
              [`billing.${collectionName}_id`]: _id,
            }
          ]
        }
      } else {
        params[`${collectionName}_id`] = _id;
      }

      for (const collection of collectionListToCheck) {
        let serviceName = `${camelCase(collection)}Service`;
        const relatedItem = await this[serviceName].findOneByCondition(params, { _id: 1, name: 1, zip_code: 1 });
        if (relatedItem) {
          let columnName;
          switch (collection) {
            case 'zip_code':
              columnName = 'zip_code';
              break;
            default:
              columnName = 'name';
          }
          throw new InternalServerErrorException(`Relateret med ${collection}: ${relatedItem[columnName]}`);
        }
      }
    }

    try {
      const res = await item.remove();
      if (res) {
        return {
          success: true
        }
      }
    } catch (error) {
      this.logError(error, collectionName, __filename);
      return this.processError(error, 'Sletning mislykkedes'); // Delete failed
    }
  }

  async processError(error, defaultMessage = 'Error!') {
    let errorCode = error.message.split(' ')[0];
    if (errorCode === 'E11000') {
      let match = /dup key: {(.+?)}/s.exec(error.message);
      throw new ForbiddenException(`${match[1]} eksisterer allerede`); //already exist
    }
    throw new InternalServerErrorException(defaultMessage);
  }

  async processProjection(projectionList: string[]) {
    processProjection(projectionList);
  };

  async addIndex(itemIndex, collectionName) {
    let id = itemIndex._id;
    delete itemIndex._id;
    let indexParams: any = {
      index: `egebjerg-${collectionName}`,
      id: id,
      body: {
        ...itemIndex,
      }
    };
    // if (collectionName !== 'product') {
    //   indexParams.type = collectionName;
    // }
    await this.elasticSearch.index(indexParams);
  }

  async deleteIndex(id, collection) {
    try {
      await this.elasticSearch.delete({
        index: ELASTIC_INDEX[collection],
        id: id,
      })
    } catch (e) {
      this.logError(e, collection, __filename);
    }
  }

  // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/bulk_examples.html
  async processElasticBulkResult(res, dataSet) {
    const { body: bulkResponse } = res;
    if (bulkResponse.errors) {
      const erroredDocuments = []
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0]
        if (action[operation].error) {
          erroredDocuments.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: dataSet[i * 2],
            document: dataSet[i * 2 + 1]
          })
        }
      })
      console.log(erroredDocuments)
    }
  }

  async logError(e, service = 'unknow', file = 'unknow') {
    const assetPath = this.configService.get<any>('assetsPath');
    const errorLogFilePath = `${assetPath}/error.log`;
    let errMessage = `\n${convertUnixTime(getNow())} Service: ${service} File: ${file} \n` + e.toString();
    fs.appendFileSync(errorLogFilePath, errMessage);
  }

  async trace(message) {
    this.traceList.push([message, getNow()]);
  }
}