import styled from 'styled-components';

export const StyledBreadcrumb = styled.div`
  width: 100%;
  display: inline-flex;
  padding: 40px 40px 0px 40px;
`;

export const StyledBreadcrumbItem = styled.div`
  cursor: pointer;

  :not(:first-child) {
    margin-left: 20px;
  }

  :not(:last-child):after {
    content: "/";
    margin-left: 20px;
  }
`;

