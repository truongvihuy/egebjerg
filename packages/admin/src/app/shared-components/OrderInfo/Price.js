
import { formatCurrency, formatWeight } from 'app/helper/general.helper';

export const Price = ({ dataItem, customer }) => {
  return (
    <div className='cost-calculation'>
      <div>Sub Total <div>{formatCurrency(dataItem.subtotal)}</div></div>
      <div>Rabat <div>{formatCurrency(-dataItem.discount)}</div></div>
      <div className='grand-total'>I alt <div>{formatCurrency(dataItem.amount)}</div></div>
      <div>Totalvægt <div>{formatWeight(dataItem.total_weight)}</div></div>
    </div>
  );
};