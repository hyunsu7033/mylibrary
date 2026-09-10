import { NextRequest, NextResponse } from 'next/server';
import { searchYes24, Yes24Order } from '@/lib/yes24';

export const dynamic = 'force-dynamic';

interface Yes24BookItem {
  id: string;
  goodsNo?: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  pubDate?: string;
  price: number;
  rating?: number | null;
  reviewCount?: number;
  coverUrl: string;
  yes24Url: string;
  category: string;
  summary: string;
  isbn?: string;
}

// Curated Master Series DB (Fast cache for specific named series)
const SERIES_MASTER_DB: Record<string, Yes24BookItem[]> = {
  '와니니': [
    {
      id: 'yes24-1',
      title: '푸른 사자 와니니 1',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2015,
      isbn: '9788936442804',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936442804.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936442804',
      category: '문학/동화',
      summary: '세렝게티 초원의 마디바 사자 무리에서 가장 작고 약하게 태어난 어린 암사자 와니니. 무리의 규칙을 어겼다는 억울한 오해를 받고 홀로 거친 초원에 쫓겨납니다. 굶주림과 하이에나, 거대한 수사자들의 위협 속에서 와니니는 자신처럼 무리에서 밀려난 외톨이 친구들을 만나 작은 무리를 이룹니다.',
    },
    {
      id: 'yes24-2',
      title: '푸른 사자 와니니 2 : 검은 코뿔소를 찾아서',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2019,
      isbn: '9788936442996',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936442996.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936442996',
      category: '문학/동화',
      summary: '독립된 무리를 이끌게 된 어린 우두머리 와니니와 친구들. 극심한 가뭄과 사냥감 부족으로 생존의 기로에 선 초원에 전설의 거수 검은 코뿔소 바라바라가 나타납니다.',
    },
    {
      id: 'yes24-3',
      title: '푸른 사자 와니니 3 : 안개 언덕의 사자들',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2020,
      isbn: '9788936443092',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936443092.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936443092',
      category: '문학/동화',
      summary: '안개 자욱한 언덕 너머 미지의 땅으로 발걸음을 넓힌 와니니 무리. 그곳에서 잔혹한 떠돌이 수사자 형제들과 맞닥뜨리며 무리의 존립을 건 최대의 위기에 직면합니다.',
    }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
    const order = (searchParams.get('order') || searchParams.get('sort') || 'SINDEX_ONLY') as Yes24Order;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    if (!query) {
      return NextResponse.json({
        success: true,
        query: '',
        order,
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        count: 0,
        items: []
      });
    }

    // 1. Check Series Master DB only for exact single keyword match if default sort & page 1
    const cleanQuery = query.replace(/\s+/g, '').toLowerCase();
    if (page === 1 && order === 'SINDEX_ONLY') {
      for (const [key, bookList] of Object.entries(SERIES_MASTER_DB)) {
        const cleanKey = key.replace(/\s+/g, '').toLowerCase();
        if (cleanQuery === cleanKey) {
          return NextResponse.json({
            success: true,
            query,
            order,
            currentPage: 1,
            totalPages: 1,
            totalCount: bookList.length,
            count: bookList.length,
            items: bookList,
          });
        }
      }
    }

    // 2. Real-time YES24 Live Search Engine
    const yes24Result = await searchYes24({
      query,
      order,
      page,
    });

    if (yes24Result.success && yes24Result.items.length > 0) {
      return NextResponse.json({
        success: true,
        query,
        order: yes24Result.order,
        currentPage: yes24Result.currentPage,
        totalPages: yes24Result.totalPages,
        totalCount: yes24Result.totalCount,
        count: yes24Result.items.length,
        items: yes24Result.items,
      });
    }

    // 3. Fallback: Aladin Live Book Search
    try {
      const searchUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        next: { revalidate: 180 },
      });

      if (res.ok) {
        const html = await res.text();
        const boxMatches = html.split('<div class="ss_book_box"');
        const fallbackItems: Yes24BookItem[] = [];

        for (let i = 1; i < boxMatches.length && fallbackItems.length < 15; i++) {
          const box = boxMatches[i];
          const titleLinkMatch = box.match(/<a[^>]*class="bo3"[^>]*>([\s\S]*?)<\/a>/i);
          let title = titleLinkMatch ? titleLinkMatch[1].replace(/<[^>]+>/g, '').trim() : '';
          if (!title) continue;

          let coverUrl = '';
          const coverMatch = box.match(/<img[^>]*src="([^"]*image\.aladin\.co\.kr\/product\/[^"]*)"/i);
          if (coverMatch) coverUrl = coverMatch[1].replace('cover200', 'cover500');

          fallbackItems.push({
            id: `book-fallback-${i}`,
            title,
            author: '저자 정보 참조',
            publisher: '출판사',
            publishYear: new Date().getFullYear(),
            price: 15000,
            coverUrl,
            yes24Url: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(title)}`,
            category: '문학/도서',
            summary: `《${title}》의 도서 서지정보입니다.`,
          });
        }

        if (fallbackItems.length > 0) {
          return NextResponse.json({
            success: true,
            query,
            order,
            currentPage: 1,
            totalPages: 1,
            totalCount: fallbackItems.length,
            count: fallbackItems.length,
            items: fallbackItems,
          });
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback search error:', fallbackErr);
    }

    return NextResponse.json({
      success: true,
      query,
      order,
      currentPage: page,
      totalPages: 0,
      totalCount: 0,
      count: 0,
      items: [],
    });

  } catch (error: any) {
    console.error('Book Search API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      items: [] 
    }, { status: 500 });
  }
}
