import { NextPage } from 'next';
import { Modal } from '@redq/reuse-modal';

import {
  PageWrapper,
  SidebarSection,
  ContentBox,
} from 'features/user-profile/user-profile.style';
import Sidebar from 'features/user-profile/sidebar/sidebar';
import { SEO } from 'components/seo';
import Footer from 'layouts/footer';
import { CustomerContext } from 'contexts/customer/customer.context';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SettingsContent from 'features/user-profile/settings/settings';
import dynamic from 'next/dynamic';

const CartPopUp = dynamic(import('features/carts/cart-popup'), { ssr: false });

type Props = {
  deviceType?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};

const ProfilePage: NextPage<Props> = ({ deviceType }) => {
  const { customerState } = useContext<any>(CustomerContext);
  const [isNormalAuthenticated, setIsNormalAuthenticated] = useState(false);

  useEffect(() => {
    setIsNormalAuthenticated(customerState.isNormalAuthenticated);
  }, [customerState.isNormalAuthenticated]);

  if (isNormalAuthenticated) {
    return (
      <Modal>
        <SEO title="Profile" description="Profile Details" />
        <PageWrapper>
          <SidebarSection>
            <Sidebar />
          </SidebarSection>
          <ContentBox>
            <SettingsContent deviceType={deviceType} />
          </ContentBox>
          <Footer />
        </PageWrapper>
        <CartPopUp deviceType={deviceType} />
      </Modal>
    );
  }

  return <Modal />;
};

export default ProfilePage;
