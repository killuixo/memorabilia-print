import React, { useState, useRef, useEffect, useMemo } from 'react';

// CSS GLOBAL COM REGRAS DE IMPRESSÃO NATIVA E MASONRY LAYOUT
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

  :root {
      --pink: #FF007F;
      --cyan: #008B8B; /* Dark Cyan para melhor legibilidade no branco */
      --gold: #C5A059;
      --black: #222222;
      --gray: #666666;
      --light-gray: #F9F9F9;
      --white: #FFFFFF;
  }

  body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      background-color: #e0e0e0;
      margin: 0;
      padding: 0;
      color: var(--black);
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
  }

  /* ------------- INTERFACE DE USUÁRIO ------------- */
  .app-ui {
      max-width: 600px;
      margin: 10vh auto;
      background: var(--white);
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .app-ui h1 { font-weight: 300; font-size: 2em; margin-top: 0; color: var(--black); letter-spacing: -1px; }
  .app-ui p { color: var(--gray); line-height: 1.6; }

  .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      margin: 30px 0;
      background: var(--light-gray);
      transition: 0.2s;
  }
  
  .upload-area:hover { border-color: var(--cyan); background: #f0ffff; }

  button.primary-btn {
      background: var(--black); color: var(--white); border: none; border-radius: 6px;
      padding: 16px 30px; font-size: 1.1em; cursor: pointer; font-weight: bold; width: 100%; transition: 0.2s; text-transform: uppercase;
  }
  button.primary-btn:hover:not(:disabled) { background: var(--pink); }
  button.primary-btn:disabled { background: #d0d0d0; cursor: not-allowed; }

  /* ------------- VISUALIZADOR DE PDF ------------- */
  .preview-wrapper {
      padding: 40px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
  }

  .floating-bar {
      position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.85);
      padding: 15px 25px; border-radius: 50px; z-index: 1000;
      display: flex; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  
  .floating-bar button {
      background: white; color: black; border: none; padding: 10px 20px;
      border-radius: 20px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 0.8em;
  }
  .floating-bar button.print-btn { background: var(--cyan); color: white;}

  /* ------------- PÁGINA A4 ------------- */
  .pdf-page {
      width: 210mm;
      height: 297mm;
      background: var(--white);
      position: relative;
      padding: 20mm 15mm 20mm 15mm;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  }

  .page-header {
      position: absolute; top: 12mm; left: 15mm; right: 15mm;
      display: flex; justify-content: space-between; font-size: 0.7em; color: var(--gray);
      border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;
  }

  .page-footer {
      position: absolute; bottom: 12mm; left: 15mm; right: 15mm;
      display: flex; justify-content: flex-end; font-size: 0.7em; color: var(--gray);
      border-top: 1px solid #eee; padding-top: 5px;
  }

  /* ------------- CAPAS E FONTES VCR ------------- */
  .vcr-font { font-family: 'VT323', monospace; }
  
  .cover-page { 
      display: flex; flex-direction: column; justify-content: center; 
      height: 100%; padding-left: 15mm; position: relative; z-index: 10;
  }
  
  .cover-title { font-size: 1.6em; font-weight: 400; margin: 0 0 5px 0; color: var(--gray); letter-spacing: 1px;}
  
  .cover-owner { 
      font-size: 8em; 
      margin: 0; 
      line-height: 0.9;
      text-transform: uppercase;
      background: linear-gradient(135deg, var(--pink) 0%, var(--cyan) 50%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      -webkit-text-stroke: 2px var(--black);
      filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.15));
  }

  .cover-cat-title {
      font-size: 6.5em; 
      margin: 0; 
      line-height: 0.9;
      text-transform: uppercase;
      -webkit-text-stroke: 2px var(--black);
      color: currentColor; /* Inherits the random color set inline */
  }

  .cover-meta { font-size: 0.9em; color: var(--gray); margin-top: 30px; }

  .mondrian-decor { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
  .m-line-v { position: absolute; width: 4px; background: var(--black); top: 0; bottom: 0; }
  .m-line-h { position: absolute; height: 4px; background: var(--black); left: 0; right: 0; }
  .m-block { position: absolute; }

  /* ------------- GRID DE ITENS (MASONRY COLUMNS) ------------- */
  .catalog-grid {
      column-count: 2;
      column-gap: 15mm;
      height: 245mm;
  }

  .catalog-item {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 12mm;
      display: inline-block;
      width: 100%;
      position: relative;
      background: var(--white);
      padding: 12px 10px 12px 15px;
      border-left: 4px solid; /* Dinâmico */
      border-radius: 0 6px 6px 0;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.04);
      box-sizing: border-box;
  }

  .catalog-item.star-5 {
      border-left-width: 8px !important;
      border: 1px solid #eee;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border-radius: 6px 8px 8px 6px;
      background: linear-gradient(135deg, rgba(255,0,127,0.02) 0%, rgba(0,139,139,0.02) 50%, rgba(197,160,89,0.05) 100%);
  }

  /* ------------- TEXTOS DO ITEM ------------- */
  .item-code {
      position: absolute;
      top: -6px;
      right: 5px;
      font-size: 0.5em;
      color: var(--black);
      font-weight: 800;
      font-family: monospace;
      letter-spacing: 0.5px;
      background: white;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #eee;
  }

  .item-title { font-size: 1.15em; font-weight: 800; color: var(--black); line-height: 1.1; margin-bottom: 4px; padding-right: 20px;}
  .item-author { font-size: 0.9em; font-weight: 700; margin-bottom: 6px; line-height: 1.1; }

  /* Estrelas */
  .stars-container { margin-bottom: 10px; display: flex; gap: 2px; }
  .star { width: 14px; height: 14px; }
  .star-gradient { width: 24px; height: 24px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2)); margin-bottom: 4px; }

  /* ------------- FLOAT DE IMAGEM ------------- */
  .item-cover-box {
      float: left;
      width: 90px;
      height: 125px;
      background: #f4f4f4;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.08);
      margin-right: 15px;
      margin-bottom: 10px;
  }

  .item-cover-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }

  /* ------------- FICHA CATALOGRÁFICA ------------- */
  .catalog-ficha {
      font-size: 0.7em;
      display: flex;
      flex-direction: column;
      gap: 4px;
      clear: none;
  }

  .ficha-row {
      display: flex;
      flex-direction: row;
      gap: 6px;
      line-height: 1.3;
      align-items: baseline;
  }

  .ficha-label { font-weight: 700; color: #999; text-transform: uppercase; font-size: 0.85em; white-space: nowrap; }
  .ficha-value { font-weight: 600; color: var(--black); }

  .item-desc {
      margin-top: 10px; font-size: 0.75em; font-style: italic; color: var(--gray);
      display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* ------------- DASHBOARD ESTATÍSTICAS ------------- */
  .stats-header-bar {
      display: flex;
      justify-content: space-between;
      background: var(--black);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
  }
  .stat-box { text-align: center; }
  .stat-val { font-size: 1.5em; font-weight: 800; font-family: 'VT323', monospace; color: var(--gold); }
  .stat-lbl { font-size: 0.6em; text-transform: uppercase; letter-spacing: 1px; }

  .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      width: 100%;
  }

  .chart-card {
      background: var(--white);
      border: 2px solid var(--black);
      border-radius: 8px;
      padding: 15px;
      box-shadow: 4px 4px 0 var(--cyan);
  }

  .chart-card h3 {
      font-size: 0.8em;
      text-transform: uppercase;
      color: var(--black);
      margin-top: 0;
      margin-bottom: 15px;
      text-align: center;
      font-weight: 800;
  }

  .chart-container { height: 180px; width: 100%; }

  /* ------------- REGRAS DE IMPRESSÃO NATIVA ------------- */
  @media print {
      body { background-color: var(--white) !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0; }
      .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; page-break-after: always; }
  }
`;

// Hook: Bibliotecas Externas
const useExternalScripts = () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const load = (src) => new Promise((res, rej) => {
            if (document.querySelector(`script[src="${src}"]`)) return res();
            const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
        Promise.all([
            load('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'),
            load('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js')
        ]).then(() => setLoaded(true)).catch(e => console.error(e));
    }, []);
    return loaded;
};

// Ícones SVGs
const StarIcon = ({ filled, color }) => (
    <svg className="star" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "#ccc"} strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const HalfStarIcon = ({ color }) => (
    <svg className="star" viewBox="0 0 24 24" fill="url(#half)">
        <defs><linearGradient id="half"><stop offset="50%" stopColor={color}/><stop offset="50%" stopColor="transparent"/></linearGradient></defs>
        <path stroke={color} strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const GradientStarIcon = () => (
    <svg className="star-gradient" viewBox="0 0 24 24" stroke="none">
        <defs>
            <linearGradient id="grad-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--pink)" />
                <stop offset="50%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
        </defs>
        <path fill="url(#grad-star)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

// Helpers
const getCategoryInfo = (tipo) => {
    const t = (tipo || '').toLowerCase().trim();
    if (['livro', 'quadrinho', 'revista', 'hq', 'mangá', 'hqs'].includes(t)) return '1 LIVROS';
    if (['vinil', 'cd', 'fita cassete', 'k7', 'lp', 'disco'].includes(t)) return '2 DISCOS';
    if (['vhs', 'dvd', 'blu-ray', 'filme', 'video', 'vídeo'].includes(t)) return '3 VÍDEO';
    if (['mega drive', 'snes', 'wii', 'ps1', 'ps2', 'ps4', 'game', 'jogo', 'nintendo'].includes(t)) return '4 GAMES';
    return '5 OUTROS';
};

const getSortKey = (item) => {
    const autor = (item['Autor/Desenvolvedor'] || '').trim();
    if (autor && autor.toLowerCase() !== 'various') return autor;
    return (item['Título'] || '').trim();
};

const getDictLetter = (str) => {
    if (!str) return '?';
    const char = str.charAt(0).toUpperCase();
    if (/[0-9]/.test(char)) return '#';
    return char;
};

// Gera um Hash numérico baseado em String para manter consistência de cor no mesmo Autor
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

const StarRating = ({ nota }) => {
    if (nota === 5) return <div className="stars-container"><GradientStarIcon /></div>;
    
    let color = '#ccc'; // Estrela vazia (nota 0) tem contorno cinza via CSS
    if (nota >= 1 && nota < 3) color = 'var(--gold)';
    if (nota >= 3 && nota < 4) color = 'var(--cyan)';
    if (nota >= 4 && nota < 5) color = 'var(--pink)';

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (nota >= i) stars.push(<StarIcon key={i} filled={true} color={color} />);
        else if (nota >= i - 0.5) stars.push(<HalfStarIcon key={i} color={color} />);
        else stars.push(<StarIcon key={i} filled={false} color={color} />);
    }
    return <div className="stars-container">{stars}</div>;
};

// Componente Capa
const CoverPage = ({ title, isMain, ownerName, dateStr, colorIndex }) => {
    const colors = ['var(--cyan)', 'var(--pink)', 'var(--gold)'];
    const accent = colors[colorIndex % 3] || 'var(--black)';

    return (
        <div className="pdf-page">
            <div className="mondrian-decor">
                <div className="m-line-v" style={{ left: '25mm', backgroundColor: '#eaeaea' }}></div>
                <div className="m-line-h" style={{ bottom: '50mm', backgroundColor: '#eaeaea' }}></div>
                <div className="m-block" style={{ top: '0', right: '40mm', width: '30mm', height: '15mm', backgroundColor: 'var(--cyan)' }}></div>
                <div className="m-block" style={{ bottom: '25mm', left: '20mm', width: '10mm', height: '35mm', backgroundColor: 'var(--pink)' }}></div>
                <div className="m-block" style={{ top: '80mm', right: '0', width: '12mm', height: '60mm', backgroundColor: 'var(--gold)' }}></div>
            </div>

            <div className="cover-page">
                {isMain ? (
                    <>
                        <h2 className="cover-title">Coleção em Suporte Físico - Memorabilia</h2>
                        <h1 className="cover-owner vcr-font">{ownerName || 'Acervo'}</h1>
                        <div className="cover-meta">
                            <div>Gerado em {dateStr}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="cover-title" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>Categoria</h2>
                        <h1 className="cover-cat-title vcr-font" style={{ color: accent }}>{title}</h1>
                    </>
                )}
            </div>
        </div>
    );
};

// COMPONENTE DO ITEM (MASONRY & FLOAT)
const ItemCard = ({ item, cat }) => {
    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    let isStar5 = nota === 5;
    
    // Cor Baseada no Autor/Coleção
    const authorKey = getSortKey(item);
    const colors = ['var(--pink)', 'var(--cyan)', 'var(--gold)'];
    const colorIndex = hashString(authorKey) % 3;
    const authorColor = colors[colorIndex];

    const isLivro = cat === '1 LIVROS';
    const isDisco = cat === '2 DISCOS';
    const isVideo = cat === '3 VÍDEO';
    const isGame = cat === '4 GAMES';

    // Inteligência da Ficha
    let publisherLabel = ''; let publisherValue = '';
    let amountLabel = ''; let amountValue = '';

    if (isLivro) { publisherLabel = 'Editora'; publisherValue = item['Editora/Gravadora']; amountLabel = 'Páginas'; amountValue = item['Páginas/Tempo']; }
    else if (isDisco) { publisherLabel = 'Gravadora'; publisherValue = item['Editora/Gravadora']; amountLabel = 'Faixas'; amountValue = item['Páginas/Tempo']; }
    else if (isVideo) { publisherLabel = 'Produtora'; publisherValue = item['Editora/Gravadora']; amountLabel = 'Minutos'; amountValue = item['Páginas/Tempo']; }
    else if (isGame) { publisherLabel = 'Desenvolvedora'; publisherValue = item['Autor/Desenvolvedor']; amountLabel = 'Horas'; amountValue = item['Páginas/Tempo']; }

    // Status Inteligente
    let finalStatus = item['Status'] || 'Não Definido';
    if (isDisco || isVideo) {
        finalStatus = nota > 0 ? 'Concluído' : 'Não Iniciado';
    }

    return (
        <div className={`catalog-item ${isStar5 ? 'star-5' : ''}`} style={{ borderLeftColor: authorColor }}>
            
            {item['Código Arquivístico'] && (
                <div className="item-code">{item['Código Arquivístico']}</div>
            )}

            {/* Imagem Flutuante */}
            {item['URL da Capa'] && item['URL da Capa'].trim() !== '' && (
                <div className="item-cover-box">
                    <img src={item['URL da Capa']} alt="Capa" crossOrigin="anonymous" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.display = 'none'; }} />
                </div>
            )}

            {/* Texto que abraça a imagem */}
            <div className="item-title">{item['Título'] || 'Sem Título'}</div>
            
            {/* O Autor herda a cor da borda, mas o Título e o Codigo ficam pretos */}
            {item['Autor/Desenvolvedor'] && item['Autor/Desenvolvedor'].toLowerCase() !== 'various' && !isGame && (
                <div className="item-author" style={{ color: authorColor }}>{item['Autor/Desenvolvedor']}</div>
            )}

            <StarRating nota={nota} />

            <div className="catalog-ficha">
                {item['Ano'] && (
                    <div className="ficha-row"><span className="ficha-label">Ano:</span><span className="ficha-value">{item['Ano']}</span></div>
                )}
                {publisherValue && (
                    <div className="ficha-row"><span className="ficha-label">{publisherLabel}:</span><span className="ficha-value">{publisherValue}</span></div>
                )}
                {!isDisco && !isVideo && finalStatus && (
                    <div className="ficha-row"><span className="ficha-label">Status:</span><span className="ficha-value">{finalStatus}</span></div>
                )}
                {amountValue && (
                    <div className="ficha-row"><span className="ficha-label">{amountLabel}:</span><span className="ficha-value">{amountValue}</span></div>
                )}
            </div>

            {item['Descrição'] && <div className="item-desc">"{item['Descrição']}"</div>}
        </div>
    );
};

export default function App() {
    const scriptsLoaded = useExternalScripts();
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [viewMode, setViewMode] = useState('upload'); 
    
    const fileInputRef = useRef(null);
    const chartTypeRef = useRef(null);
    const chartRatingRef = useRef(null);
    const chartStatusRef = useRef(null);
    const chartPubRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && window.Papa) {
            setFileName(file.name);
            window.Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => setCsvData(results.data)
            });
        }
    };

    const pdfPages = useMemo(() => {
        if (!csvData.length) return [];
        
        const pages = [];
        let pageCounter = 1;
        const dateStr = new Date().toLocaleDateString('pt-BR');

        const grouped = {};
        csvData.forEach(item => {
            const cat = getCategoryInfo(item['Tipo']);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        const sortedCategories = Object.keys(grouped).sort();

        // 1. Capa Master
        pages.push(<CoverPage key="main-cover" isMain={true} ownerName={ownerName} dateStr={dateStr} />);

        // 2. Iterando Categorias
        sortedCategories.forEach((cat, catIndex) => {
            
            // Ordenação Primária: Autor > Edição/Ano
            grouped[cat].sort((a, b) => {
                const keyA = getSortKey(a);
                const keyB = getSortKey(b);
                const cmp = keyA.localeCompare(keyB, 'pt', { numeric: true, sensitivity: 'base' });
                if (cmp !== 0) return cmp;
                
                const anoA = parseInt(a['Ano']) || 0;
                const anoB = parseInt(b['Ano']) || 0;
                if (anoA !== anoB) return anoA - anoB;
                
                return (a['Título'] || '').localeCompare(b['Título'] || '', 'pt', {numeric: true});
            });
            
            const cleanCatName = cat.substring(2);
            pages.push(<CoverPage key={`cover-${cat}`} title={cleanCatName} isMain={false} colorIndex={catIndex} />);
            
            // Chunks de 8 para preencher perfeitamente a página sem vazamentos
            const itemsPerPage = 8; 
            for (let i = 0; i < grouped[cat].length; i += itemsPerPage) {
                const chunk = grouped[cat].slice(i, i + itemsPerPage);
                
                const firstKey = getSortKey(chunk[0]);
                const lastKey = getSortKey(chunk[chunk.length - 1]);
                
                const firstLetter = getDictLetter(firstKey);
                const lastLetter = getDictLetter(lastKey);
                const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                const currentPage = pageCounter;

                pages.push(
                    <div className="pdf-page" key={`page-${cat}-${currentPage}`}>
                        <div className="page-header">
                            <span>{cleanCatName}</span>
                            <span>{dictStr}</span>
                        </div>
                        
                        {/* Container CSS Column Count (Masonry) */}
                        <div className="catalog-grid">
                            {chunk.map((item, idx) => (
                                <ItemCard key={`item-${currentPage}-${idx}`} item={item} cat={cat} />
                            ))}
                        </div>
                        
                        <div className="page-footer">
                            <span>{currentPage}</span>
                        </div>
                    </div>
                );
                pageCounter++;
            }
        });

        // Contadores Estatísticos Totais
        let sumPages = 0; let sumTracks = 0; let sumMins = 0; let sumHours = 0;
        csvData.forEach(item => {
            const cat = getCategoryInfo(item['Tipo']);
            const amount = parseInt(item['Páginas/Tempo']) || 0;
            if (cat === '1 LIVROS') sumPages += amount;
            if (cat === '2 DISCOS') sumTracks += amount;
            if (cat === '3 VÍDEO') sumMins += amount;
            if (cat === '4 GAMES') sumHours += amount;
        });

        // 3. Página de Estatísticas
        pages.push(
            <div className="pdf-page" key="stats-page">
                <div className="page-header"><span>Estatísticas</span><span>Visão Geral</span></div>
                
                <h2 style={{ fontWeight: 300, fontSize: '2.5em', marginBottom: '20px', marginTop: '0', color: 'var(--black)' }}>Acervo em Números</h2>
                
                <div className="stats-header-bar">
                    <div className="stat-box"><div className="stat-val">{sumPages}</div><div className="stat-lbl">Páginas Lidas</div></div>
                    <div className="stat-box"><div className="stat-val">{sumTracks}</div><div className="stat-lbl">Faixas Musicais</div></div>
                    <div className="stat-box"><div className="stat-val">{sumMins}</div><div className="stat-lbl">Minutos de Filme</div></div>
                    <div className="stat-box"><div className="stat-val">{sumHours}</div><div className="stat-lbl">Horas de Jogo</div></div>
                </div>

                <div className="stats-grid">
                    <div className="chart-card">
                        <h3>Acervo por Suporte</h3>
                        <div className="chart-container"><canvas ref={chartTypeRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Progresso de Consumo</h3>
                        <div className="chart-container"><canvas ref={chartStatusRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Distribuição de Notas</h3>
                        <div className="chart-container"><canvas ref={chartRatingRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Top Editoras / Gravadoras</h3>
                        <div className="chart-container"><canvas ref={chartPubRef}></canvas></div>
                    </div>
                </div>

                <div className="page-footer"><span>{pageCounter}</span></div>
            </div>
        );

        return pages;
    }, [csvData, ownerName]);

    // Lógica para os Gráficos
    useEffect(() => {
        const instances = [];

        if (viewMode === 'preview' && chartTypeRef.current && window.Chart && csvData.length > 0) {
            window.Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
            window.Chart.defaults.color = "#222";

            const catCount = {};
            let statusConcluido = 0; let statusNaoIniciado = 0;
            const ratingCount = { 'Nota 5': 0, 'Nota 4': 0, 'Nota 3': 0, 'Nota 2': 0, 'Nota 1': 0 };
            const pubCount = {};

            csvData.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']);
                const cleanCat = cat.substring(2);
                catCount[cleanCat] = (catCount[cleanCat] || 0) + 1;
                
                let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
                if (isNaN(nota)) nota = 0;

                // Status Logic
                if (cat === '2 DISCOS' || cat === '3 VÍDEO') {
                    if (nota > 0) statusConcluido++;
                    else statusNaoIniciado++;
                } else {
                    const st = (item['Status'] || '').toLowerCase();
                    if (st === 'concluído') statusConcluido++;
                    else statusNaoIniciado++;
                }

                // Ratings (Excludes 0)
                if (nota === 5) ratingCount['Nota 5']++;
                else if (nota >= 4) ratingCount['Nota 4']++;
                else if (nota >= 3) ratingCount['Nota 3']++;
                else if (nota >= 2) ratingCount['Nota 2']++;
                else if (nota >= 1) ratingCount['Nota 1']++;

                // Publishers
                let pub = item['Editora/Gravadora'];
                if (cat === '4 GAMES') pub = item['Autor/Desenvolvedor'];
                if (pub && pub.trim() !== '') {
                    pubCount[pub] = (pubCount[pub] || 0) + 1;
                }
            });

            const sortedPubs = Object.entries(pubCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const palette = ['#FF007F', '#008B8B', '#C5A059', '#222222', '#FFFFFF'];

            instances.push(new window.Chart(chartTypeRef.current, {
                type: 'doughnut',
                data: { labels: Object.keys(catCount), datasets: [{ data: Object.values(catCount), backgroundColor: palette, borderWidth: 2, borderColor: '#222' }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            }));

            instances.push(new window.Chart(chartStatusRef.current, {
                type: 'pie',
                data: { labels: ['Concluídos', 'Na Fila'], datasets: [{ data: [statusConcluido, statusNaoIniciado], backgroundColor: ['#008B8B', '#FF007F'], borderWidth: 2, borderColor: '#222' }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            }));

            instances.push(new window.Chart(chartRatingRef.current, {
                type: 'bar',
                data: { labels: Object.keys(ratingCount), datasets: [{ label: 'Itens', data: Object.values(ratingCount), backgroundColor: '#C5A059', borderColor: '#222', borderWidth: 2 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartPubRef.current, {
                type: 'bar',
                data: { labels: sortedPubs.map(a => a[0].length > 12 ? a[0].substring(0, 12) + '...' : a[0]), datasets: [{ label: 'Obras', data: sortedPubs.map(a => a[1]), backgroundColor: '#FFFFFF', borderColor: '#222', borderWidth: 2 }] },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));
        }

        return () => { instances.forEach(instance => instance.destroy()); };
    }, [viewMode, csvData]);

    const handlePrint = () => { window.print(); };

    if (!scriptsLoaded) return <div style={{ padding: 40, textAlign: 'center' }}>Iniciando o sistema...</div>;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

            {viewMode === 'upload' && (
                <div className="app-ui no-print">
                    <h1>Catálogo Tipográfico</h1>
                    <p>Importe sua coleção em formato CSV. Devido ao tamanho da sua coleção, utilizaremos o gerador de PDF nativo do navegador para máxima qualidade.</p>
                    
                    <input type="file" ref={fileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                    
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <h3 style={{ fontWeight: 400, color: '#333' }}>{fileName ? fileName : 'Selecione sua planilha .csv'}</h3>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label htmlFor="owner-name" style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Dono da Coleção</label>
                        <input type="text" id="owner-name" placeholder="Nome na capa..." value={ownerName} onChange={(e) => setOwnerName(e.target.value)} style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', outline: 'none', fontSize: '1.1em', fontFamily: 'inherit' }} />
                    </div>

                    <button className="primary-btn" onClick={() => setViewMode('preview')} disabled={csvData.length === 0}>
                        {csvData.length === 0 ? 'Aguardando Arquivo...' : 'Gerar e Visualizar Catálogo'}
                    </button>
                </div>
            )}

            {viewMode === 'preview' && (
                <div className="preview-wrapper">
                    <div className="floating-bar no-print">
                        <button onClick={() => setViewMode('upload')}>← Voltar</button>
                        <button className="print-btn" onClick={handlePrint}>Salvar PDF / Imprimir</button>
                    </div>
                    {pdfPages}
                </div>
            )}
        </>
    );
}
