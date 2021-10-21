import { useState } from 'react';
import CustomerList from './CustomerList';
import CustomerMerge from './CustomerMerge';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { parseUrlParams } from 'app/helper/general.helper';
import { withRouter } from 'react-router-dom';

const ProductContent = props => {
  const query = parseUrlParams(props.location.search);
  const [selected, setSelected] = useState(query.id ? 0 : (query.tab ? +query.tab : 0));
  const onSelectTab = ({ selected }) => {
    props.history.push(`${props.location.pathname}?tab=${selected}`)
    setSelected(selected);
  };
  return (<TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={onSelectTab}>
    <TabStripTab title='Liste'>
      <CustomerList query={query} />
    </TabStripTab>
    <TabStripTab title='Flette'>
      <CustomerMerge />
    </TabStripTab>
  </TabStrip>)
}

export default withRouter(ProductContent);