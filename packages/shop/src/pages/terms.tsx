import React from 'react';
import { Modal } from '@redq/reuse-modal';
import { NextPage } from 'next';
import Sticky from 'react-stickynode';
import {
  StyledContainer,
  StyledHeadding,
  StyledContent,
  StyledLink,
  StyledLeftContent,
  StyledLeftInnerContent,
  StyledRightContent,
  StyledContentHeading,
} from 'features/terms-and-services/terms-and-services';
import { Heading } from 'components/heading/heading';
import { Element } from 'react-scroll';
import { SEO } from 'components/seo';
import { siteTermsAndServices } from 'config/site-terms-and-services';
import Footer from 'layouts/footer';
import { Button } from 'components/button/button';
import styled from 'styled-components';

const StyledHelperWrapper = styled.div`
  position: sticky;
  bottom: 30px;
  float: right;
  margin: 10px;
`;

const TermsPage = ({ deviceType }) => {
  const { title, date, content } = siteTermsAndServices;
  const { mobile } = deviceType;

  const scrollTop = () => {
    window.scrollTo(0, 0);
  }

  return (
    <Modal>
      <SEO title={title} description="Egebjerg Købmandsgård privacy page" />

      <StyledContainer>
        <StyledHeadding><Heading title={title} /></StyledHeadding>
        {/* <Heading title={title} subtitle={`Last update: ${date}`} style={{backgroundColor: '#ffffff', padding: '50px 10px'}}/> */}

        <StyledContent>
          <StyledLeftContent>
            <Sticky top={150} innerZ="1" enabled={mobile ? false : true}>
              <StyledLeftInnerContent>
                {content.map((item, index) => (
                  <StyledLink
                    key={index}
                    activeClass="active"
                    to={item.title}
                    spy={true}
                    smooth={true}
                    offset={-276}
                    duration={500}
                  >
                    {item.title}
                  </StyledLink>
                ))}
              </StyledLeftInnerContent>
            </Sticky>
          </StyledLeftContent>
          <StyledRightContent>
            {content.map((item, idx) => {
              return (
                <Element
                  name={item.title}
                  style={{ paddingBottom: 20 }}
                  key={idx}
                >
                  <StyledContentHeading>{item.title}</StyledContentHeading>
                  <div
                    className="html-content"
                    dangerouslySetInnerHTML={{
                      __html: item.description,
                    }}
                  />
                </Element>
              );
            })}
          </StyledRightContent>
        </StyledContent>

        <Footer />

        {mobile && (
          <StyledHelperWrapper>
            <Button onClick={scrollTop}>
              Top
            </Button>
          </StyledHelperWrapper>
        )}
      </StyledContainer>
    </Modal>
  );
};

export default TermsPage;
