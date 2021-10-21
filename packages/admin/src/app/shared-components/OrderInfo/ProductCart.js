import { CartItem } from "./CartItem";


export const ProductCart = ({ productList, cartItemList, onChange, disabled }) => {
  let index = 0;
  return (
    <div>
      <div className='cart-table-header'>
        <table>
          <colgroup>
            <col />
            <col width={100} />
            <col width={300} />
            <col width={100} />
            {!disabled && <col width={80} />}
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Varer</th>
              <th style={{ textAlign: 'center' }}>Antal</th>
              <th style={{ textAlign: 'center' }}>Bemærkning</th>
              <th style={{ textAlign: 'left' }}>Total</th>
              {!disabled && <th style={{ textAlign: 'left' }}></th>}
            </tr>
          </thead>
        </table>
      </div>
      <div className='cart-table'>
        <table>
          <colgroup>
            <col />
            <col width={100} />
            <col width={300} />
            <col width={100} />
            {!disabled && <col width={80} />}
          </colgroup>
          <tbody>
            {productList && productList.map((dataItem) => {
              if (!dataItem.associated_item_id) {
                index++;
              }
              return (
                <CartItem key={`${dataItem._id}-${index}`} showOffer className={`${index % 2 ? 'k-alt' : ''} ${dataItem.offer ? 'have-offer' : ''}`}
                  dataItem={dataItem} disabled={disabled}
                  cartItemList={cartItemList}
                  onChange={onChange} />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};