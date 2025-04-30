import logger from '@/lib/logger';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!query) {
    return NextResponse.json(
      {
        error: 'Query parameter is required',
        results: [],
      },
      { status: 400 }
    );
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${searchQuery}&limit=${limit}`;

    logger.debug(`Server-side search request to ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Search request failed with status: ${response.status}`);
    }

    const htmlText = await response.text();

    const $ = cheerio.load(htmlText);
    const searchResults: SearchResult[] = [];

    $('.result').each((_, element) => {
      if (searchResults.length >= limit) return false;

      const titleElement = $(element).find('.result__title');
      const linkElement = $(element).find('.result__url');
      const snippetElement = $(element).find('.result__snippet');

      if (titleElement.length) {
        const titleLink = titleElement.find('a');
        const title = titleLink.text().trim();

        let url = '';
        if (linkElement.length) {
          url = linkElement.text().trim();
          if (!url.startsWith('http')) {
            url = `https://${url}`;
          }
        } else if (titleLink.length) {
          url = titleLink.attr('href') || '';
        }

        if (url.startsWith('/') || url.includes('duckduckgo.com/l/?')) {
          try {
            const urlObj = new URL(url, 'https://html.duckduckgo.com');
            const uddg = urlObj.searchParams.get('uddg');
            if (uddg) {
              url = decodeURIComponent(uddg);
            }
          } catch {
            logger.debug(`Failed to parse URL: ${url}`);
          }
        }

        const snippet = snippetElement.length ? snippetElement.text().trim() : '';

        if (title && url) {
          searchResults.push({ title, url, snippet });
        }
      }
    });

    logger.debug(`Found ${searchResults.length} search results`);

    if (searchResults.length === 0) {
      logger.debug('No results found with primary selector, trying fallback selectors');

      $('a[href^="http"]').each((_, element) => {
        if (searchResults.length >= limit) return false;

        const linkElement = $(element);
        const title = linkElement.text().trim();
        const url = linkElement.attr('href') || '';

        if (title && title.length > 15 && url && url.startsWith('http')) {
          searchResults.push({
            title,
            url,
            snippet: '',
          });
        }
      });

      logger.debug(`Found ${searchResults.length} results with fallback selector`);
    }

    if (searchResults.length === 0) {
      logger.warn('No search results found');

      return NextResponse.json({
        query,
      });
    }

    return NextResponse.json({
      query,
      results: searchResults,
      source: 'duckduckgo',
    });
  } catch (error) {
    logger.error(
      `Error during server-side web search: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return NextResponse.json({
      query,
      error: 'Search service unavailable',
    });
  }
}
