import { IconButton, Icon, Badge, Typography } from '@material-ui/core';
import axios from 'app/axios';
import LoadingPanel from 'app/kendo/LoadingPanel';
import NotificationList from 'app/shared-components/NotificationList';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import OrderStatusCard from './widgets/OrderStatusCard';
import { useKeyListener } from 'app/shared-components/KeyListener';

const DashboardContent = ({ showSuccessMessage }) => {
  const [dashboard, setDashbroad] = useState(null);

  const getDashbroad = () => {
    axios.get('/dashboard').then(response => {
      setDashbroad(response.data.data);
    });
  };

  useEffect(() => {
    getDashbroad();
  }, []);

  useKeyListener(null, getDashbroad);

  return !dashboard ? (
    <LoadingPanel />
  ) : (
    <motion.div
      className="flex flex-col md:flex-row sm:p-8 container overflow-auto"
      // variants={container}
      initial="hidden"
      animate="show">
      <div className="flex flex-col flex-1 min-w-0 pt-16">
        <div className="flex flex-col sm:flex sm:flex-row pb-32">
          <OrderStatusCard data={dashboard.statusOrder} />
        </div>

        <div className="flex flex-row sm:flex sm:flex-row gap-x-20">
          {dashboard.notification.admin && (
            <div className="flex flex-col flex-grow">
              <Typography component={motion.div} className="px-10 pb-8 text-14" color="textSecondary">
                Butiksadministrator
                <Badge badgeContent={dashboard.notification.admin.length} color="error">
                  <Icon fontSize="medium">notifications_none</Icon>
                </Badge>
              </Typography>
              <NotificationList type="dialog" data={dashboard.notification.admin} disabled/>
            </div>
          )}
          {dashboard.notification.store && (
            <div className="flex flex-col flex-grow">
              <Typography component={motion.div} className="px-10 pb-8 text-14" color="textSecondary">
                Butiks admin visitation
                <Badge badgeContent={dashboard.notification.store.length} color="error">
                  <Icon fontSize="medium">notifications_none</Icon>
                </Badge>
              </Typography>
              <NotificationList type="dialog" data={dashboard.notification.store} disabled/>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardContent;