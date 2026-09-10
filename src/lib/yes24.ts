/**
 * YES24 Book Search Engine Module
 * Reusable across any TypeScript/Node.js application
 */

export type Yes24Order = 
  | 'SINDEX_ONLY' // 인기도순 (판매도)
  | 'RELATION'    // 정확도순
  | 'RECENT'      // 신상품순 (출간일)
  | 'REG_DTS'     // 등록일순
  | 'LOW_PRICE'   // 최저가순
  | 'HIGH_PRICE'  // 최고가순
  | 'CONT_CNT'    // 평점순
  | 'REVIEW_CNT'; // 리뷰순

export interface Yes24SearchParams {
  query: string;
  order?: Yes24Order;
  page?: number;
}

export interface Yes24Book {
  id: string;
  goodsNo: string;
  title: string;
  subTitle?: string;
  author: string;
  publisher: string;
  pubDate: string;
  publishYear: number;
  price: number;
  rating: number | null;
  reviewCount: number;
  coverUrl: string;
  yes24Url: string;
  summary: string;
  category: string;
}

export interface Yes24SearchResult {
  success: boolean;
  query: string;
  order: Yes24Order;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  items: Yes24Book[];
  error?: string;
}

export async function searchYes24(params: Yes24SearchParams): Promise<Yes24SearchResult> {
  const query = (params.query || '').trim();
  const order: Yes24Order = params.order || 'SINDEX_ONLY';
  const page = Math.max(1, params.page || 1);

  if (!query) {
    return {
      success: true,
      query: '',
      order,
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      items: [],
    };
  }

  const searchUrl = `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(query)}&order=${order}&page=${page}&size=24`;

  try {
    const res = await fetch(searchUrl, {
      next: { revalidate: 180 }
    });

    if (!res.ok) {
      throw new Error(`YES24 HTTP status: ${res.status}`);
    }

    const html = await res.text();

    // Check for yesSchList
    const schStart = html.indexOf('id="yesSchList"');
    if (schStart === -1) {
      return {
        success: true,
        query,
        order,
        currentPage: page,
        totalPages: 0,
        totalCount: 0,
        items: [],
      };
    }

    // Extract Total Pages from pagination
    let totalPages = page;
    const pagenChunk = html.match(/class="sGoodsPagen"[\s\S]*?<\/div>\s*<\/div>/i);
    if (pagenChunk) {
      const endMatch = pagenChunk[0].match(/class="bgYUI end\s*"[^>]*title="(\d+)"/i) ||
                       pagenChunk[0].match(/onclick="changeSearchParam\(this,\s*(\d+)\);"[^>]*class="bgYUI end/i);
      if (endMatch) {
        totalPages = parseInt(endMatch[1], 10);
      } else {
        const pageNums = [...pagenChunk[0].matchAll(/changeSearchParam\(this,\s*(\d+)\)/g)].map(m => parseInt(m[1], 10));
        if (pageNums.length > 0) {
          totalPages = Math.max(...pageNums);
        }
      }
    }

    // Limit list area to prevent bleeding into bottom recommendations or series
    const pagenStart = html.indexOf('class="sGoodsPagen"', schStart);
    const listArea = html.substring(schStart, pagenStart !== -1 ? pagenStart : html.length);

    // Split by <li ... data-goods-no="
    const chunks = listArea.split(/<li[^>]*data-goods-no="(\d+)"/gi);
    const items: Yes24Book[] = [];

    for (let i = 1; i < chunks.length; i += 2) {
      const goodsNo = chunks[i];
      const chunk = chunks[i + 1] || '';

      // Title
      const titleMatch = chunk.match(/<a[^>]*class="gd_name"[^>]*>([\s\S]*?)<\/a>/i);
      const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      if (!rawTitle) continue;

      // Subtitle
      const subMatch = chunk.match(/<span class="gd_name_sub"[^>]*>([\s\S]*?)<\/span>/i);
      const subTitle = subMatch ? subMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const fullTitle = subTitle ? `${rawTitle} : ${subTitle}` : rawTitle;

      // Cover image
      const imgMatch = chunk.match(/data-original="([^"]+)"/i) || chunk.match(/src="([^"]*image\.yes24\.com\/goods\/[^"]*)"/i);
      let coverUrl = imgMatch ? imgMatch[1] : '';
      if (coverUrl.includes('/M/')) coverUrl = coverUrl.replace('/M/', '/XL/');
      else if (coverUrl.includes('/S/')) coverUrl = coverUrl.replace('/S/', '/XL/');

      // Author
      const authMatch = chunk.match(/<span[^>]*class="[^"]*info_auth[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
      let author = authMatch ? authMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ') : '저자 미상';
      author = author.replace(/\s*저$/, '').trim();

      // Publisher
      const pubMatch = chunk.match(/<span[^>]*class="[^"]*info_pub[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
      const publisher = pubMatch ? pubMatch[1].replace(/<[^>]+>/g, '').trim() : '출판사 미상';

      // Date
      const dateMatch = chunk.match(/<span[^>]*class="[^"]*info_date[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
      const pubDate = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      let publishYear = new Date().getFullYear();
      const yearMatch = pubDate.match(/(\d{4})년/);
      if (yearMatch) publishYear = parseInt(yearMatch[1], 10);

      // Price
      const priceMatch = chunk.match(/<strong class="txt_num">[\s\S]*?<em class="yes_b">([\d,]+)<\/em>원/i) ||
                          chunk.match(/<em class="yes_b">([\d,]+)<\/em>원/i);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 15000;

      // Rating
      const ratingMatch = chunk.match(/<span class="rating_grade"[\s\S]*?<em class="yes_b">([\d.]+)<\/em>/i);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

      // Review Count
      const reviewMatch = chunk.match(/<span class="rating_rvCount"[\s\S]*?<em class="txC_blue">([\d,]+)<\/em>/i);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : 0;

      // Summary
      const summaryMatch = chunk.match(/<div class="info_row info_dialog"[\s\S]*?<p class="txt_info">([\s\S]*?)<\/p>/i) ||
                           chunk.match(/<p class="txt_info">([\s\S]*?)<\/p>/i);
      const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, '').trim() : `《${fullTitle}》 (${author}, ${publisher}, ${pubDate})`;

      // Category detection
      let category = '문학/소설';
      if (fullTitle.includes('과학') || fullTitle.includes('인체') || summary.includes('과학') || summary.includes('우주')) {
        category = '과학/우주';
      } else if (fullTitle.includes('경제') || fullTitle.includes('돈') || fullTitle.includes('투자')) {
        category = '경제/경영';
      } else if (fullTitle.includes('동화') || fullTitle.includes('그림책') || author.includes('그림')) {
        category = '문학/동화';
      } else if (fullTitle.includes('철학') || fullTitle.includes('인생') || fullTitle.includes('심리') || fullTitle.includes('질문')) {
        category = '철학/인성';
      }

      items.push({
        id: `yes24-${goodsNo}`,
        goodsNo,
        title: fullTitle,
        subTitle,
        author,
        publisher,
        pubDate,
        publishYear,
        price,
        rating,
        reviewCount,
        coverUrl,
        yes24Url: `https://www.yes24.com/Product/Goods/${goodsNo}`,
        summary,
        category,
      });
    }

    let totalCount = totalPages * 24;
    if (page === totalPages && items.length < 24) {
      totalCount = (totalPages - 1) * 24 + items.length;
    }

    return {
      success: true,
      query,
      order,
      currentPage: page,
      totalPages,
      totalCount,
      items,
    };

  } catch (error: any) {
    return {
      success: false,
      query,
      order,
      currentPage: page,
      totalPages: 0,
      totalCount: 0,
      items: [],
      error: error.message || 'YES24 검색 중 오류가 발생했습니다.',
    };
  }
}
