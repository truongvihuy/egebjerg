import { useState, useEffect, useRef } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { DialogContent, DialogTitle, IconButton, Icon } from '@material-ui/core';
import ProductSearch from 'app/kendo/ProductSearch';
import { ProductActiveCell, PriceCell, ItemNumberCell } from 'app/kendo/CustomCell';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import axios from 'app/axios';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { NUMBER_ROW_PER_PAGE } from 'app/constants';

const AddProductTagForm = props => {
  const ProductListComponent = propsCell => {
    const totalProduct = useRef(0);
    const [productList, setProductList] = useState(null);
    const [dataState, setDataState] = useState({
      skip: 0,
      take: NUMBER_ROW_PER_PAGE,
    });
    useEffect(() => {
      const params = {
        tag_id_list: props.dataItem.tag_id,
        limit: dataState.take,
        page: 1 + dataState.skip / dataState.take,
      };
      axios.get('/products', { params }).then(response => {
        if (response.data.data.total) {
          totalProduct.current = response.data.data.total;
        }
        setProductList(response.data.data.product_list);
      });
    }, [dataState]);
    const handleAdd = dataItem => {
      props.onSubmit({
        tag_id: props.tag._id,
        type: 'delete',
        product_id: dataItem._id,
      });
      const newProductList = [dataItem, ...productList];
      setProductList(newProductList);
    };

    const handleRemove = productId => {
      props.onSubmit({
        tag_id: props.tag._id,
        type: 'delete',
        product_id: productId,
      });
      const newProductList = productList.filter(x => x._id !== productId);
      setProductList(newProductList);
    };
    if (productList === null) {
      return <LoadingPanel />;
    }
    const onDataStateChange = e => {
      setDataState(e.dataState);
    };
    return (
      <div className="mt-10">
        <div className="flex justify-around">
          <div style={{ width: '100%' }}>
            <ProductSearch fullWidth onChange={handleAdd} />
          </div>
        </div>
        <Grid
          style={{ height: '700px' }}
          {...dataState}
          onDataStateChange={onDataStateChange}
          pageable
          total={totalProduct.current}
          data={productList}>
          <Column field="item_number" title="Varenr." cell={ItemNumberCell} />
          <Column
            field="image"
            title="Billede"
            cell={({ dataItem }) => (
              <td>
                <ImagePopOver src={dataItem.image} />
              </td>
            )}
          />
          <Column field="name" title="Navn" width="200" />
          <Column field="price" title="Pris" cell={({ dataItem }) => <PriceCell number={dataItem.price} />} />
          <Column field="active" title="Aktiv" cell={ProductActiveCell} />
          <Column
            cell={({ dataItem }) => {
              return (
                <td>
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      handleRemove(dataItem._id);
                    }}>
                    <Icon>clear</Icon>
                  </IconButton>
                </td>
              );
            }}
          />
        </Grid>
      </div>
    );
  };
  return (
    <div style={{ width: '700px' }}>
      <DialogTitle className="text-center">
        <p>Opdater tilføj mærke til produkt</p>
        <p>Tag Navn: {props.tag.name}</p>
      </DialogTitle>
      <DialogContent>
        <ProductListComponent />
      </DialogContent>
    </div>
  );
};

export default AddProductTagForm;
