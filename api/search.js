// Vercel Serverless Function: High-Reliability Multi-Source Korean Book Search (YES24 + Google Books + Open Library)
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
  const items = [];

  // 1. Google Books API (한국어 도서 인덱스 - 매우 신뢰도 높음, 최대 20권)
  try {
    const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=20&printType=books`;
    const gRes = await fetch(gUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData.items)) {
        for (const item of gData.items) {
          const info = item.volumeInfo || {};
          const title = info.title || '';
          if (!title) continue;

          // ISBN 추출
          let isbn = '';
          if (Array.isArray(info.industryIdentifiers)) {
            const isbn13 = info.industryIdentifiers.find((i) => i.type === 'ISBN_13');
            const isbn10 = info.industryIdentifiers.find((i) => i.type === 'ISBN_10');
            isbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : info.industryIdentifiers[0].identifier);
          }
          if (!isbn) isbn = item.id || String(Date.now());

          // 고화질 표지 이미지 링크 처리
          let coverImage = '';
          if (info.imageLinks) {
            coverImage = (info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '')
              .replace('http://', 'https://')
              .replace('&edge=curl', '');
          }
          if (!coverImage && isbn && isbn.length >= 10) {
            coverImage = `https://image.yes24.com/goods/${isbn}/XL`;
          }

          items.push({
            goodsNo: isbn,
            isbn: isbn,
            title: title + (info.subtitle ? `: ${info.subtitle}` : ''),
            author: info.authors ? info.authors.join(', ') : '저자 미상',
            publisher: info.publisher || '출판사 미상',
            publishDate: info.publishedDate || '',
            coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            description: info.description ? info.description.slice(0, 220) + '...' : `${title} 도서입니다.`,
            category: (info.categories && info.categories[0]) ? info.categories[0] : '수학/공학/학술',
            totalPages: info.pageCount || 300,
            yes24Url: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(title)}`,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Google Books API failed:', err);
  }

  // 2. YES24 데스크탑 및 모바일 검색 크롤러 보강
  try {
    const yes24Url = `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodedQuery}`;
    const yesRes = await fetch(yes24Url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.yes24.com/',
      }
    });

    if (yesRes.ok) {
      const html = await yesRes.text();
      const parts = html.split(/data-goods-no="/i);

      for (let i = 1; i < parts.length && items.length < 30; i++) {
        const part = parts[i];
        const goodsNoMatch = part.match(/^(\d+)"/);
        if (!goodsNoMatch) continue;
        const goodsNo = goodsNoMatch[1];

        const titleMatch = part.match(/class="gd_name"[^>]*>([\s\S]*?)<\/a>/i);
        if (!titleMatch) continue;
        const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        if (!title) continue;

        const authMatch = part.match(/class="info_auth"[^>]*>([\s\S]*?)<\/span>/i);
        const author = authMatch ? authMatch[1].replace(/<[^>]+>/g, '').trim() : '저자 미상';

        const pubMatch = part.match(/class="info_pub"[^>]*>([\s\S]*?)<\/span>/i);
        const publisher = pubMatch ? pubMatch[1].replace(/<[^>]+>/g, '').trim() : '출판사 미상';

        const dateMatch = part.match(/class="info_date"[^>]*>([^<]+)<\/span>/i);
        const publishDate = dateMatch ? dateMatch[1].trim() : '';

        const descMatch = part.match(/class="info_read"[^>]*>([\s\S]*?)<\/div>/i);
        const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : `${title} - ${author}`;

        const coverImage = `https://image.yes24.com/goods/${goodsNo}/XL`;

        // 기존 목록에 중복되지 않게 추가 (앞쪽에 배치하여 YES24 우선순위)
        const isDuplicate = items.some(item => item.title.toLowerCase().replace(/\s/g, '') === title.toLowerCase().replace(/\s/g, ''));
        if (!isDuplicate) {
          items.unshift({
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
    console.warn('YES24 fallback fetch failed:', err);
  }

  // 3. 만약 여전히 결과가 없을 경우 Open Library 보조
  if (items.length === 0) {
    try {
      const openLibUrl = `https://openlibrary.org/search.json?q=${encodedQuery}&limit=12`;
      const openLibRes = await fetch(openLibUrl);
      if (openLibRes.ok) {
        const oData = await openLibRes.json();
        const fallbackItems = (oData.docs || []).map((doc) => ({
          goodsNo: doc.isbn ? doc.isbn[0] : (doc.key ? doc.key.replace('/works/', '') : String(Date.now())),
          isbn: doc.isbn ? doc.isbn[0] : 'ISBN-UNKNOWN',
          title: doc.title || cleanQuery,
          author: doc.author_name ? doc.author_name.join(', ') : '저자 미상',
          publisher: doc.publisher ? doc.publisher[0] : '출판사 미상',
          publishDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
          coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : `${doc.title} 도서입니다.`,
          category: '학술/전문',
          totalPages: doc.number_of_pages_median || 300,
        }));
        return res.status(200).json({ items: fallbackItems });
      }
    } catch (e) {}
  }

  return res.status(200).json({ items });
}
