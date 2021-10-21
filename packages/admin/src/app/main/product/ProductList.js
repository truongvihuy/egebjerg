import { useEffect, useState, useCallback } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridToolbar, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { Link } from '@material-ui/core';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { showSuccessMessage, showErrorMessage, showLoadingMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
// prettier-ignore
import {
  MultiSelectFilterCell, TextFilterCell, DropdownFilterCell, PriceCell,
  ItemNumberCell, GridToolbarCustom, CustomPaging, StatusFilterCell,
  ProductActiveCell,
} from 'app/kendo/CustomCell';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { getPagePermission, SHOP_URL, MSG_NO_DATA, PAGING_CONFIG, PLACEHOLDER_PRODUCT } from 'app/constants';
import { useGridScrollTop, useKeyListener } from 'app/shared-components/KeyListener';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import ProductDetail from './form/ProductDetail';
import DropdownTreeFilterCell from 'app/kendo/DropdownTreeFilterCell';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import history from '@history';
import { setPagingConfig, initDataState, changeUrlParamByDataState } from 'app/helper/general.helper';
import { useSelector } from 'react-redux';

let total;
const moduleName = 'product';
const filterTypeList = {
  name: 'text',
  brand_id: 'number',
  barcode: 'text',
  tag_id_list: 'number',
  category_id: 'number',
  status: 'number',
  is_frozen: 'boolean',
  is_ecology: 'boolean',
  is_offer: 'boolean',
  is_coop_xtra: 'boolean',
};

const ProductList = props => {
  const cache = useSelector(({ fuse }) => fuse.cache);
  const [data, setData] = useState(null);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [dataState, setDataState] = useState(initDataState(props.query, filterTypeList, moduleName));
  const [sort, setSort] = useState([
    {
      field: '_id',
      dir: 'desc',
    },
  ]);
  const getData = (tmpDataState = dataState, tmpSort = sort) => {
    setLoadingPanel(true);
    setData([]);
    let params = {
      limit: tmpDataState.take,
      page: 1 + (tmpDataState.skip ?? 0) / tmpDataState.take,
    };

    let query = { ...props.query };
    if (tmpDataState.filter) {
      if (tmpDataState.filter.filters.map(x => x.field).includes('_id')) {
        params['_id'] = tmpDataState.filter.filters.find(x => x.field == '_id').value;
      } else {
        tmpDataState.filter.filters.forEach(x => {
          params[x.field] = x.value;
        });
      }
      tmpDataState.filter.filters.forEach(x => {
        query[x.field] = x.value;
      });
    }
    if (tmpSort.length > 0) {
      params.sort = `${tmpSort[0].field}:${tmpSort[0].dir == 'desc' ? -1 : 1}`;
    }
    axios.get(`/products`, { params }).then(response => {
      const newData = response.data.data.product_list;
      if (typeof response.data.data.total != 'undefined') {
        total = response.data.data.total ?? total;
      }
      setData(newData);
      setLoadingPanel(false);
    });
  };
  useKeyListener(1, getData);

  useGridScrollTop([dataState.skip]);
  useEffect(() => {
    let newDataState = initDataState(props.query, filterTypeList, moduleName);
    setDataState(newDataState);

    getData(newDataState, sort);
  }, [props.location, sort]);

  const add = dataItem => {
    axios
      .post(`/products`, {
        ...dataItem,
      })
      .then(response => {
        const newData = [...data];
        newData.unshift(response.data.data);
        setData(newData);
        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(e => {
        props.showErrorMessage();
      });
  };
  const update = dataItem => {
    axios
      .put(`/products/${dataItem._id}`, { ...dataItem })
      .then(response => {
        const newData = data.map(x =>
          x._id === response.data.data._id
            ? {
              ...response.data.data,
              image: response.data.data.image + '?t=' + +new Date(),
            }
            : x,
        );
        setData(newData);
        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(e => {
        props.showErrorMessage();
      });
  };

  const remove = dataItem => {
    axios
      .delete(`/products/${dataItem._id}`)
      .then(response => {
        let newData = [];
        data.forEach(x => {
          if (x._id != dataItem._id) {
            newData.push(x);
          }
        });
        setData(newData);

        props.closeDialog();
        props.showSuccessMessage();
      })
      .catch(e => {
        props.showErrorMessage();
      });
  };

  const handleAdd = dataItem => {
    if (!props.pagePermission.insert) {
      return;
    }

    props.openDialog({
      maxWidth: false,
      children: (
        <ProductDetail
          dataItem={
            // collection: product
            {
              item_number: [],
              barcode: null,
              brand_id: null,
              category_id: [],
              gallery: [],
              status: 1,
              is_frozen: false,
              is_ecology: false,
              is_coop_xtra: false,
              description: '',
              price: 0,
              weight: 0,
              unit: '',
              name: '',
              image: '',
              slug: '',
              total_bought: 0,
              store_id_list: cache.storeList.map(x => x._id),
              store_price_list: cache.storeList.reduce((acc, cur, i) => {
                if (acc.name) {
                  acc = { [acc._id]: 0 };
                }
                acc[cur._id] = 0;
                return acc;
              }),
              just_backend: false,
              tag_id_list: [],
            }
          }
          onSubmit={add}
          cancel={props.closeDialog}
          pagePermission={props.pagePermission}
        />
      ),
    });
  };
  const handleUpdate = dataItem => {
    if (!props.pagePermission.update) {
      return;
    }
    history.push({
      pathname: `/product`,
      search: `?id=${dataItem._id}`,
    }, {
      fromList: true
    });
  };

  const onDataStateChange = e => {
    changeUrlParamByDataState(props.history, moduleName, e.dataState);

    if (e.dataState.take !== dataState.take) {
      setPagingConfig(moduleName, e.dataState.take);
    }
  };

  const MultiSelectFilterCellTmp = useCallback(e => {
    const data = [
      {
        _id: 'is_coop_xtra',
        tag: <img src="/assets/images/xtra.png" style={{ height: 20 }} />,
        name: 'Xtra',
      },
      {
        _id: 'is_ecology',
        tag: <img src="/assets/icons/Ecology.svg" style={{ width: 20, height: 20 }} />,
        name: 'Økologi',
      },
      {
        _id: 'is_frozen',
        tag: <img src="/assets/icons/Freeze.svg" style={{ width: 20, height: 20 }} />,
        name: 'Frost',
      },
      {
        _id: 'is_offer',
        tag: <img src="/assets/images/offer.png" style={{ width: 20, height: 20 }} />,
        name: 'Tilbud',
      },
    ];
    const [value, setValue] = useState([]);
    if (dataState.filter) {
      dataState.filter.filters.forEach(x => {
        if (['is_coop_xtra', 'is_ecology', 'is_frozen', 'is_offer'].includes(x.field)) {
          if (!value.map(x => x._id).includes(x.field)) {
            value.push(data.find(y => x.field == y._id));
          }
        }
      });
    }
    return (
      <MultiSelectFilterCell
        // {...e}
        value={value}
        onClear={() => {
          if (dataState.filter) {
            let newDataState = { ...dataState };
            if (!newDataState.filter) {
              newDataState.filter = {
                filters: [],
                logic: 'and',
              };
            }
            newDataState.filter.filters = dataState.filter.filters.filter(x => {
              return !['is_coop_xtra', 'is_ecology', 'is_frozen', 'is_offer'].includes(x.field);
            });
            setDataState(newDataState);
          } else {
            setDataState({
              ...dataState,
              filter: undefined,
            });
          }
        }}
        onChange={e => {
          let fieldList = e.value.map(x => x._id);
          let newDataState = { ...dataState };
          if (newDataState.filter) {
            let newFilters = [];
            newDataState.filter.filters.forEach(x => {
              if (['is_coop_xtra', 'is_ecology', 'is_frozen', 'is_offer'].includes(x.field)) {
                if (fieldList.includes(x.field)) {
                  newFilters.push(x);
                  fieldList = fieldList.filter(x => x != x.field);
                }
              } else {
                newFilters.push(x);
              }
            });
            fieldList.forEach(x => {
              newFilters.push({
                field: x,
                value: true,
                operator: 'eq',
              });
            });
            newDataState.filter.filters = newFilters;
          } else {
            newDataState.filter = {
              filters: [],
              logic: 'and',
            };
            fieldList.forEach(x => {
              newDataState.filter.filters.push({
                field: x,
                value: true,
                operator: 'eq',
              });
            });
          }
          setDataState(newDataState);
        }}
        data={data}
      />
    );
  }, []);
  const BrandFilter = useCallback(propsFilter => <DropdownFilterCell id="brand-filter" {...propsFilter} data={cache.brandList} />, [cache.brandList]);
  const TagFilter = useCallback(propsFilter => <DropdownFilterCell id="tag-filter" {...propsFilter} data={cache.tagList} />, [cache.tagList]);
  const CategoryFilter = useCallback(propsFilter => <DropdownTreeFilterCell {...propsFilter} data={[...cache.categoryList]} />, [cache.categoryList]);
  const NameFilter = useCallback(propsFilter => <TextFilterCell {...propsFilter} placeholder={PLACEHOLDER_PRODUCT} />, []);
  if (props.query.id) {
    return <ProductDetail editId={props.query.id} query={props.query} productList={data} setProductList={setData} />;
  }
  return !data || !cache.categoryList || !cache.storeList ? (
    <LoadingPanel />
  ) : (
    <>
      {loadingPanel ? <LoadingPanel /> : null}
      <Grid
        style={{
          height: 'calc(100vh - 165px)',
        }}
        data={data}
        filterable
        {...dataState}
        pageable={PAGING_CONFIG}
        total={total}
        onDataStateChange={onDataStateChange}
        pager={CustomPaging}
        onRowDoubleClick={({ dataItem }) => handleUpdate(dataItem)}>
        <GridToolbar>
          <GridToolbarCustom
            dataState={dataState}
            onClearChange={onDataStateChange}
            insert={props.pagePermission.insert}
            handleAdd={handleAdd}
            rightComponent={
              <DropDownList
                textField="name"
                data={[
                  {
                    _id: 'just_backend',
                    name: 'Kun i backend',
                  },
                  {
                    _id: 'top_bought',
                    name: 'Mest købte',
                  },
                ]}
                onChange={e => {
                  let newDataState = { ...dataState };
                  if (!newDataState.filter) {
                    newDataState.filter = {
                      filters: [],
                    };
                  }

                  switch (e.target.value._id) {
                    case 'just_backend': {
                      if (newDataState.filter.filters.map(x => x.field).includes('just_backend')) {
                        newDataState.filter.filters = newDataState.filter.filters.filter(x => x.field != 'just_backend');
                      } else {
                        newDataState.filter.filters.push({
                          field: 'just_backend',
                          operator: 'eq',
                          value: true,
                        });
                      }
                      setDataState(newDataState);
                      setSort([
                        {
                          field: '_id',
                          dir: 'desc',
                        },
                      ]);
                      break;
                    }
                    case 'top_bought': {
                      if (sort && sort.map(x => x.field).includes('total_bought')) {
                        newDataState.filter.filters = newDataState.filter.filters.filter(x => x.field != 'just_backend');
                        setSort([
                          {
                            field: '_id',
                            dir: 'desc',
                          },
                        ]);
                      } else {
                        newDataState.filter.filters = newDataState.filter.filters.filter(x => x.field != 'just_backend');
                        setSort([
                          {
                            dir: 'desc',
                            field: 'total_bought',
                          },
                        ]);
                      }
                      setDataState(newDataState);
                      break;
                    }
                    default: {
                      newDataState.filter.filters = newDataState.filter.filters.filter(x => x.field != 'just_backend');
                      setSort([]);
                      setDataState(newDataState);
                      break;
                    }
                  }
                }}
                value={
                  dataState.filter && dataState.filter.filters.map(x => x.field).includes('just_backend')
                    ? {
                      _id: 'just_backend',
                      name: 'Bare Backend',
                    }
                    : sort.map(x => x.field).includes('total_bought')
                      ? {
                        _id: 'top_bought',
                        name: 'Top købt',
                      }
                      : {
                        _id: 'null',
                        name: '(Alle)',
                      }
                }
                defaultItem={{
                  _id: 'null',
                  name: '(Alle)',
                }}
              />
            }
          />
        </GridToolbar>
        <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
        <Column field="item_number" title="Varenr." width="85" filterable={false} cell={ItemNumberCell} />
        <Column
          field="image"
          title="Billede"
          width="80"
          filterable={false}
          cell={propsCell => {
            return (
              <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                <ImagePopOver src={propsCell.dataItem.image} ignoreCache={true} />
              </td>
            );
          }}
        />
        <Column
          field="name"
          title="Navn"
          cell={propsCell => {
            return (
              <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                <Link href={`${SHOP_URL}/product/${propsCell.dataItem._id}-${propsCell.dataItem.slug}`} target="_blank" rel="noopener">
                  {propsCell.dataItem.name}
                </Link>
                <div>
                  {propsCell.dataItem.unit}&nbsp;&nbsp;-&nbsp;&nbsp;{propsCell.dataItem.weight}g
                </div>
                <div></div>
              </td>
            );
          }}
          filterCell={NameFilter}
        />
        <Column
          field="price"
          title="Pris"
          width="80"
          filterable={false}
          cell={propsCell => <PriceCell number={propsCell.dataItem.price} displayCurrency={false} />}
        />
        <Column
          field="brand_id"
          title="Producent"
          width="120"
          cell={propsCell => {
            return <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>{propsCell.dataItem.brand?.name ?? ''}</td>;
          }}
          filterCell={BrandFilter}
        />
        <Column field="barcode" title="Stregkode" width="125" filterCell={TextFilterCell} />
        <Column
          field="tag_id_list"
          title="Tag"
          width="120"
          cell={propsCell => {
            return (
              <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                {propsCell.dataItem.tag_list
                  ? propsCell.dataItem.tag_list.map(tag => {
                    return <p key={tag._id}>{tag.name}</p>;
                  })
                  : null}
              </td>
            );
          }}
          // filterCell={propsFilter => (<FilterSearch {...propsFilter} type='tag' />)}
          filterCell={TagFilter}
        />
        <Column
          field="category_id"
          title="Kategori"
          width="200"
          cell={propsCell => {
            return (
              <td onDoubleClick={() => handleUpdate(propsCell.dataItem)}>
                {propsCell.dataItem.category.map(category => {
                  return <p key={category._id}>{category.name}</p>;
                })}
              </td>
            );
          }}
          filterCell={CategoryFilter}
        />
        <Column
          field="type"
          title="Type"
          width="150"
          filterable={true}
          cell={propsCell => {
            return (
              <td>
                <div className="flex justify-around">
                  {propsCell.dataItem.is_coop_xtra && <img src="/assets/images/xtra.png" />}
                  {propsCell.dataItem.is_frozen && <img src="/assets/icons/Freeze.svg" style={{ width: 20, height: 20 }} />}
                  {propsCell.dataItem.is_ecology && <img src="/assets/icons/Ecology.svg" style={{ width: 20, height: 20 }} />}
                  {propsCell.dataItem.status >= 2 && <img src="/assets/images/offer.png" style={{ width: 20, height: 20 }} />}
                </div>
              </td>
            );
          }}
          filterCell={MultiSelectFilterCellTmp}
        />
        <Column field="status" title="Status" width="130" cell={ProductActiveCell} filterCell={StatusFilterCell} />
      </Grid>
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      showErrorMessage,
      showLoadingMessage,
      openDialog,
      closeDialog,
    },
    dispatch,
  );
}
function mapStateToProps({ auth }) {
  return {
    pagePermission: getPagePermission('product', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductList));
