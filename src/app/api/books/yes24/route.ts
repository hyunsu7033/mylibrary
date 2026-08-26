import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Yes24BookItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  price: number;
  coverUrl: string;
  yes24Url: string;
  category: string;
  summary: string;
  isbn: string;
}

// Complete Series & Bestseller Master DB with Rich, In-depth Synopses and 100% Real Covers
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
      summary: '세렝게티 초원의 마디바 사자 무리에서 가장 작고 약하게 태어난 어린 암사자 와니니. 무리의 규칙을 어겼다는 억울한 오해를 받고 홀로 거친 초원에 쫓겨납니다. 굶주림과 하이에나, 거대한 수사자들의 위협 속에서 와니니는 자신처럼 무리에서 밀려난 외톨이 친구들(아산테, 잠보, 말라피)을 만나 작은 무리를 이룹니다. 서로의 약점을 감싸 안으며 초원의 사계절을 버텨내고 마침내 스스로의 힘으로 진정한 용기와 연대의 가치를 증명해내는 대한민국 대표 아동문학 성장 걸작입니다.',
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
      summary: '독립된 무리를 이끌게 된 어린 우두머리 와니니와 친구들. 극심한 가뭄과 사냥감 부족으로 생존의 기로에 선 초원에 전설의 거수 \'검은 코뿔소 바라바라\'가 나타납니다. 거대한 맹수들과 다른 사자 무리의 견제 속에서, 와니니 무리는 초원의 지혜를 간직한 늙은 코뿔소를 만나 자연의 순환과 생명의 숭고한 질서를 배우며 한층 더 성숙한 리더십을 발휘합니다.',
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
      summary: '안개 자욱한 언덕 너머 미지의 땅으로 발걸음을 넓힌 와니니 무리. 그곳에서 잔혹한 떠돌이 수사자 형제들과 맞닥뜨리며 무리의 존립을 건 최대의 위기에 직면합니다. 물리적 힘보다 강한 신뢰와 지혜, 그리고 친구들을 지키기 위해 두려움에 맞서는 와니니의 눈부신 용기가 긴장감 넘치는 필치로 펼쳐집니다.',
    },
    {
      id: 'yes24-4',
      title: '푸른 사자 와니니 4 : 사냥꾼들이 오던 날',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2021,
      isbn: '9788936443214',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936443214.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936443214',
      category: '문학/동화',
      summary: '평화롭던 대초원에 총성을 울리며 들이닥친 인간 밀렵꾼들. 야생 동물들의 목숨을 위협하는 전례 없는 재앙 앞에서, 와니니는 과거의 반목을 접어두고 다른 초원 동물들과 힘을 모으기로 결심합니다. 인간과 자연, 생명 존중이라는 묵직한 화두를 어린이의 눈높이에 맞추어 감동적으로 풀어낸 수작입니다.',
    },
    {
      id: 'yes24-5',
      title: '푸른 사자 와니니 5 : 바람을 타고 온 영웅',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2022,
      isbn: '9788936443313',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936443313.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936443313',
      category: '문학/동화',
      summary: '초원에 거센 불길이 번지는 대화재의 비극 속에서, 흩어진 친구들을 찾고 다친 동물들을 구하기 위해 위험을 무릅쓰는 와니니의 활약이 펼쳐집니다. 진정한 영웅은 타고난 힘이 아니라 남을 위해 내미는 따뜻한 손길에서 비롯됨을 웅장하게 보여줍니다.',
    },
    {
      id: 'yes24-6',
      title: '푸른 사자 와니니 6 : 푸른 사자들의 초원',
      author: '이현 글 / 오윤화 그림',
      publisher: '창비',
      publishYear: 2023,
      isbn: '9788936443429',
      price: 10800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936443429.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936443429',
      category: '문학/동화',
      summary: '어린 암사자에서 시작해 초원 전체가 존경하는 위대한 리더로 우뚝 선 와니니. 수많은 만남과 이별, 시련을 딛고 완성된 와니니 무리의 눈부신 서사가 벅찬 감동으로 마무리되는 대단원의 클라이맥스입니다.',
    }
  ],
  '불편한 편의점': [
    {
      id: 'yes24-b1',
      title: '불편한 편의점 1',
      author: '김호연',
      publisher: '나무옆의자',
      publishYear: 2021,
      isbn: '9791161571188',
      price: 14000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791161571188.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9791161571188',
      category: '문학/소설',
      summary: '서울 청파동 골목 모퉁이에 자리 잡은 낡고 불편한 ALWAYS 편의점. 지갑을 잃어버린 70대 여성 염 여사는 자신의 지갑을 찾아준 노숙인 \'독고\'에게 야간 아르바이트 자리를 제안합니다. 말도 어눌하고 기억을 잃은 독고가 편의점을 찾는 다양한 이웃들(취준생, 고단한 가장, 갈등을 겪는 모자 등)의 사연을 묵묵히 들어주고 온기를 건네며, 편의점은 사람들의 상처를 치유하는 기적의 공간으로 탈바꿈합니다.',
    },
    {
      id: 'yes24-b2',
      title: '불편한 편의점 2',
      author: '김호연',
      publisher: '나무옆의자',
      publishYear: 2022,
      isbn: '9791161571379',
      price: 14000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791161571379.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9791161571379',
      category: '문학/소설',
      summary: '독고가 떠난 후 1년 반이 흐른 ALWAYS 편의점. 코로나19의 긴 터널 속에서 새로운 야간 알바생 \'홍금보\'가 등장하며 펼쳐지는 두 번째 힐링 드라마. 고단한 일상을 살아가는 보통 사람들의 삶에 다정한 온기와 웃음을 전하며 한층 더 깊어진 위로를 선사합니다.',
    }
  ],
  '긴긴밤': [
    {
      id: 'yes24-n1',
      title: '긴긴밤',
      author: '루리 글/그림',
      publisher: '문학동네',
      publishYear: 2021,
      isbn: '9788954677189',
      price: 11500,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788954677189.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788954677189',
      category: '문학/동화',
      summary: '지구상에 마지막 하나 남은 흰바위코뿔소 \'노든\'과 버려진 알에서 태어난 어린 펭귄의 눈물겨운 동행. 코끼리 무리에서 자라나 가족을 잃고 인간의 전쟁과 동물원을 거치며 상처 입은 노든이, 어린 펭귄을 바다로 데려가기 위해 험난한 사막과 황야를 건넙니다. 수많은 이들의 사랑과 희생으로 끝내 자신만의 바다에 도달하는 경이로운 생명의 연대를 노래한 제21회 문학동네어린이문학상 대상 수상작입니다.',
    }
  ],
  '마당을 나온 암탉': [
    {
      id: 'yes24-m1',
      title: '마당을 나온 암탉',
      author: '황선미 글 / 김환영 그림',
      publisher: '사계절',
      publishYear: 2000,
      isbn: '9788971968710',
      price: 11000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788971968710.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788971968710',
      category: '문학/동화',
      summary: '양계장 좁은 철장에 갇혀 알만 낳던 암탉 \'잎싹\'. 자신의 알을 직접 품어 병아리를 탄생시키겠다는 간절한 소망을 품고 마당을 탈출합니다. 숲속에서 버려진 청둥오리 알을 품어 아기 오리 \'초록머리\'를 낳아 기르며, 천적 족제비의 위협 속에서 목숨을 바쳐 자식을 지켜냅니다. 모성애와 자유, 그리고 자연의 순환에 대한 깊은 철학적 울림을 전하는 한국 아동문학의 불멸의 고전입니다.',
    }
  ],
  '아몬드': [
    {
      id: 'yes24-a1',
      title: '아몬드 (Almond)',
      author: '손원평',
      publisher: '창비',
      publishYear: 2017,
      isbn: '9788936434267',
      price: 12000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788936434267.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788936434267',
      category: '문학/소설',
      summary: '뇌 속 편도체(아몬드) 크기가 작아 분노도 공포도 느끼지 못하는 알렉시티미아(감정표현불능증)를 앓는 16세 소년 윤재. 비극적인 사고로 가족을 잃고 세상에 홀로 남겨진 윤재 앞에, 어두운 상처로 가득 찬 소년 \'곤이\'와 맑은 영혼의 소녀 \'도라\'가 나타납니다. 서로의 결핍을 마주하며 타인의 고통에 공감하는 법을 배워가는 뭉클한 청소년 필독 성장 소설입니다.',
    }
  ],
  '어린 왕자': [
    {
      id: 'yes24-lp1',
      title: '어린 왕자 (The Little Prince)',
      author: '앙투안 드 생텍쥐페리',
      publisher: '열린책들',
      publishYear: 2015,
      isbn: '9788932917245',
      price: 9800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788932917245.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788932917245',
      category: '철학/인성',
      summary: '사하라 사막에 불시착한 비행사가 B612 소행성에서 온 어린 왕자를 만나며 시작되는 이야기. 장미꽃 한 송이를 사랑했지만 떠나올 수밖에 없었던 순수한 왕자가 여우를 만나 "가장 중요한 것은 눈에 보이지 않고 마음으로 보아야 한다"는 진리를 깨달아가는 불후의 세계 명작입니다.',
    }
  ],
  '강아지 똥': [
    {
      id: 'yes24-p1',
      title: '강아지 똥',
      author: '권정생 글 / 정승각 그림',
      publisher: '길벗어린이',
      publishYear: 1996,
      isbn: '9788986621136',
      price: 11000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788986621136.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788986621136',
      category: '문학/동화',
      summary: '길가에 버려져 참새, 흙덩이 등 모두에게 더럽다고 놀림받던 강아지 똥. 자신이 세상에 아무 쓸모도 없는 존재라며 슬퍼하던 중, 봄비 속에서 노란 민들레 싹을 만납니다. 민들레 꽃을 아름답게 피우기 위해 기꺼이 자신의 몸을 녹여 거름이 되는 강아지 똥의 숭고한 사랑과 생명의 고귀한 가치를 전하는 한국 대표 그림책입니다.',
    }
  ],
  '코스모스': [
    {
      id: 'yes24-c1',
      title: '코스모스 (청소년을 위한)',
      author: '칼 세이건',
      publisher: '사이언스북스',
      publishYear: 2021,
      isbn: '9788983711892',
      price: 18000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788983711892.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788983711892',
      category: '과학/우주',
      summary: '광대한 우주의 탄생과 별의 진화, 지구와 인류의 기원을 감동적으로 탐구한 20세기 최고의 과학 교양서. 칼 세이건 특유의 시적이고 인문학적인 통찰을 통해 우리 인간이 모두 우주의 별먼지(Stardust)에서 비롯되었음을 일깨우며, 하나뿐인 보금자리 지구의 소중함을 역설합니다.',
    }
  ],
  '만복이네': [
    {
      id: 'yes24-m1',
      title: '만복이네 떡집',
      author: '김리리 글 / 이승현 그림',
      publisher: '비룡소',
      publishYear: 2010,
      isbn: '9788949161341',
      price: 11000,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788949161341.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9788949161341',
      category: '문학/동화',
      summary: '마음과 달리 입만 열면 나쁜 말과 심술을 부려 외톨이가 된 초등학생 만복이. 어느 날 길모퉁이에서 착한 일과 칭찬, 웃음으로만 값을 치를 수 있는 신비한 떡집을 발견합니다. 찹쌀떡, 꿀떡 등 신비한 마법 떡을 먹으며 친구의 마음을 이해하고 고운 말을 사용하는 따뜻한 아이로 변해가는 인기 베스트셀러 창작동화입니다.',
    }
  ],
  '달러구트': [
    {
      id: 'yes24-d1',
      title: '달러구트 꿈 백화점 1',
      author: '이미예',
      publisher: '팩토리나인',
      publishYear: 2020,
      isbn: '9791165341909',
      price: 13800,
      coverUrl: 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791165341909.jpg',
      yes24Url: 'https://www.yes24.com/Product/Search?domain=BOOK&query=9791165341909',
      category: '판타지/소설',
      summary: '잠들어야만 입장할 수 있는 신비로운 마을의 중심, 온갖 꿈을 파는 \'달러구트 꿈 백화점\'. 하늘을 나는 꿈, 좋아하던 사람을 만나는 꿈, 그리고 과거의 아픔을 극복하게 해주는 악몽까지. 손님들이 꿈을 꾼 후 느끼는 감정으로 값을 치르는 독특한 세계관 속에서 지친 현대인들의 마음을 따뜻하게 안아주는 힐링 판타지 소설입니다.',
    }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cleanQuery = query.replace(/\s+/g, '').toLowerCase();

    // 1. Check Series Master DB for instant reliable matching
    for (const [key, bookList] of Object.entries(SERIES_MASTER_DB)) {
      const cleanKey = key.replace(/\s+/g, '').toLowerCase();
      if (cleanQuery.includes(cleanKey) || cleanKey.includes(cleanQuery)) {
        return NextResponse.json({
          success: true,
          query,
          count: bookList.length,
          items: bookList,
        });
      }
    }

    // 2. Real-time Live Book Search (Aladin & OpenLibrary Engine)
    const searchUrl = `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(query)}`;
    
    let liveItems: Yes24BookItem[] = [];

    try {
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const html = await res.text();
        const boxMatches = html.split('<div class="ss_book_box"');

        for (let i = 1; i < boxMatches.length && liveItems.length < 12; i++) {
          const box = boxMatches[i];

          // Item ID
          const itemIdMatch = box.match(/itemId="(\d+)"/i) || box.match(/ItemId=(\d+)/i);
          const itemId = itemIdMatch ? itemIdMatch[1] : `book-${Date.now()}-${i}`;

          // Title
          const titleLinkMatch = box.match(/<a[^>]*class="bo3"[^>]*>([\s\S]*?)<\/a>/i);
          let title = titleLinkMatch ? titleLinkMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          // Subtitle
          const subTitleMatch = box.match(/<span class="ss_f_g2">([\s\S]*?)<\/span>/i);
          if (subTitleMatch && title) {
            const sub = subTitleMatch[1].replace(/<[^>]+>/g, '').trim();
            if (sub && !title.includes(sub)) {
              title = `${title} ${sub}`.trim();
            }
          }

          if (!title) {
            const altTitleMatch = box.match(/<a[^>]*href="[^"]*wproduct\.aspx\?ItemId=\d+"[^>]*><b>([\s\S]*?)<\/b><\/a>/i);
            if (altTitleMatch) title = altTitleMatch[1].replace(/<[^>]+>/g, '').trim();
          }

          if (!title) continue;

          // Front Cover Image
          let coverUrl = '';
          const frontMatch = box.match(/<img[^>]*class="front_cover"[^>]*src="([^"]+)"/i);
          if (frontMatch) {
            coverUrl = frontMatch[1];
          } else {
            const coverMatch = box.match(/<img[^>]*src="([^"]*image\.aladin\.co\.kr\/product\/[^"]*)"/i);
            if (coverMatch) {
              coverUrl = coverMatch[1];
              if (coverUrl.includes('SpineShelf')) {
                coverUrl = coverUrl.replace('SpineShelf', 'cover500').replace('_d.jpg', '_1.jpg');
              }
            }
          }
          if (coverUrl) {
            coverUrl = coverUrl.replace('cover200', 'cover500').replace('coversum', 'cover500');
          }

          // Author, Publisher, Year
          const liMatches = [...box.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) =>
            m[1].replace(/<[^>]+>/g, '').trim()
          );
          let author = '저자 미상';
          let publisher = '출판사 미상';
          let publishYear = new Date().getFullYear();

          for (const li of liMatches) {
            if (li.includes('|')) {
              const parts = li.split('|').map((p) => p.trim());
              if (parts.length >= 1 && parts[0]) author = parts[0];
              if (parts.length >= 2 && parts[1]) publisher = parts[1];
              if (parts.length >= 3 && parts[2]) {
                const yearMatch = parts[2].match(/(\d{4})/);
                if (yearMatch) publishYear = parseInt(yearMatch[1], 10);
              }
              break;
            }
          }

          // Price
          const priceMatch = box.match(/class="ss_p2"[^>]*>[\s\S]*?<b>([\d,]+)<\/b>원/i) || box.match(/<b>([\d,]+)<\/b>원/i);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 15000;

          // Category detection
          let category = '문학/소설';
          if (box.includes('경제경영') || box.includes('비즈니스') || box.includes('경영')) category = '경제/경영';
          else if (box.includes('자기계발')) category = '자기계발';
          else if (box.includes('인문학') || box.includes('철학')) category = '철학/인성';
          else if (box.includes('과학') || box.includes('우주') || box.includes('IT')) category = '과학/우주';
          else if (box.includes('어린이') || box.includes('동화') || box.includes('유아')) category = '문학/동화';
          else if (box.includes('역사')) category = '역사/사회';
          else if (box.includes('시/에세이') || box.includes('에세이')) category = '시/에세이';

          // ISBN
          const isbnMatch = box.match(/ISBN=([A-Za-z0-9]+)/i);
          const isbn = isbnMatch ? isbnMatch[1] : '';

          liveItems.push({
            id: `book-${itemId}`,
            title,
            author,
            publisher,
            publishYear,
            price,
            coverUrl,
            yes24Url: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(isbn || title)}`,
            category,
            summary: `《${title}》 (${author}, ${publisher})의 실시간 서지정보입니다.`,
            isbn,
          });
        }
      }
    } catch (scrapErr) {
      console.warn('Live online book search error:', scrapErr);
    }

    // 3. Fallback to OpenLibrary if no items found
    if (liveItems.length === 0) {
      try {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`);
        if (olRes.ok) {
          const olData = await olRes.json();
          if (olData.docs && olData.docs.length > 0) {
            liveItems = olData.docs.slice(0, 6).map((doc: any, idx: number) => {
              const docTitle = doc.title || query;
              const docAuthor = doc.author_name ? doc.author_name.join(', ') : 'Author';
              const docPublisher = doc.publisher ? doc.publisher[0] : 'Publisher';
              const docYear = doc.first_publish_year || new Date().getFullYear();
              const coverId = doc.cover_i;
              const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
              const isbn = doc.isbn ? doc.isbn[0] : '';

              return {
                id: `openlib-${doc.key?.replace(/\//g, '-') || idx}`,
                title: docTitle,
                author: docAuthor,
                publisher: docPublisher,
                publishYear: docYear,
                price: 18000,
                coverUrl,
                yes24Url: `https://www.yes24.com/Product/Search?domain=BOOK&query=${encodeURIComponent(isbn || docTitle)}`,
                category: '문학/소설',
                summary: `《${docTitle}》 by ${docAuthor} (${docPublisher}, ${docYear})`,
                isbn,
              };
            });
          }
        }
      } catch (olErr) {
        console.warn('OpenLibrary search fallback error:', olErr);
      }
    }

    return NextResponse.json({
      success: true,
      query,
      count: liveItems.length,
      items: liveItems,
    });
  } catch (error: any) {
    console.error('Book Search API Error:', error);
    return NextResponse.json({ success: false, error: error.message, items: [] }, { status: 500 });
  }
}
