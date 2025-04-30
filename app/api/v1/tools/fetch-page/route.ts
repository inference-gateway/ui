import logger from '@/lib/logger';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      {
        error: 'URL parameter is required',
        title: '',
        content: '',
      },
      { status: 400 }
    );
  }

  try {
    logger.debug(`Fetching page content from ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Page fetch request failed with status: ${response.status}`);
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);

    $('script, style, iframe, nav, footer, header, aside').remove();

    const title = $('title').text().trim();

    let content = '';

    if ($('article').length) {
      content = $('article').text().trim();
    } else if ($('main').length) {
      content = $('main').text().trim();
    } else if ($('#content').length) {
      content = $('#content').text().trim();
    } else if ($('.content').length) {
      content = $('.content').text().trim();
    } else {
      content = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .join('\n\n');
    }

    content = content.replace(/\s+/g, ' ').trim();

    const maxLength = 8000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '... (content truncated)';
    }

    logger.debug(`Successfully fetched content from ${url}, length: ${content.length} chars`);

    return NextResponse.json({
      url,
      title,
      content,
    });
  } catch (error) {
    logger.error(
      `Error fetching page content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return NextResponse.json({
      url,
      error: 'Failed to fetch page content',
      title: '',
      content: '',
    });
  }
}
