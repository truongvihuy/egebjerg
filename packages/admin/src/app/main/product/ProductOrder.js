import React, { useEffect, useState, useRef } from 'react';
import axios from 'app/axios';
import { Grid, GridColumn as Column, GridNoRecords } from '@progress/kendo-react-grid';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { showSuccessMessage, showErrorMessage, showLoadingMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { getPagePermission, MSG_NO_DATA, PRODUCT_ORDER_ROW_COLOR } from 'app/constants';
import { useGridScrollTop } from 'app/shared-components/KeyListener';
import { ProductActiveCell } from 'app/kendo/CustomCell';
import ProductFormOrder from './ProductFormOrder';
import ProductSearch from 'app/kendo/ProductSearch';
import DropdownTreeFilterCell from 'app/kendo/DropdownTreeFilterCell';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { ItemNumberCell } from 'app/kendo/CustomCell';
import { useSelector } from 'react-redux';
import { useKeyListener } from 'app/shared-components/KeyListener';
const ProductOrder = props => {
  const [productList1, setProductList1] = useState([]);
  const [productList2, setProductList2] = useState(null);
  const productList2BackUp = useRef();
  const inGrid = useRef(false);
  const idTimeout = useRef();
  const [filter, setFilter] = useState();
  const [sort, setSort] = useState([
    {
      field: 'order',
      value: 'asc',
    },
  ]);
  const newOrder = useRef();
  const [dragItem, setDragItem] = useState();
  const categoryList = useSelector(({ fuse }) => fuse.cache.categoryList);
  const [categoryId, setCategoryId] = useState();
  let total = useRef({
    1: 0,
    2: 0,
  });
  let skip = useRef({
    1: 0,
    2: 0,
  });
  const initData = () => {
    if (!categoryId) {
      return;
    }
    let params = { limit: 11 };
    if (filter) {
      filter.filters.forEach(x => {
        params[x.field] = x.value;
      });
    }
    if (sort.length > 0) {
      params.sort = `${sort[0].field}:${sort[0].dir == 'desc' ? -1 : 1}`;
    }
    if (categoryId) {
      params.category_id = categoryId;
    }
    axios.get(`/products`, { params }).then(response => {
      const newData = response.data.data.product_list;
      if (response.data.data.total) {
        skip.current = {
          1: 0,
          2: 0,
        };
        total.current = {
          1: response.data.data.total,
          2: response.data.data.total,
        };
      }
      setProductList1(newData);
      setProductList2(newData);
    });
  };
  useKeyListener(1, initData);
  useGridScrollTop([skip.current[1]], 'grid-1');
  useGridScrollTop([skip.current[2]], 'grid-2');
  useEffect(() => {
    initData();
  }, [filter, sort, categoryId]);

  const changePage = ({ page, type = 2 }) => {
    let params = {};
    if (filter) {
      filter.filters.forEach(x => {
        params[x.field] = x.value;
      });
    }
    if (sort.length > 0) {
      params.sort = `${sort[0].field}:${sort[0].dir == 'desc' ? -1 : 1}`;
    }
    if (categoryId) {
      params.category_id = categoryId;
    }
    params.page = 1 + page.skip / page.take;
    axios
      .get(`/products`, {
        params: {
          ...params,
          limit: 11,
        },
      })
      .then(response => {
        const newData = response.data.data;
        skip.current[type] = page.skip;
        if (type == 2) {
          setProductList2(newData.product_list);
        } else {
          setProductList1(newData.product_list);
        }
      })
      .catch(error => {
        console.log(error);
        props.showErrorMessage();
      });
  };

  const filterChange = e => {
    setFilter(e.filter);
  };
  const sortChange = e => {
    setSort(e.sort);
  };
  const handleDropItem = e => {
    e.preventDefault();
    if (!props.pagePermission.update) {
      return;
    }
    if (dragItem && inGrid.current) {
      //send request
      axios
        .put('/products/order', {
          _id: dragItem._id,
          order: newOrder.current,
        })
        .then(({ data }) => {
          let responseMap = {};
          data.data.forEach(x => {
            responseMap[x._id] = x.order;
          });
          setProductList1(
            productList1.map(x => {
              return {
                ...x,
                order: responseMap[x._id] ?? x.order,
              };
            }),
          );
          setProductList2(
            productList2.map(x => {
              return {
                ...x,
                order: responseMap[x._id] ?? x.order,
              };
            }),
          );

          setDragItem(null);
          props.showSuccessMessage();
        })
        .catch(e => {
          props.showErrorMessage();
          console.log(e);
        });
      inGrid.current = false;
    }
  };

  const RowRender = properties => {
    const { row, props, onDrop, onDragStart, onDragEnd, style } = { ...properties };
    const dataItem = row.props.children[0].props.dataItem;
    const additionalProps = {
      onDragStart:
        onDragStart ??
        (e => {
          e.preventDefault();
        }),
      onDragEnd:
        onDragEnd ??
        (e => {
          e.preventDefault();
        }),
      onDragOver: e => {
        e.preventDefault();
        if (dragItem) {
          if (dragItem._id == dataItem._id) {
            return;
          }
          if (idTimeout.current) {
            clearTimeout(idTimeout.current);
          }
          let reorderedData = [...productList2];
          let prevIndex = reorderedData.findIndex(p => p._id === dragItem._id);
          let nextIndex = reorderedData.findIndex(p => p._id === dataItem._id);
          if (prevIndex < nextIndex) {
            newOrder.current = dataItem.order + 1;
          } else {
            newOrder.current = dataItem.order - 1;
          }
          reorderedData.splice(prevIndex, 1);
          reorderedData.splice(nextIndex, 0, { ...dragItem, order: newOrder.current, color: PRODUCT_ORDER_ROW_COLOR.update });
          inGrid.current = true;
          idTimeout.current = setTimeout(() => {
            setProductList2(reorderedData);
            idTimeout.current = null;
          }, 20);
        }
      },
      onDrop:
        onDragEnd ??
        (e => {
          e.preventDefault();
        }),
      onDragLeave: e => {
        e.preventDefault();
        setProductList2(productList2BackUp.current);
        inGrid.current = false;
      },
      draggable: true,
    };
    return (
      <>
        {React.cloneElement(
          row,
          {
            ...row.props,
            ...additionalProps,
            onDoubleClick: e => {
              handleUpdate({ dataItem });
            },
            style: style
          },
          row.props.children,
        )}
      </>
    );
  };
  //grid 1
  const GridRowRenderDrag = (tr, props) => {
    const trProps = {
      draggable: true,
      onDragStart: e => {
        let element = document.createElement('div');
        e.dataTransfer.setDragImage(element, 0, 0);
        productList2BackUp.current = productList2;
        setDragItem(props.dataItem);
      },
      onDragEnd: handleDropItem
    };
    if (props.dataItem.color) {
      trProps.style = {
        backgroundColor: props.dataItem.color
      }
    }
    return React.cloneElement(tr, { ...trProps }, tr.props.children);
  };
  //grid 2
  const GridRowRenderDrop = (row, props) => {
    let trProps = {
      draggable: true,
      onDragStart: e => {
        let element = document.createElement('div');
        e.dataTransfer.setDragImage(element, 0, 0);
        productList2BackUp.current = productList2;
        setDragItem(props.dataItem);
      },
      onDragEnd: handleDropItem,
    };
    if (props.dataItem.color) {
      trProps.style = {
        backgroundColor: props.dataItem.color
      }
    }
    // return React.cloneElement(tr, { ...trProps }, tr.props.children);
    return <RowRender props={props} row={row} onDrop={handleDropItem} {...trProps} />;
  };

  const handleSearch = async (dataItem, nameSearch) => {
    if (!['search1', 'search2'].includes(nameSearch)) {
      return;
    }
    let params = {
      name: dataItem.name,
      limit: 11,
    };
    if (categoryId) {
      params.category_id = categoryId;
    } else {
      params.category_id = dataItem.category_id[0];
    }
    axios
      .get('/products/order', { params })
      .then(response => {
        const newData = response.data.data;
        if (nameSearch == 'search2') {
          total.current[2] = 0;
          setProductList2(
            newData.product_list.map(x => {
              if (x._id == dataItem._id) {
                return { ...x, color: PRODUCT_ORDER_ROW_COLOR.search };
              }
              return x;
            }),
          );
        } else {
          setProductList1(
            newData.product_list.map(x => {
              if (x._id == dataItem._id) {
                return { ...x, color: PRODUCT_ORDER_ROW_COLOR.search };
              }
              return x;
            }),
          );
        }
      })
      .catch(error => {
        console.log(error);
        props.showErrorMessage();
      });
  };
  const handleUpdate = ({ dataItem }) => {
    if (!props.pagePermission.update) {
      return;
    }
    const update = dataItem =>
      axios
        .put('/products/order', {
          _id: dataItem._id,
          order: dataItem.order,
        })
        .then(response => {
          setProductList1(
            productList1.map(x => {
              if (x._id == dataItem._id) {
                return dataItem;
              }
              return x;
            }),
          );
          setProductList2(
            productList2.map(x => {
              if (x._id == dataItem._id) {
                return dataItem;
              }
              return x;
            }),
          );
          props.showSuccessMessage();
          props.closeDialog();
        })
        .catch(e => {
          props.showErrorMessage();
          console.log(e);
        });
    props.openDialog({
      children: <ProductFormOrder dataItem={dataItem} onSubmit={update} closeDialog={props.closeDialog} openDialog={props.openDialog} />,
    });
  };
  const CategorySelector = React.useCallback(
    props => (
      <div className="flex" style={{ width: '400px' }}>
        <div style={{ margin: '5px 20px 0 0', width: '50px' }}>Katalog</div>
        <DropdownTreeFilterCell data={props.data} onChange={props.onChange} value={props.value} />
      </div>
    ),
    [],
  );

  if (productList2 == null) {
    return (
      <CategorySelector
        value={categoryId}
        data={[...categoryList]}
        onChange={e => {
          setCategoryId(e.value);
        }}
      />
    );
  } else {
    return (
      <div>
        <CategorySelector
          value={categoryId}
          data={[...categoryList]}
          onChange={e => {
            setCategoryId(e.value);
          }}
        />
        <div className="flex justify-around">
          <div className="mr-10">
            <div className="flex my-20">
              <ProductSearch
                fullWidth={true}
                onChange={dataItem => {
                  handleSearch(dataItem, 'search1');
                }}
                params={{ category_id: categoryId }}
              />
            </div>
            <Grid
              className="grid-1"
              style={{
                height: 'calc(100vh - 250px)',
              }}
              rowRender={GridRowRenderDrag}
              data={productList1}
              onRowDoubleClick={handleUpdate}
              pageable={true}
              total={total.current[1]}
              skip={skip.current[1]}
              take={11}
              onPageChange={e => {
                changePage({ page: e.page, type: 1 });
              }}>
              <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
              <Column field="item_number" title="Varenr." width="85" filterable={false} cell={ItemNumberCell} />
              <Column
                field="image"
                title="Billede"
                width="80"
                filterable={false}
                cell={propsCell => {
                  return (
                    <td>
                      <ImagePopOver src={propsCell.dataItem.image} />
                    </td>
                  );
                }}
              />
              <Column field="name" title="Info" filterable={false} />
              <Column field="status" title="Status" width="100" cell={ProductActiveCell} />
              <Column field="order" title="Sortere" width="80" filterable={false} />
            </Grid>
          </div>
          <div className="ml-10">
            <div className="flex my-20">
              <ProductSearch
                fullWidth={true}
                onChange={dataItem => {
                  handleSearch(dataItem, 'search2');
                }}
                params={{ category_id: categoryId }}
              />
            </div>
            <Grid
              className="grid-2"
              style={{
                height: 'calc(100vh - 250px)',
              }}
              data={productList2}
              filterable={false}
              filter={filter}
              onFilterChange={filterChange}
              sortable
              sort={sort}
              onSortChange={sortChange}
              pageable={total.current[2] > 11}
              total={total.current[2]}
              skip={skip.current[2]}
              take={11}
              onPageChange={changePage}
              rowRender={GridRowRenderDrop}>
              <GridNoRecords>{MSG_NO_DATA}</GridNoRecords>
              <Column field="item_number" title="Varenr." width="85" filterable={false} cell={ItemNumberCell} />
              <Column
                field="image"
                title="Billede"
                width="80"
                filterable={false}
                cell={propsCell => {
                  return (
                    <td>
                      <ImagePopOver src={propsCell.dataItem.image} />
                    </td>
                  );
                }}
              />
              <Column
                field="name"
                title="Info"
                filterable={false}
              />
              <Column field="status" title="Status" width="100" cell={ProductActiveCell} />
              <Column field="order" title="Sortere" width="80" filterable={false} />
            </Grid>
          </div>
        </div>
      </div>
    );
  }
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
export default connect(mapStateToProps, mapDispatchToProps)(ProductOrder);
