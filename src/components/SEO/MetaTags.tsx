import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  quote?: {
    content: string;
    author: string;
  };
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'Pekikkan - Inspire the world through words',
  description = 'Inspire the world through words. Discover, share, and save powerful quotes that motivate and transform lives. Join our community of word enthusiasts spreading inspiration globally.',
  keywords = ['inspire through words', 'inspirational quotes', 'motivational words', 'powerful quotes', 'life-changing quotes', 'daily inspiration', 'word wisdom'],
  image = '/og-image.jpg',
  url = 'https://pekikkan.com',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  quote,
}) => {
  const fullTitle = title.includes('Pekikkan') ? title : `${title} | Pekikkan`;
  const keywordsString = keywords.join(', ');
  
  // Generate structured data for quotes
  const generateQuoteStructuredData = () => {
    if (!quote) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Quotation',
      'text': quote.content,
      'author': {
        '@type': 'Person',
        'name': quote.author
      },
      'url': url,
      'datePublished': publishedTime,
      'dateModified': modifiedTime,
      'publisher': {
        '@type': 'Organization',
        'name': 'Pekikkan',
        'url': 'https://pekikkan.com',
        'slogan': 'Inspire the world through words'
      }
    };
  };

  // Generate website structured data
  const generateWebsiteStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Pekikkan',
    'description': 'Inspire the world through words - Inspirational Quotes & Word Wisdom Community',
    'url': 'https://pekikkan.com',
    'slogan': 'Inspire the world through words',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://pekikkan.com/explore?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    'sameAs': [
      'https://twitter.com/pekikkan',
      'https://facebook.com/pekikkan',
      'https://instagram.com/pekikkan'
    ]
  });

  const structuredData = quote ? generateQuoteStructuredData() : generateWebsiteStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author || 'Pekikkan'} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#6C63FF" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Pekikkan" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pekikkan" />
      <meta name="twitter:creator" content="@pekikkan" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//api.elevenlabs.io" />
      <link rel="dns-prefetch" href="//images.pexels.com" />
    </Helmet>
  );
};