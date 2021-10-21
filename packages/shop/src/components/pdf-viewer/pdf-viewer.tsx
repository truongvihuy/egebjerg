import React from 'react';

import {
  Document, Page,
} from 'react-pdf/dist/esm/entry.webpack';

const PdfViewer = ({
  url, pageNumber, loading, onLoadSuccess, width
}) => (
  <Document file={url} loading={loading} onLoadSuccess={onLoadSuccess}>
    <Page
      pageNumber={pageNumber} width={width}
    />
  </Document>
);

export default PdfViewer;