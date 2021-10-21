import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { motion } from 'framer-motion';
import { ORDER_STATUS, ORDER_STATUS_CONFIG } from 'app/constants';
import history from '@history';

const CARD_TO_PBS_OPTION = {
  name: 'Betalingsproblem', // Payment Issue
  color: '#c31414',
};

function OrderStatusCard(props) {
  const goToOrderList = status => {
    history.push({
      pathname: `/order`,
      search: `?status=${status}`,
    });
  };

  return (
    <>
      <motion.div className="widget flex w-full sm:w-1/3 p-16">
        <Card className="w-full rounded-20 shadow cursor-pointer" onClick={() => goToOrderList(ORDER_STATUS.received)}>
          <div className="p-20" style={{ color: ORDER_STATUS_CONFIG[ORDER_STATUS.received].color }}>
            <Typography className="font-medium">{ORDER_STATUS_CONFIG[ORDER_STATUS.received].name}</Typography>

            <div className="flex flex-row flex-wrap items-center mt-12">
              <Typography className="text-48 font-semibold leading-none tracking-tighter">{props.data.received ?? 0}</Typography>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div className="widget flex w-full sm:w-1/3 p-16">
        <Card className="w-full rounded-20 shadow cursor-pointer" onClick={() => goToOrderList(ORDER_STATUS.received)}>
          <div className="p-20" style={{ color: CARD_TO_PBS_OPTION.color }}>
            <Typography className="font-medium">{CARD_TO_PBS_OPTION.name}</Typography>

            <div className="flex flex-row flex-wrap items-center mt-12">
              <Typography className="text-48 font-semibold leading-none tracking-tighter">{props.data.cardToPbsIssue ?? 0}</Typography>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div className="widget flex w-full sm:w-1/3 p-16">
        <Card className="w-full rounded-20 shadow cursor-pointer" onClick={() => goToOrderList(ORDER_STATUS.packedPaymentIssue)}>
          <div className="p-20" style={{ color: ORDER_STATUS_CONFIG[ORDER_STATUS.packedPaymentIssue].color }}>
            <Typography className="font-medium">{ORDER_STATUS_CONFIG[ORDER_STATUS.packedPaymentIssue].name}</Typography>

            <div className="flex flex-row flex-wrap items-center mt-12">
              <Typography className="text-48 font-semibold leading-none tracking-tighter">
                {props.data.packedPaymentIssue ?? 0}
              </Typography>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
}

export default OrderStatusCard;
