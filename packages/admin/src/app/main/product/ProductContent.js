import { lazy, useEffect, useState } from 'react';
import ProductList from './ProductList';
import ProductOrder from './ProductOrder';
import ProductImport from './ProductImport';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import axios from 'app/axios';
import { parseUrlParams } from 'app/helper/general.helper';
import { withRouter } from 'react-router-dom';
import LoadingPanel from 'app/kendo/LoadingPanel';
import { useSelector } from 'react-redux';

const ProductContent = props => {
  const cache = useSelector(({ fuse }) => fuse.cache);
  const query = parseUrlParams(props.location.search);
  const [selected, setSelected] = useState(query.id ? 0 : (query.tab ? +query.tab : 0));
  const onSelectTab = ({ selected }) => {
    props.history.push(`${props.location.pathname}?tab=${selected}`)
    setSelected(selected);
  };
  if (cache.categoryList && cache.storeList && cache.brandList && cache.tagList) {
    return (<TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={onSelectTab}>
      <TabStripTab title='Liste'>
        <ProductList onSelectTab={onSelectTab} query={query} />
      </TabStripTab>
      <TabStripTab title='Omarranger'>
        <ProductOrder onSelectTab={onSelectTab} />
      </TabStripTab>
      <TabStripTab title='Importere'>
        <ProductImport onSelectTab={onSelectTab} />
      </TabStripTab>
    </TabStrip>)
  }
  return <LoadingPanel />
}

export default withRouter(ProductContent);