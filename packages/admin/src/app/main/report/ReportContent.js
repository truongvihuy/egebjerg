import { withRouter } from 'react-router-dom';
import { TabStrip, TabStripTab } from '@progress/kendo-react-layout';
import { useState } from 'react';
import ReportGrid from './tab/ReportGrid';
import { parseUrlParams } from 'app/helper/general.helper';
import OrderBakeryGrid from './tab/OrderBakeryGrid';

const ReportContent = props => {
  const query = parseUrlParams(props.location.search);
  const [selected, setSelected] = useState(query.tab ? +query.tab : 0);

  const handleChangeSelected = ({ selected }) => {
    props.history.push({
      pathname: props.location.pathname,
      search: `?tab=${selected}`
    });
    setSelected(selected);
  }

  return (
    <TabStrip tabContentStyle={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }} selected={selected} onSelect={handleChangeSelected}>
      <TabStripTab title='Overvægt'>
        <ReportGrid />
      </TabStripTab>
      <TabStripTab title='Bageriprodukter'>
        <OrderBakeryGrid />
      </TabStripTab>
    </TabStrip>
  );
}
export default withRouter(ReportContent);
