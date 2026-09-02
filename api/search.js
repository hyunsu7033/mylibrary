// Vercel Serverless Function for YES24 Book Search & Metadata Scraping
export default async function handler(req, res) {
  // CORS 헤더 설정
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

  try {
    const encodedQuery = encodeURIComponent(q);
    const searchUrl = `http://www.yes24.com/Product/Search?domain=ALL&query=${encodedQuery}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`YES24 responded with status: ${response.status}`);
    }

    const html = await response.text();

    // YES24 HTML에서 도서 항목 파싱 (정규식/파서 기반)
    const items = [];

    // yes24 goods item 패턴 검색
    const itemBlockRegex = /<li\s+data-goods-no="(\d+)"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;

    while ((match = itemBlockRegex.exec(html)) !== null && items.length < 8) {
      const goodsNo = match[1];
      const blockHtml = match[2];

      // 제목 추출
      const titleMatch = blockHtml.match(/class="gd_name"[^>]*>([^<]+)<\/a>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      if (!title) continue;

      // 저자 추출
      const authorMatch = blockHtml.match(/class="info_auth"[^>]*>([\s\S]*?)<\/span>/i);
      let author = '저자 미상';
      if (authorMatch) {
        author = authorMatch[1].replace(/<[^>]+>/g, '').trim();
      }

      // 출판사 추출
      const pubMatch = blockHtml.match(/class="info_pub"[^>]*>([\s\S]*?)<\/span>/i);
      let publisher = '출판사 미상';
      if (pubMatch) {
        publisher = pubMatch[1].replace(/<[^>]+>/g, '').trim();
      }

      // 발행일 추출
      const dateMatch = blockHtml.match(/class="info_date"[^>]*>([^<]+)<\/span>/i);
      const publishDate = dateMatch ? dateMatch[1].trim() : '';

      // 책소개/한줄평 추출
      const descMatch = blockHtml.match(/class="info_read"[^>]*>([^<]+)<\/div>/i);
      const description = descMatch ? descMatch[1].trim() : `${title} - ${author}`;

      // 고화질 표지 이미지 URL (YES24는 XL 또는 L 크기 이미지 지원)
      const coverImage = `https://image.yes24.com/goods/${goodsNo}/XL`;

      items.push({
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
        yes24Url: `http://www.yes24.com/Product/Goods/${goodsNo}`,
      });
    }

    // 결과가 비어있을 경우 Daum/OpenLibrary fallback
    if (items.length === 0) {
      const fallbackUrl = `https://openlibrary.org/search.json?q=${encodedQuery}&limit=5`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        const fallbackItems = (data.docs || []).map((doc) => ({
          isbn: doc.isbn ? doc.isbn[0] : goodsNoFallback(doc.key),
          title: doc.title || q,
          author: doc.author_name ? doc.author_name.join(', ') : '저자 미상',
          publisher: doc.publisher ? doc.publisher[0] : '출판사 미상',
          publishDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
          coverImage: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '',
          description: doc.first_sentence ? doc.first_sentence[0] : `${doc.title} 도서입니다.`,
          category: '수학/공학',
          totalPages: doc.number_of_pages_median || 300,
        }));
        return res.status(200).json({ items: fallbackItems });
      }
    }

    return res.status(200).json({ items });
  } catch (error) {
    console.error('YES24 Search Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function goodsNoFallback(key) {
  return (key || '').replace(/[^0-9]/g, '') || String(Date.now());
}
