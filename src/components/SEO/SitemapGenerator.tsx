import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const SitemapGenerator: React.FC = () => {
  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      const baseUrl = 'https://pekikkan.com';
      const entries: SitemapEntry[] = [];

      // Static pages with updated descriptions
      entries.push(
        {
          url: baseUrl,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 1.0
        },
        {
          url: `${baseUrl}/explore`,
          lastmod: new Date().toISOString(),
          changefreq: 'hourly',
          priority: 0.9
        },
        {
          url: `${baseUrl}/post`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        }
      );

      // Fetch recent quotes for dynamic URLs
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, updated_at, author')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (quotes) {
        quotes.forEach(quote => {
          entries.push({
            url: `${baseUrl}/quote/${quote.id}`,
            lastmod: quote.updated_at,
            changefreq: 'weekly',
            priority: 0.6
          });
        });
      }

      // Fetch popular authors
      const { data: authors } = await supabase
        .from('quotes')
        .select('author')
        .order('like_count', { ascending: false })
        .limit(100);

      if (authors) {
        const uniqueAuthors = [...new Set(authors.map(a => a.author))];
        uniqueAuthors.forEach(author => {
          entries.push({
            url: `${baseUrl}/author/${encodeURIComponent(author)}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.5
          });
        });
      }

      // Generate XML sitemap
      const sitemap = generateSitemapXML(entries);
      
      // Store sitemap (in a real app, you'd save this to a file or CDN)
      console.log('Generated sitemap for Pekikkan - Inspire the world through words:', sitemap);
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
    }
  };

  const generateSitemapXML = (entries: SitemapEntry[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

    return `${xmlHeader}\n${urlsetOpen}${urls}\n${urlsetClose}`;
  };

  return null; // This component doesn't render anything
};