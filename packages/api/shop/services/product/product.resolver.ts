import { Resolver, Query, Arg, Int, ObjectType, Ctx } from 'type-graphql';
import Product, { ProductResponse } from './product.type';
import Suggest from './suggest.type';
import { getDb } from '../../../helper/db.helper';
import { getProductList, getProduct } from './product.query';
import { SORT_CONDITION_MAP } from '../../../config/constant';
import config from '../../../config/config';
const elasticSearch = config.elasticSearch;
@Resolver()
export class ProductResolver {
  @Query((returns) => ProductResponse, { description: 'Get all the products' })

  async products(
    @Ctx() context: any,
    @Arg('limit', (type) => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', (type) => Int, { defaultValue: 0 }) offset: number,
    @Arg('q', { nullable: true }) q?: string,
    @Arg('category_id', (type) => [Int], { nullable: true }) category_id?: number[],
    @Arg('is_coop_xtra', { nullable: true }) is_coop_xtra?: boolean,
    @Arg('is_ecology', { nullable: true }) is_ecology?: boolean,
    @Arg('is_frozen', { nullable: true }) is_frozen?: boolean,
    @Arg('is_offer', { nullable: true }) is_offer?: boolean,
    @Arg('is_active', { nullable: true, defaultValue: true }) is_active?: boolean,
    @Arg('product_id', (type) => [Int], { nullable: true }) product_id?: number[],
    @Arg('isMembership', { nullable: true }) isMembership?: boolean,
    @Arg('sort', { nullable: true }) sort?: string,
    @Arg('t', { nullable: true }) t?: string,
  ): Promise<ProductResponse> {
    let db = await getDb();
    let condition: any = {};

    let categoryFields = {
      _id: 1,
      children: 1
    };

    const processKeyword = (keyword: string) => {
      // special character will be replace to space character so we cannot found what we need
      // We must process these keyword when index and search
      // For example: we cannot search item number: 17-1040 so we must process it to 171040
      if (typeof keyword === 'string') {
        keyword = keyword.trim();
        if (/^([\d\-]+$)/.exec(keyword)) {
          return keyword.replace(/\-/ig, '');
        }
      }

      return keyword;
    }

    const inactiveCategoryItemList = await db.collection('category').find({ active: false }, categoryFields).toArray();
    let inactiveCategoryMap = <any>{};
    let inactiveCategoryList = <any>[];
    inactiveCategoryItemList.forEach((cat: { _id: number; }) => {
      inactiveCategoryMap[cat._id] = 1;
      inactiveCategoryList.push(cat._id);
    });
    if (category_id) {
      let categoryList = await db.collection('category').find({ _id: { $in: category_id }, active: true }, categoryFields).toArray();
      if (!categoryList.length) {
        return new ProductResponse({
          total: 0,
          hasMore: false,
          items: []
        });
      }

      if (categoryList.length) {
        let categoryIdList = <any>[];

        categoryList.forEach((category: any) => {
          if (category.children) {
            category.children.forEach((catId: number) => {
              if (!inactiveCategoryMap[catId]) {
                categoryIdList.push(catId);
              }
            });
          }
        })

        condition['category_id'] = {
          $in: categoryIdList
        };
      }
    } else {
      condition['category_id'] = {
        $not: {
          $all: inactiveCategoryList
        }
      };
    }

    if (!!q) {
      q = processKeyword(q);

      let queryElastic: any = {
        index: 'egebjerg-product',
        size: 1000,
        body: {
          query: {}
        }
      };

      if (!!product_id) {
        queryElastic.body.query = {
          bool: {
            must: {
              match: {
                full_text: {
                  query: q,
                  operator: 'and'
                },
              },
            },
            filter: {
              terms: {
                _id: product_id
              }
            }
          }
        }
      } else {
        queryElastic.body.query = {
          match: {
            full_text: {
              query: q,
              operator: 'and'
            },
          },
        }

      }
      console.log(JSON.stringify(queryElastic));
      const response = (await elasticSearch.search(queryElastic)).body;

      if (response.hits.total.value === 0) {
        condition['name'] = new RegExp(q, 'ui');
      } else {
        condition['_id'] = {
          $in: response.hits.hits.map((x: any) => {
            return parseInt(x._id);
          })
        }
      }
    } else {
      if (product_id) {
        if (typeof condition._id != 'undefined') {
          condition['_id']['$in'] = condition['_id']['$in'].filter((x: any) => product_id.includes(x));
        } else {
          condition['_id'] = {
            '$in': product_id
          };
        }
      }
    }

    if (is_coop_xtra) {
      condition['is_coop_xtra'] = is_coop_xtra;
    }
    if (is_ecology) {
      condition['is_ecology'] = is_ecology;
    }
    if (is_frozen) {
      condition['is_frozen'] = is_frozen;
    }
    if (is_offer && is_active) {
      condition['status'] = 3;
    } else {
      if (is_offer) {
        condition['status'] = {
          '$gte': 2
        };
      }
      if (is_active) {
        condition['status'] = {
          '$gt': 0
        };
      }
    }
    console.log(condition)

    let sortObject: any = null;
    if (sort) {
      sortObject = SORT_CONDITION_MAP[sort];
    }
    let { productList, countTotal } = await getProductList(condition, context.customer?.store_id ?? null, offset, limit, sortObject, isMembership);
    const total = productList.length;

    let filteredData = {
      hasMore: (total + offset) < countTotal,
      items: productList
    };
    console.log('countTotal', countTotal);
    return new ProductResponse({
      total: countTotal,
      ...filteredData
    });
  }

  @Query(() => Product)
  async product(
    @Arg('slug', (type) => String) slug: string
  ): Promise<Product | undefined> {

    return await getProduct({ slug });
  }

  @Query(() => [Product], { description: 'Get the Related products' })
  async relatedProducts(
    @Ctx() context: any,
    @Arg('slug', (slug) => String) slug: string,
    @Arg('type', { nullable: true }) type?: string
  ): Promise<any> {
    let condition: any = {
      slug: {
        $ne: slug
      }
    };
    if (type) {
      condition.type = type;
    }
    const relatedItem = await getProductList(condition, context.customer?.store_id ?? null);

    return relatedItem;
    // const relatedItem = await getRelatedItems(type, slug, this.items);
    // return relatedItem;
  }

  @Query(() => [Suggest], { description: 'Get suggestions' })
  async suggestProduct(
    @Arg('keyword', () => String) keyword: string,
  ): Promise<any> {
    let responseSuggestion: any = [];
    // Get suggest text
    let queryElastic: any = {
      index: 'egebjerg-product',
      size: 5,
      body: {
        query: {},
        highlight: {
          pre_tags: '<b>',
          post_tags: '</b>',
          fields: {
            full_text: {},
          },
        },
        suggest: {
          text: keyword,
          'keyword': {
            phrase: {
              field: 'full_text',
              highlight: {
                pre_tag: '<b>',
                post_tag: '</b>',
              },
            },
          },
          /* 'autocomplete': {
            prefix: keyword,
            completion: {
              field: 'name_comp'
            },
          }, */
        },
      },
    };

    queryElastic.body.query = {
      bool: {
        should: [
          {
            match_phrase_prefix: {
              full_text: { query: keyword, },
            },
          },
          {
            match_phrase_prefix: {
              full_text: { query: keyword, },
            },
          },
        ],
        must: []
      },
    };

    /* queryElastic.body.suggest.autocomplete.completion = {
      ...queryElastic.body.suggest.autocomplete.completion,
      contexts: {
        category_id: [1290],
      }
    } */

    queryElastic.body.query.bool.must.push({
      range: {
        status: {
          gt: 0,
        }
      }
    });
    queryElastic.body.query.bool.must.push({
      term: {
        just_backend: false
      }
    });

    let response = (await elasticSearch.search(queryElastic)).body;

    console.log(`Elastic query:\n${JSON.stringify(queryElastic.body)}\nTotal: ${response.took}\n-------------`);
    console.log(response.suggest.keyword[0]);

    /* responseSuggestion = responseSuggestion.concat(response.suggest.keyword[0].options);

    responseSuggestion = responseSuggestion.concat(
      response.suggest.autocomplete[0].options.map((op: any) => (
        {
          text: op.text,
          highlighted: op.highlight.name[0],
        }
      ))
    ); */

    if (response.hits.total.value > 0) {
      let hits = response.hits.hits;
      let productMap: any = {};
      let { productList } = await getProductList({
        _id: {
          $in: hits.map((x: any) => parseInt(x._id))
        }
      });
      productList.forEach((x: any) => {
        productMap[x._id] = x;
      })
      responseSuggestion = responseSuggestion.concat(
        hits.map((x: any) => ({
          _id: parseInt(x._id),
          text: x._source.name,
          highlighted: x.highlight?.full_text[0] ? x.highlight?.full_text[0].split('||')[1] : (productMap[x._id].name ?? ''),
          ...x._source,
          ...productMap[x._id]
        }))
      );
    }


    return responseSuggestion;
  }
}
