// Vercel Serverless Function for YES24 & Korean Book Multi-Source Search
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const cleanQuery = String(q).trim();
  const encodedQuery = encodeURIComponent(cleanQuery);
  const allItems = [];

  // 1. YES24 BOOK 검색 시도 (domain=BOOK)
  try {
    const searchUrl = `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodedQuery}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (response.ok) {
      const html = await response.text();

      // data-goods-no 블록 단위로 분할하여 안정적으로 다중 도서 추출
      const parts = html.split(/data-goods-no="/i);
      
      for (let i = 1; i < parts.length && allItems.length < 15; i++) {
        const part = parts[i];
        const goodsNoMatch = part.match(/^(\d+)"/);
        if (!goodsNoMatch) continue;
        const goodsNo = goodsNoMatch[1];

        // 상품 제목 추출
        const titleMatch = part.match(/class="gd_name"[^>]*>([\s\S]*?)<\/a>/i);
        if (!titleMatch) continue;
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        if (!title || title.length < 2) continue;

        // 저자 추출
        const authMatch = part.match(/class="info_auth"[^>]*>([\s\S]*?)<\/span>/i);
        const author = authMatch ? authMatch[1].replace(/<[^>]+>/g, '').trim() : '저자 미상';

        // 출판사 추출
        const pubMatch = part.match(/class="info_pub"[^>]*>([\s\S]*?)<\/span>/i);
        const publisher = pubMatch ? pubMatch[1].replace(/<[^>]+>/g, '').trim() : '출판사 미상';

        // 발행일 추출
        const dateMatch = part.match(/class="info_date"[^>]*>([^<]+)<\/span>/i);
        const publishDate = dateMatch ? dateMatch[1].trim() : '';

        // 책소개/한줄평 추출
        const descMatch = part.match(/class="info_read"[^>]*>([\s\S]*?)<\/div>/i);
        const description = descMatch
          ? descMatch[1].replace(/<[^>]+>/g, '').trim()
          : `${title} - ${author} (${publisher})`;

        // 고화질 표지 이미지 (YES24 XL)
        const coverImage = `https://image.yes24.com/goods/${goodsNo}/XL`;

        // 중복 방지
        if (!allItems.some((item) => item.goodsNo === goodsNo || item.title === title)) {
          allItems.push({
            goodsNo,
            isbn: goodsNo,
            title,
            author,
            publisher,
            publishDate,
            coverImage,
            description,
            category: '수학/공학',
            totalPages: 320,
            yes24Url: `https://www.yes24.com/Product/Goods/${goodsNo}`,
          });
        }
      }
    }
  } catch (err) {
    console.warn('YES24 scraping error:', err);
  }

  // 2. Google Books API (한국어 도서 풍성한 검색 결과 보강 - 최대 10권 추가)
  try {
    const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=10&langRestrict=ko`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData.items)) {
        for (const item of gData.items) {
          const info = item.volumeInfo || {};
          const title = info.title || '';
          if (!title) continue;

          // 중복 확인
          if (allItems.some((b) => b.title.toLowerCase() === title.toLowerCase())) {
            continue;
          }

          const isbn = info.industryIdentifiers?.[0]?.identifier || item.id || String(Date.now());
          const imageLink = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
          const secureImage = imageLink.replace('http://', 'https://');

          allItems.push({
            goodsNo: isbn,
            isbn: isbn,
            title: title + (info.subtitle ? `: ${info.subtitle}` : ''),
            author: info.authors ? info.authors.join(', ') : '저자 미상',
            publisher: info.publisher || '출판사 미상',
            publishDate: info.publishedDate || '',
            coverImage: secureImage || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80`,
            description: info.description ? info.description.slice(0, 200) + '...' : `${title} 도서입니다.`,
            category: info.categories?.[0] || '수학/공학',
            totalPages: info.pageCount || 300,
            yes24Url: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(title)}`,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Google Books API fallback error:', err);
  }

  // 3. 만약 결과가 여전히 비어있을 때 OpenLibrary 호출
  if (allItems.length === 0) {
    try {
      const fallbackUrl = `https://openlibrary.org/search.json?q=${encodedQuery}&limit=10`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        const fallbackItems = (data.docs || []).map((doc) => ({
          goodsNo: doc.isbn ? doc.isbn[0] : (doc.key ? doc.key.replace('/works/', '') : String(Date.now())),
          isbn: doc.isbn ? doc.isbn[0] : 'ISBN-UNKNOWN',
          title: doc.title || cleanQuery,
          author: doc.author_name ? doc.author_name.join(', ') : '저자 미상',
          publisher: doc.publisher ? doc.publisher[0] : '출판사 미상',
          publishDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
          coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : `${doc.title} 도서입니다.`,
          category: '수학/공학',
          totalPages: doc.number_of_pages_median || 300,
        }));
        return res.status(200).json({ items: fallbackItems });
      }
    } catch (err) {
      console.warn('OpenLibrary fallback error:', err);
    }
  }

  return res.status(200).json({ items: allItems });
}
