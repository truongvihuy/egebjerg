import SuggestSearch from 'app/kendo/SuggestSearch';
import { PLACEHOLDER_PRODUCT } from 'app/constants';
import ImagePopOver from 'app/shared-components/ImagePopOver';

import axios from 'app/axios';
const ProductSearch = props => {
  const handleSearchSuggest = (event, setOptions) => {
    const params = {
      name: event.target.value,
      ...props.params
    };
    axios
      .get(`/products`, { params })
      .then(response => {
        setOptions(response.data.data.product_list);
      })
      .catch(error => {
        setOptions([]);
      });
  };
  return <SuggestSearch
    fullWidth={props.fullWidth}
    placeholder={PLACEHOLDER_PRODUCT}
    onSearch={handleSearchSuggest}
    renderOption={e => {
      return (
        <div style={{ width: '100%', display: 'flex' }}>
          <ImagePopOver src={e.image} size={30} />
          <div style={{ marginLeft: '50px' }}>{e.name}</div>
          <div style={{ marginLeft: 'auto', marginRight: '0px' }}>{e.price} DKK</div>
        </div>
      );
    }}
    getOptionLabel={e => e.name ?? ''}
    onChange={props.onChange}
  />
}
export default ProductSearch;