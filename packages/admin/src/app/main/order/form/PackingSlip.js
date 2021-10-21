import { useEffect, useState } from 'react';
import axios from 'app/axios';
import LoadingPanel from 'app/kendo/LoadingPanel';

const PackingSlip = ({ dataItem, style }) => {
  const [loading, setLoading] = useState(true);
  const [dataSrc, setDataSrc] = useState(null)

  useEffect(() => {
    axios.get(`/orders/${dataItem._id}/packing-slip`)
      .then((response) => {
        // const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const url = response.data;
        setDataSrc(url);
        setLoading(false);
      }).catch(e => {
        setLoading(false);
      });
  }, []);

  return loading ? <LoadingPanel width={'100%'} /> : <iframe src={dataSrc} type="application/pdf" style={style} />
}

export default PackingSlip;