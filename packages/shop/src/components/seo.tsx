import React from 'react';
import Head from 'next/head';
import { siteMetadata } from 'config/site-metadata';

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  css?: string;
  js?: string;
  image?: string;
};

export const SEO: React.FC<SeoProps> = ({
  title,
  description,
  canonical,
  css,
  js,
  image,
}) => {
  title = title ? `${title} - ${siteMetadata.titleSuffix}` : siteMetadata.titleSuffix;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="viewport"
        content="width=device-width,maximum-scale=1,initial-scale=1"
      />
      <meta property="og:type" content="website" />
      <meta name="og:title" property="og:title" content={title} />
      <meta
        name="og:description"
        property="og:description"
        content={description}
      />
      <meta property="og:site_name" content="Proper Noun" />
      <meta property="og:url" content={`${canonical}`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@propernounco" />
      <meta name="twitter:creator" content="@propernounco" />
      {css && <link rel="stylesheet" href={`${css}`} />}
      {image ? (
        <meta property="og:image" content={`${image}`} />
      ) : (
        null
      )}
      {image && <meta name="twitter:image" content={`${image}`} />}
      {canonical && <link rel="canonical" href={`${canonical}`} />}
      {js && <script type="text/javascript" src={`${js}`}></script>}
    </Head>
  )
};
