import React from 'react';
import { Modal } from '@redq/reuse-modal';
import { SEO } from 'components/seo';
import Footer from 'layouts/footer';
import Accordion from 'components/accordion/accordion';
import { StyledPageWrapper, StyledPageContainer, StyledHeading } from '../assets/styles/pages.style';

const accordionData = [
  {
    id: 1,
    intlTitleId: 'faqNo1Title',
    intlDetailsId: 'faqNo1Desc',
    values: { number1: 7, number2: 2 },
  },
  {
    id: 2,
    intlTitleId: 'faqNo2Title',
    intlDetailsId: 'faqNo2Desc',
  },
  {
    id: 3,
    intlTitleId: 'faqNo3Title',
    intlDetailsId: 'faqNo3Desc',
  },
  {
    id: 4,
    intlTitleId: 'faqNo4Title',
    intlDetailsId: 'faqNo4Desc',
  },
];

export default function Help() {
  return (
    <Modal>
      <SEO title="F.A.Q" description="F.A.Q Details" />
      <StyledPageWrapper>
        <StyledPageContainer>
          <StyledHeading>F.A.Q</StyledHeading>
          <Accordion items={accordionData} />
        </StyledPageContainer>

        <Footer />
      </StyledPageWrapper>
    </Modal>
  );
}
