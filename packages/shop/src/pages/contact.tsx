import React from 'react';
import styled from 'styled-components';
import { Modal } from '@redq/reuse-modal';
import { SEO } from 'components/seo';
import Footer from 'layouts/footer';
import { StyledFormWrapper, StyledContainer, StyledFormTitleWrapper, StyledFormTitle, StyledFormLargeText } from '../assets/styles/pages.style';

import ContactImgSrc from '../assets/images/contact.png';

export default function ContactPage() {
    return (
        <Modal>
            <SEO title="Kontakt" description="Contact Details" />
            <StyledFormWrapper>
                <StyledContainer>
                    <StyledFormTitleWrapper>
                        <StyledFormTitle>Kontaktoplysninger Egebjerg Købmandsgård</StyledFormTitle>
                        <br /><img src={ContactImgSrc}/>
                    </StyledFormTitleWrapper>
                    <StyledFormLargeText>Email: <a href="mailto:info@egebjergkobmandsgaard.dk">info@egebjergkobmandsgaard.dk</a></StyledFormLargeText>
                    <StyledFormLargeText>Telefon: <a href="tel:70258888">70258888</a></StyledFormLargeText>
                    <StyledFormLargeText>Telefontider: Mandag - Fredag kl. 08:00 - 16:00 Lørdag - Søndag lukket</StyledFormLargeText>
                    
                </StyledContainer>
            </StyledFormWrapper>
            <Footer />
        </Modal>
    );
}
