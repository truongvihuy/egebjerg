import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { getPagePermission } from 'app/constants';
import { withRouter } from 'react-router';
import axios from 'app/axios';
import { addDays, addMonths, endOfDay, startOfDay } from 'date-fns';
import LoadingPanel from 'app/kendo/LoadingPanel';
import OverweightRow from './OverweightRow';
import { Button } from '@material-ui/core';
import { useKeyListener } from 'app/shared-components/KeyListener';


function ReportGrid(props) {
  const [date, setDate] = useState({
    start: addDays(addMonths(new Date(), -1), 1),
    end: new Date(),
  });
  const [reportList, setReportList] = useState(null);

  const initData = () => {
    getReport();
  };
  useKeyListener(null, initData);
  useEffect(() => {
    getReport();
  }, []);

  const handleChangeRangePicker = (e, type) => {
    setDate({
      ...date,
      [type]: e.value,
    });
  }

  const getReport = () => {
    if (date.start && date.end) {
      let params = {
        from_date: startOfDay(date.start) / 1000 | 0,
        to_date: endOfDay(date.end) / 1000 | 0,
      }
      axios.get(`/reports/overweight`, { params })
        .then(response => {
          console.log(response.data.data)
          setReportList(response.data.data);
        }).catch(e => { });
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 165px)', }}>
      <div className='flex'>
        <div>
          <div>Fra dato</div>
          <DatePicker value={date.start} //className='mt-10'
            onChange={(e) => handleChangeRangePicker(e, 'start')} />
        </div>
        <div>
          <div>Til dato</div>
          <DatePicker value={date.end} //className='mt-10'
            onChange={(e) => handleChangeRangePicker(e, 'end')} />
        </div>
        <Button onClick={getReport} color="primary" size='small'>Report</Button>
      </div>
      {!reportList ? <LoadingPanel /> : (
        <div style={{ height: 'calc(100vh - 195px)', overflow: 'auto', marginTop: 8 }}>
          {reportList.map((e, index) => <OverweightRow key={index} report={e} />)}
        </div>
      )}
    </div>

  )
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(
//     {
//       closeDialog,
//       openDialog,
//     },
//     dispatch,
//   );
// }
function mapStateToProps({ auth }) {
  return {
    user: auth.user,
    pagePermission: getPagePermission('report', auth.user),
  };
}
export default withRouter(connect(mapStateToProps, null)(ReportGrid));
