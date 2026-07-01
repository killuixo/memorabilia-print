import React, { useState, useRef, useEffect, useMemo } from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, color: '#FF007F', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2>Erro Crítico ao Processar o Catálogo</h2>
                    <p>Ocorreu uma falha ao renderizar. Verifique se o CSV está correto.</p>
                    <code style={{ background: '#eee', padding: 10, display: 'block', borderRadius: 5 }}>
                        {this.state.errorInfo?.message || String(this.state.errorInfo)}
                    </code>
                    <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>Recarregar</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=VT323&display=swap');

  :root {
      --pink: #FF007F;
      --cyan: #008B8B;
      --gold: #C5A059;
      --black: #222222;
      --gray: #777777;
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

  /* ------------- INTERFACE MONDRIAN (BRUTALISTA) ------------- */
  .app-ui {
      max-width: 600px; margin: 10vh auto; background: var(--white);
      padding: 40px; border: 6px solid var(--black);
      position: relative;
  }
  
  .ui-decor-1 { position: absolute; top: -10px; left: -10px; width: 30px; height: 30px; background: var(--pink); border: 4px solid var(--black); z-index: -1; }
  .ui-decor-2 { position: absolute; bottom: -15px; right: -15px; width: 50px; height: 30px; background: var(--gold); border: 4px solid var(--black); z-index: -1; }

  .app-ui h1 { font-family: 'VT323', monospace; font-weight: 800; font-size: 3.5em; margin-top: 0; text-transform: uppercase; border-bottom: 6px solid var(--black); padding-bottom: 10px; line-height: 1;}
  .app-ui p { color: var(--black); font-weight: 600; line-height: 1.6; }

  .upload-area {
      border: 4px dashed var(--black); padding: 40px; text-align: center;
      cursor: pointer; margin: 30px 0; background: var(--white); transition: 0.2s;
  }
  .upload-area:hover { background: rgba(0, 139, 139, 0.1); border-style: solid; }

  .app-ui input[type="text"] {
      width: 100%; padding: 15px; border: 4px solid var(--black); background: var(--light-gray); outline: none; 
      font-size: 1.5em; font-family: 'VT323', monospace; text-transform: uppercase; font-weight: bold; box-sizing: border-box;
  }
  .app-ui input[type="text"]:focus { background: var(--white); border-color: var(--pink); }

  button.primary-btn {
      background: var(--black); color: var(--white); border: 4px solid var(--black); 
      padding: 16px 30px; font-size: 1.5em; cursor: pointer; font-weight: 800; width: 100%; 
      transition: 0.2s; text-transform: uppercase; font-family: 'VT323', monospace;
  }
  button.primary-btn:hover:not(:disabled) { 
      background: var(--pink); 
      transform: translate(-5px, -5px);
  }
  button.primary-btn:disabled { background: #d0d0d0; border-color: #999; cursor: not-allowed; }

  /* ------------- VISUALIZADOR ------------- */
  .preview-wrapper { padding: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 30px; }
  
  .floating-bar {
      position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8);
      padding: 15px 25px; border-radius: 50px; z-index: 1000;
      display: flex; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  .floating-bar button { background: white; color: black; border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }
  .floating-bar button.print-btn { background: var(--cyan); color: white;}

  /* ------------- PÁGINA A4 ------------- */
  .pdf-page {
      width: 210mm; height: 297mm; background: var(--white); position: relative;
      padding: 20mm 15mm 20mm 15mm; box-sizing: border-box; overflow: hidden;
      page-break-after: always; box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  }

  .page-header {
      position: absolute; top: 12mm; left: 15mm; right: 15mm;
      display: flex; justify-content: space-between; font-size: 0.7em; color: var(--gray);
      border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;
  }

  .page-footer {
      position: absolute; bottom: 12mm; left: 15mm; right: 15mm;
      display: flex; justify-content: space-between; font-size: 0.7em; color: var(--gray);
      border-top: 1px solid #eee; padding-top: 5px;
  }

  /* ------------- CAPAS E FONTES RETRÔ ------------- */
  .vcr-font { font-family: 'VT323', monospace; }
  
  .cover-page { 
      display: flex; flex-direction: column; justify-content: center; 
      height: 100%; padding-left: 15mm; position: relative; z-index: 10;
  }
  
  .category-title { 
      font-size: 6.5em; margin: 0; line-height: 1; letter-spacing: 2px; text-transform: uppercase;
      -webkit-text-stroke: 3px currentColor;
  }

  .mondrian-decor { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
  .m-line-v { position: absolute; width: 4px; background: var(--black); top: 0; bottom: 0; }
  .m-line-h { position: absolute; height: 4px; background: var(--black); left: 0; right: 0; }
  .m-block { position: absolute; }

  /* ------------- GRELHA LINHA POR LINHA (MÁXIMA COMPRESSÃO) ------------- */
  .catalog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 12mm;
      row-gap: 7.5mm;
      align-items: start; 
  }

  .catalog-item {
      display: flow-root; 
      padding: 10px 10px 10px 15px;
      border-left: 4px solid; 
      background: var(--white);
      border-radius: 0 6px 6px 0;
      box-sizing: border-box;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.05); 
  }

  .catalog-item.star-5 {
      border-left-width: 8px !important;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 15px 35px rgba(0,0,0,0.25); 
      border-radius: 4px 8px 8px 4px;
      padding-left: 12px;
  }

  .item-code {
      float: right; font-size: 0.55em; color: var(--black); font-weight: 800; font-family: monospace; margin-left: 8px;
  }

  .item-cover-box {
      float: left; width: 70px; height: 100px; margin-right: 12px; margin-bottom: 6px;
      background: #f4f4f4; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  }

  .item-cover-box img { width: 100%; height: 100%; object-fit: cover; }

  .item-title { font-size: 1.05em; font-weight: 800; color: var(--black); line-height: 1.1; margin-bottom: 4px; }
  .item-author { font-size: 0.9em; font-weight: 700; line-height: 1.2; margin-bottom: 6px; }
  
  .stars-container { margin-bottom: 6px; display: flex; gap: 2px; align-items: center; }
  .star { width: 13px; height: 13px; }
  .star-giant { width: 32px; height: 32px; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3)); margin-bottom: 4px; }

  /* ------------- FICHA CATALOGRÁFICA ------------- */
  .catalog-ficha { font-size: 0.65em; display: flex; flex-direction: column; gap: 3px; margin-top: 4px; clear: none; }
  .ficha-row { display: flex; flex-direction: row; gap: 4px; line-height: 1.3; }
  .ficha-label { font-weight: 600; color: var(--gray); text-transform: uppercase; white-space: nowrap; font-size: 0.9em;}
  .ficha-value { font-weight: 700; color: var(--black); word-break: break-word; }

  /* ------------- ESTATÍSTICAS ------------- */
  .stats-header-bar {
      display: flex; justify-content: space-between; background: var(--black); color: white;
      padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;
  }
  .stat-block { text-align: center; width: 25%; }
  .stat-num { font-size: 1.8em; font-weight: 800; color: var(--gold); line-height: 1; margin-bottom: 3px; font-family: 'VT323', monospace; text-shadow: 2px 2px 0 #000;}
  .stat-sub { font-size: 0.6em; color: var(--cyan); font-weight: bold; display: block; margin-bottom: 2px;}
  .stat-lbl { font-size: 0.55em; text-transform: uppercase; letter-spacing: 1px; color: #ccc;}

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
  .chart-card { background: var(--white); border: 2px solid #eee; border-radius: 8px; padding: 10px; }
  .chart-card h3 { font-size: 0.75em; text-transform: uppercase; color: var(--black); margin-top: 0; margin-bottom: 8px; text-align: center; font-weight: 800; }
  .chart-container { width: 100%; }

  @media print {
      body, html { background-color: var(--white) !important; margin: 0; padding: 0; height: auto !important; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0; }
      .preview-wrapper { display: block !important; padding: 0 !important; gap: 0 !important; }
      .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; page-break-after: always !important; page-break-inside: avoid !important; }
  }
`;

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

const StarIcon = ({ filled, color }) => (
    <svg className="star" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "#aaa"} strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const GiantStarIcon = () => (
    <svg className="star-giant" viewBox="0 0 24 24" stroke="none">
        <defs>
            <linearGradient id="grad-giant" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--pink)" />
                <stop offset="50%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
        </defs>
        <path fill="url(#grad-giant)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const safeString = (val) => (val === null || val === undefined) ? '' : String(val);

const getCategoryInfo = (tipo) => {
    const t = safeString(tipo).toLowerCase().trim();
    if (['livro', 'quadrinho', 'revista', 'hq', 'mangá', 'hqs'].includes(t)) return '1 LIVROS';
    if (['vinil', 'cd', 'fita cassete', 'k7', 'lp', 'disco'].includes(t)) return '2 DISCOS';
    if (['vhs', 'dvd', 'blu-ray', 'filme', 'video', 'vídeo'].includes(t)) return '3 VÍDEO';
    if (['mega drive', 'snes', 'wii', 'ps1', 'ps2', 'ps4', 'game', 'jogo', 'nintendo'].includes(t)) return '4 GAMES';
    return '5 OUTROS';
};

const getSortKey = (item) => {
    if (!item) return '';
    const autor = safeString(item['Autor/Desenvolvedor']).trim();
    if (autor && autor.toLowerCase() !== 'various') return autor;
    return safeString(item['Título']).trim();
};

// Estimativa extremamente precisa (em mm) para maximizar o número de itens
const estimateItemHeight = (item) => {
    let nota = parseFloat(safeString(item['Nota']).replace(',', '.'));
    let h = 12; // Base padding + borders otimizados

    let titleLen = safeString(item['Título']).length;
    h += Math.ceil(titleLen / 28) * 4.5; // Estimativa de quebras de linha

    let autor = safeString(item['Autor/Desenvolvedor']).trim();
    if (autor && autor.toLowerCase() !== 'various') h += 4.5;

    h += 5.5; // Estrelas

    let rows = 0;
    if (item['Tipo']) rows++;
    if (item['Ano']) rows++;
    if (item['Editora/Gravadora'] || item['Produtora'] || item['Desenvolvedora']) rows++;
    
    const cat = getCategoryInfo(item['Tipo']).substring(2);
    if (item['Status'] && cat !== 'DISCOS' && cat !== 'VÍDEO') rows++;
    
    if (item['Páginas/Tempo'] || item['Faixas'] || item['Minutos'] || item['Horas']) rows++;
    h += rows * 4; // Altura rigorosa da Ficha

    let hasCover = safeString(item['URL da Capa']).trim() !== '';
    if (hasCover) h = Math.max(h, 28); 
    if (nota === 5) h += 12; // Star 5 grande

    return h; 
};

const StarRating = ({ notaStr }) => {
    let n = parseFloat(safeString(notaStr).replace(',', '.'));
    if (isNaN(n)) n = 0;

    if (n === 5) return <div className="stars-container"><GiantStarIcon /></div>;
    
    let color = '#aaa';
    if (n > 0 && n <= 2.9) { color = 'var(--gold)'; }
    else if (n >= 3 && n <= 3.9) { color = 'var(--cyan)'; }
    else if (n >= 4) { color = 'var(--pink)'; }

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (n === 0) {
            stars.push(<StarIcon key={i} filled={false} color="#aaa" />);
        } else {
            stars.push(<StarIcon key={i} filled={i <= Math.ceil(n)} color={i <= Math.ceil(n) ? color : '#ddd'} />);
        }
    }
    return <div className="stars-container">{stars}</div>;
};

const CoverPage = ({ title, isMain, ownerName, dateStr, colorIndex }) => {
    const palette = ['var(--pink)', 'var(--cyan)', 'var(--gold)', 'var(--black)'];
    const accent = palette[colorIndex % 3];

    return (
        <div className="pdf-page">
            <div className="mondrian-decor">
                <div className="m-line-v" style={{ left: '20mm', backgroundColor: '#e5e5e5' }}></div>
                <div className="m-line-h" style={{ bottom: '40mm', backgroundColor: '#e5e5e5' }}></div>
                <div className="m-block" style={{ top: '0', right: '30mm', width: '20mm', height: '10mm', backgroundColor: 'var(--cyan)' }}></div>
                <div className="m-block" style={{ bottom: '15mm', left: '15mm', width: '5mm', height: '25mm', backgroundColor: 'var(--pink)' }}></div>
                <div className="m-block" style={{ top: '60mm', right: '0', width: '8mm', height: '40mm', backgroundColor: 'var(--gold)' }}></div>
            </div>

            <div className="cover-page">
                {isMain ? (
                    <>
                        <h2 style={{ fontSize: '1.1em', fontWeight: 600, margin: '0 0 5px 0', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Coleção em Suporte Físico - Memorabilia
                        </h2>
                        <h1 className="cover-owner vcr-font" style={{ fontSize: '11em', margin: 0, lineHeight: 0.85, textTransform: 'uppercase' }}>
                            {ownerName || 'Acervo'}
                        </h1>
                        <div className="cover-meta">
                            <div style={{ fontSize: '0.9em', marginTop: '15px', color: 'var(--gray)', fontWeight: 'bold' }}>Gerado a {dateStr}</div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Removido o subtítulo "Categoria" */}
                        <h1 className="category-title vcr-font" style={{ color: accent }}>{title}</h1>
                    </>
                )}
            </div>
        </div>
    );
};

const ItemCard = ({ item, accentColor }) => {
    let nota = parseFloat(safeString(item['Nota']).replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    
    let isStar5 = nota === 5;
    const catInfo = getCategoryInfo(item['Tipo']);
    const cat = catInfo ? catInfo.substring(2) : 'OUTROS';

    const publisher = safeString(item['Editora/Gravadora'] || item['Produtora'] || item['Desenvolvedora']);
    const timeVal = safeString(item['Páginas/Tempo'] || item['Faixas'] || item['Minutos'] || item['Horas']);
    const autor = safeString(item['Autor/Desenvolvedor']).trim();

    let stat = safeString(item['Status']);
    if (cat === 'DISCOS' || cat === 'VÍDEO') {
        stat = null; // Omitido visualmente, como pedido
    }

    let pLabel = 'EDITORA/GRAVADORA';
    let tLabel = 'PÁGINAS/TEMPO';

    if(cat === 'LIVROS') { pLabel = 'Editora'; tLabel = 'Páginas'; }
    if(cat === 'DISCOS') { pLabel = 'Gravadora'; tLabel = 'Faixas'; }
    if(cat === 'GAMES') { pLabel = 'Desenv.'; tLabel = 'Horas'; }
    if(cat === 'VÍDEO') { pLabel = 'Produtora'; tLabel = 'Horas'; }

    const urlCapa = safeString(item['URL da Capa']).trim();
    const codArq = safeString(item['Código Arquivístico']);
    const titulo = safeString(item['Título']) || 'Sem Título';
    const tipo = safeString(item['Tipo']);
    const ano = safeString(item['Ano']);

    return (
        <div className={`catalog-item ${isStar5 ? 'star-5' : ''}`} style={{ borderLeftColor: accentColor }}>
            {urlCapa !== '' && (
                <div className="item-cover-box">
                    <img src={urlCapa} alt="Capa" crossOrigin="anonymous" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.display = 'none'; }} />
                </div>
            )}
            {codArq && <div className="item-code">{codArq}</div>}
            <div className="item-title">{titulo}</div>
            {autor && autor.toLowerCase() !== 'various' && cat !== 'GAMES' && (
                <div className="item-author" style={{ color: accentColor }}>{autor}</div>
            )}
            <StarRating notaStr={safeString(item['Nota'])} />
            <div className="catalog-ficha">
                {tipo && <div className="ficha-row"><span className="ficha-label">Tipo:</span><span className="ficha-value">{tipo}</span></div>}
                {ano && <div className="ficha-row"><span className="ficha-label">Ano:</span><span className="ficha-value">{ano}</span></div>}
                {publisher && <div className="ficha-row"><span className="ficha-label">{pLabel}:</span><span className="ficha-value">{publisher}</span></div>}
                {stat && <div className="ficha-row"><span className="ficha-label">Status:</span><span className="ficha-value">{stat}</span></div>}
                {timeVal && <div className="ficha-row"><span className="ficha-label">{tLabel}:</span><span className="ficha-value">{timeVal}</span></div>}
            </div>
        </div>
    );
};

export default function App() {
    const scriptsLoaded = useExternalScripts();
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [viewMode, setViewMode] = useState('upload'); 
    const [uiColor, setUiColor] = useState('var(--cyan)');
    
    const fileInputRef = useRef(null);
    
    // Referências dos Gráficos
    const chartTypeRef = useRef(null);
    const chartStatusRef = useRef(null);
    const chartRatingRef = useRef(null);
    const chartDecadeRef = useRef(null); 
    const chartAuthorRef = useRef(null);
    const chartPubRef = useRef(null); 

    useEffect(() => {
        const colors = ['var(--cyan)', 'var(--pink)', 'var(--gold)'];
        setUiColor(colors[Math.floor(Math.random() * colors.length)]);
    }, [viewMode]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && window.Papa) {
            setFileName(file.name);
            window.Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const validData = results.data.filter(row => safeString(row['Título']).trim() !== '' || safeString(row['Tipo']).trim() !== '');
                    setCsvData(validData);
                }
            });
        }
    };

    const aggregates = useMemo(() => {
        let metrics = { pTot: 0, pLid: 0, fTot: 0, fOuv: 0, mTot: 0, mAss: 0, hTot: 0, hJog: 0 };
        
        csvData.forEach(item => {
            const catInfo = getCategoryInfo(item['Tipo']);
            const cat = catInfo ? catInfo.substring(2) : '';
            const rawVal = safeString(item['Páginas/Tempo'] || item['Faixas'] || item['Minutos'] || item['Horas']);
            const val = parseInt(rawVal.replace(/\D/g, '') || '0', 10);
            let nota = parseFloat(safeString(item['Nota']).replace(',', '.'));
            if(isNaN(nota)) nota = 0;
            let status = safeString(item['Status']);
            
            let isDone = (status === 'Concluído' || nota > 0);

            if (!isNaN(val)) {
                if (cat === 'LIVROS') { metrics.pTot += val; if (isDone) metrics.pLid += val; }
                if (cat === 'DISCOS') { metrics.fTot += val; if (isDone) metrics.fOuv += val; }
                if (cat === 'VÍDEO')  { metrics.mTot += val; if (isDone) metrics.mAss += val; }
                if (cat === 'GAMES')  { metrics.hTot += val; if (isDone) metrics.hJog += val; }
            }
        });
        
        const calcPct = (read, tot) => tot > 0 ? Math.round((read/tot)*100) : 0;
        
        return {
            ...metrics,
            pPct: calcPct(metrics.pLid, metrics.pTot),
            fPct: calcPct(metrics.fOuv, metrics.fTot),
            mPct: calcPct(metrics.mAss, metrics.mTot),
            hPct: calcPct(metrics.hJog, metrics.hTot)
        };
    }, [csvData]);

    const pdfPages = useMemo(() => {
        if (!csvData.length) return [];
        
        const contentPages = [];
        let logicalPage = 1; // Contador estrito de páginas de catálogo
        const dateStr = new Date().toLocaleDateString('pt-PT');

        const grouped = {};
        csvData.forEach(item => {
            const catInfo = getCategoryInfo(item['Tipo']);
            const cat = catInfo ? catInfo : '5 OUTROS';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        const sortedCategories = Object.keys(grouped).sort();
        const colorPalette = ['var(--pink)', 'var(--cyan)', 'var(--gold)'];

        let globalPrevColor = -1;
        const authorColorMap = {};
        const tocData = [];

        // Pré-processamento e Lógica Anti-Colisão
        sortedCategories.forEach(cat => {
            grouped[cat].sort((a, b) => {
                const keyA = getSortKey(a);
                const keyB = getSortKey(b);
                return keyA.localeCompare(keyB, 'pt', { numeric: true, sensitivity: 'base' });
            });

            grouped[cat].forEach(item => {
                let authorKey = getSortKey(item);
                if (authorColorMap[authorKey] === undefined) {
                    let available = [0, 1, 2].filter(c => c !== globalPrevColor);
                    let nextColor = available[Math.floor(Math.random() * available.length)];
                    authorColorMap[authorKey] = nextColor;
                    globalPrevColor = nextColor;
                }
            });
        });

        // Loop de Renderização das Páginas (Usando o logicalPage)
        sortedCategories.forEach((cat, catIndex) => {
            const cleanCatName = cat.substring(2);
            const items = grouped[cat];
            
            const formatItemStr = (item) => {
                if (!item) return '';
                const title = safeString(item['Título']) || 'Sem Título';
                const author = safeString(item['Autor/Desenvolvedor']).trim();
                if (author && author.toLowerCase() !== 'various' && getCategoryInfo(item['Tipo']) !== '4 GAMES') {
                    return `${author} - ${title}`;
                }
                return title;
            };

            // Regista a página real onde a categoria começa
            tocData.push({
                category: cleanCatName,
                startPage: logicalPage,
                count: items.length,
                firstStr: formatItemStr(items[0]),
                lastStr: formatItemStr(items[items.length - 1])
            });

            // Folha de Rosto (Conta a página, mas NÃO EXIBE o rodapé)
            contentPages.push(
                <CoverPage key={`cover-${cat}`} title={cleanCatName} isMain={false} colorIndex={catIndex + 1} />
            );
            logicalPage++; 
            
            let allItemsToProcess = [...grouped[cat]];
            const MAX_HEIGHT_MM = 248; // Compressão extrema para o limite inferior da folha A4
            const ROW_GAP = 7.5;

            while (allItemsToProcess.length > 0) {
                let currentPageItems = [];
                let currentHeight = 0;

                while (allItemsToProcess.length > 0) {
                    let i1 = allItemsToProcess[0];
                    let i2 = allItemsToProcess[1]; 

                    let h1 = estimateItemHeight(i1);
                    let h2 = i2 ? estimateItemHeight(i2) : 0;
                    let rowHeight = Math.max(h1, h2) + ROW_GAP;

                    // Trava de segurança - quebra página imediatamente antes de invadir o rodapé
                    if (currentHeight + rowHeight > MAX_HEIGHT_MM && currentPageItems.length > 0) {
                        break;
                    }

                    currentPageItems.push(allItemsToProcess.shift());
                    if (i2) currentPageItems.push(allItemsToProcess.shift());
                    currentHeight += rowHeight;
                }

                if (currentPageItems.length > 0) {
                    const currentPageNumber = logicalPage; // Congela o número da página atual
                    
                    let firstItem = currentPageItems[0];
                    let lastItem = currentPageItems[currentPageItems.length-1];
                    const getDictLetter = (str) => {
                        if (!str) return '?';
                        const char = str.charAt(0).toUpperCase();
                        return /[0-9]/.test(char) ? '#' : char;
                    };
                    const firstLetter = getDictLetter(getSortKey(firstItem));
                    const lastLetter = getDictLetter(getSortKey(lastItem));
                    const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;

                    contentPages.push(
                        <div className="pdf-page" key={`page-${cat}-${currentPageNumber}`}>
                            <div className="page-header">
                                <span className="vcr-font">{cleanCatName}</span>
                                <span>{dictStr}</span>
                            </div>
                            
                            <div className="catalog-grid">
                                {currentPageItems.map((item, idx) => {
                                    const authKey = getSortKey(item);
                                    const itemColor = colorPalette[authorColorMap[authKey]];
                                    return <ItemCard key={`item-${currentPageNumber}-${idx}`} item={item} accentColor={itemColor} />;
                                })}
                            </div>
                            
                            {/* O Número da página É EXIBIDO aqui */}
                            <div className="page-footer"><span></span><span>{currentPageNumber}</span></div>
                        </div>
                    );
                    logicalPage++;
                }
            }
        });

        // Páginas de Estatísticas (também recebem numeração lógica)
        contentPages.push(
            <div className="pdf-page" key="stats-page-1">
                <div className="page-header"><span className="vcr-font">Estatísticas 1/2</span><span>Visão Geral</span></div>
                <h2 style={{ fontWeight: 300, fontSize: '2em', marginBottom: '15px', marginTop: '5px' }}>Visão Geral do Acervo</h2>
                <div className="stats-header-bar">
                    <div className="stat-block">
                        <div className="stat-num">{aggregates.pTot}</div>
                        <span className="stat-sub">{aggregates.pPct}% Lidas</span>
                        <div className="stat-lbl">Páginas Totais</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-num">{aggregates.fTot}</div>
                        <span className="stat-sub">{aggregates.fPct}% Ouvidas</span>
                        <div className="stat-lbl">Faixas Totais</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-num">{aggregates.mTot}</div>
                        <span className="stat-sub">{aggregates.mPct}% Assist.</span>
                        <div className="stat-lbl">Minutos de Vídeo</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-num">{aggregates.hTot}</div>
                        <span className="stat-sub">{aggregates.hPct}% Jogadas</span>
                        <div className="stat-lbl">Horas de Game</div>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="chart-card"><h3>Divisão por Suporte</h3><div className="chart-container" style={{height:'160px'}}><canvas ref={chartTypeRef}></canvas></div></div>
                    <div className="chart-card"><h3>Status de Consumo</h3><div className="chart-container" style={{height:'160px'}}><canvas ref={chartStatusRef}></canvas></div></div>
                    <div className="chart-card"><h3>Distribuição de Notas</h3><div className="chart-container" style={{height:'160px'}}><canvas ref={chartRatingRef}></canvas></div></div>
                    
                    {/* Gráfico Ano a Ano Duplicado de Tamanho */}
                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                        <h3>Lançamento Ano a Ano</h3>
                        <div className="chart-container" style={{ height: '350px' }}><canvas ref={chartDecadeRef}></canvas></div>
                    </div>
                </div>
                <div className="page-footer"><span></span><span>{logicalPage}</span></div>
            </div>
        );
        logicalPage++;

        contentPages.push(
            <div className="pdf-page" key="stats-page-2">
                <div className="page-header"><span className="vcr-font">Estatísticas 2/2</span><span>Os Maiores</span></div>
                <h2 style={{ fontWeight: 300, fontSize: '2em', marginBottom: '15px', marginTop: '5px' }}>Top Autores e Produtoras</h2>
                <div className="stats-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                    {/* Gráficos Top 10 Expandidos */}
                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                        <h3>Top 10 Autores/Desenvolvedoras</h3>
                        <div className="chart-container" style={{ height: '350px' }}><canvas ref={chartAuthorRef}></canvas></div>
                    </div>
                    <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                        <h3>Top 10 Editoras/Gravadoras/Produtoras</h3>
                        <div className="chart-container" style={{ height: '350px' }}><canvas ref={chartPubRef}></canvas></div>
                    </div>
                </div>
                <div className="page-footer"><span></span><span>{logicalPage}</span></div>
            </div>
        );

        // -----------------------------------------------------------
        // Montagem Final do Documento: Capa -> Sumário -> Restante
        // -----------------------------------------------------------
        const finalRender = [];
        
        // Capa Principal (Sem número)
        finalRender.push(<CoverPage key="main-cover" isMain={true} ownerName={ownerName} dateStr={dateStr} colorIndex={0} />);
        
        // Sumário (Sem número no footer)
        finalRender.push(
            <div className="pdf-page" key="toc-page">
                <div className="mondrian-decor">
                    <div className="m-line-v" style={{ left: '15mm', backgroundColor: '#e5e5e5' }}></div>
                    <div className="m-line-h" style={{ top: '30mm', backgroundColor: '#e5e5e5' }}></div>
                    <div className="m-block" style={{ top: '15mm', left: '15mm', width: '10mm', height: '15mm', backgroundColor: 'var(--pink)' }}></div>
                </div>
                <div className="cover-page" style={{ justifyContent: 'flex-start', paddingTop: '15mm', paddingRight: '15mm' }}>
                    <h1 className="vcr-font" style={{ fontSize: '5em', margin: '0 0 30px 0', textTransform: 'uppercase', letterSpacing: '2px', WebkitTextStroke: '2px var(--black)', color: 'var(--white)', borderBottom: '4px solid var(--black)', paddingBottom: '10px' }}>SUMÁRIO</h1>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {tocData.map((data, index) => {
                            const accent = colorPalette[index % 3];
                            return (
                                <div key={index} style={{ 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    border: '4px solid var(--black)', borderLeftWidth: '12px', borderLeftColor: accent,
                                    padding: '20px 30px', background: 'var(--white)',
                                    boxShadow: '6px 6px 0px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: '75%' }}>
                                        <h3 className="vcr-font" style={{ fontSize: '2.5em', margin: 0, textTransform: 'uppercase', color: 'var(--black)' }}>{data.category}</h3>
                                        <div style={{ fontSize: '0.85em', color: 'var(--black)', fontWeight: 800, marginTop: '10px', textTransform: 'uppercase' }}>
                                            QUANTIDADE: <span style={{ color: 'var(--gray)', fontWeight: 600 }}>{data.count} ITENS</span>
                                        </div>
                                        <div style={{ fontSize: '0.8em', color: 'var(--gray)', fontWeight: 600, marginTop: '6px', lineHeight: '1.4' }}>
                                            De: <span style={{color: 'var(--black)'}}>{data.firstStr}</span> <br/>
                                            Até: <span style={{color: 'var(--black)'}}>{data.lastStr}</span>
                                        </div>
                                    </div>
                                    
                                    {/* p. discreto ao lado do número gigante */}
                                    <div className="vcr-font" style={{ fontSize: '4.5em', color: accent, WebkitTextStroke: '1px var(--black)', textShadow: '3px 3px 0px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline' }}>
                                        <span style={{fontSize: '0.3em', WebkitTextStroke: '0', color: 'var(--gray)', textShadow: 'none', marginRight: '6px', letterSpacing: '0'}}>p.</span>
                                        {String(data.startPage).padStart(2, '0')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );

        // Adiciona as páginas de conteúdo numeradas
        finalRender.push(...contentPages);

        return finalRender;
    }, [csvData, ownerName, aggregates]);

    useEffect(() => {
        const instances = [];

        if (viewMode === 'preview' && chartTypeRef.current && window.Chart && csvData.length > 0) {
            window.Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
            window.Chart.defaults.color = "#777";

            const catCount = {};
            const statusCount = {};
            const ratingCount = { 'Nota 5': 0, 'Nota 4': 0, 'Nota 3': 0, 'Nota 2': 0, 'Nota 1': 0 }; 
            const authorCount = {};
            const pubCount = {};
            const yearCount = {};
            
            const seenWorksByAuthor = new Set();
            const seenWorksByPub = new Set();

            csvData.forEach(item => {
                const catInfo = getCategoryInfo(item['Tipo']);
                const cat = catInfo ? catInfo.substring(2) : 'OUTROS';
                catCount[cat] = (catCount[cat] || 0) + 1;
                
                let nota = parseFloat(safeString(item['Nota']).replace(',', '.'));
                if(isNaN(nota)) nota = 0;

                let stat = safeString(item['Status']) || 'Não Definido';
                if (cat === 'DISCOS' || cat === 'VÍDEO') { stat = nota > 0 ? 'Concluído' : 'Não Iniciado'; }
                statusCount[stat] = (statusCount[stat] || 0) + 1;

                if (nota === 5) ratingCount['Nota 5']++;
                else if (nota >= 4) ratingCount['Nota 4']++;
                else if (nota >= 3) ratingCount['Nota 3']++;
                else if (nota >= 2) ratingCount['Nota 2']++;
                else if (nota > 0) ratingCount['Nota 1']++;

                const baseWork = getBaseWork(item['Título']);
                const autor = safeString(item['Autor/Desenvolvedor']).trim();
                const publisher = safeString(item['Editora/Gravadora'] || item['Produtora'] || item['Desenvolvedora']).trim();

                if (autor && autor.toLowerCase() !== 'various') {
                    const authorWorkKey = `${autor}|||${baseWork}`;
                    if (!seenWorksByAuthor.has(authorWorkKey)) {
                        seenWorksByAuthor.add(authorWorkKey);
                        authorCount[autor] = (authorCount[autor] || 0) + 1;
                    }
                }

                if (publisher) {
                    const pubWorkKey = `${publisher}|||${baseWork}`;
                    if (!seenWorksByPub.has(pubWorkKey)) {
                        seenWorksByPub.add(pubWorkKey);
                        pubCount[publisher] = (pubCount[publisher] || 0) + 1;
                    }
                }

                const ano = parseInt(safeString(item['Ano']), 10);
                if (!isNaN(ano) && ano > 1000) {
                    yearCount[ano] = (yearCount[ano] || 0) + 1;
                }
            });

            const sortedAuthors = Object.entries(authorCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const sortedPubs = Object.entries(pubCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const sortedYears = Object.entries(yearCount).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
            
            const paletteStrict = ['#FF007F', '#008B8B', '#C5A059', '#FFFFFF', '#000000'];

            instances.push(new window.Chart(chartTypeRef.current, {
                type: 'bar',
                data: { labels: Object.keys(catCount), datasets: [{ data: Object.values(catCount), backgroundColor: paletteStrict, borderColor: '#000', borderWidth: [0,0,0,2,0], borderRadius: 4 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartStatusRef.current, {
                type: 'doughnut',
                data: { labels: Object.keys(statusCount), datasets: [{ data: Object.values(statusCount), backgroundColor: paletteStrict, borderColor: '#000', borderWidth: 1 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            }));

            instances.push(new window.Chart(chartRatingRef.current, {
                type: 'bar',
                data: { labels: Object.keys(ratingCount), datasets: [{ data: Object.values(ratingCount), backgroundColor: '#008B8B', borderRadius: 4 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartDecadeRef.current, {
                type: 'line',
                data: { labels: sortedYears.map(a => a[0]), datasets: [{ data: sortedYears.map(a => a[1]), borderColor: '#C5A059', backgroundColor: 'rgba(197, 160, 89, 0.2)', fill: true, tension: 0.2 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxRotation: 45, minRotation: 45 } } } }
            }));

            instances.push(new window.Chart(chartAuthorRef.current, {
                type: 'bar',
                data: { labels: sortedAuthors.map(a => a[0].length > 25 ? a[0].substring(0, 25) + '...' : a[0]), datasets: [{ data: sortedAuthors.map(a => a[1]), backgroundColor: '#FF007F', borderRadius: 4 }] },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartPubRef.current, {
                type: 'bar',
                data: { labels: sortedPubs.map(a => a[0].length > 25 ? a[0].substring(0, 25) + '...' : a[0]), datasets: [{ data: sortedPubs.map(a => a[1]), backgroundColor: '#222222', borderRadius: 4 }] },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));
        }

        return () => instances.forEach(instance => instance.destroy());
    }, [viewMode, csvData]);

    const handlePrint = () => window.print();

    if (!scriptsLoaded) return <div style={{ padding: 40, textAlign: 'center' }}>A iniciar o sistema...</div>;

    return (
        <ErrorBoundary>
            <>
                <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

                {viewMode === 'upload' && (
                    <div className="app-ui no-print" style={{ boxShadow: `15px 15px 0px ${uiColor}` }}>
                        <div className="ui-decor-1"></div>
                        <div className="ui-decor-2"></div>
                        <h1>Catálogo Editorial</h1>
                        <p>Importe a sua coleção em formato CSV. O layout editorial será gerado com matemática precisa para otimização de espaço em A4.</p>
                        
                        <input type="file" ref={fileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                        
                        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <h3 className="vcr-font" style={{ fontSize: '1.8em', color: 'var(--black)', marginTop: '20px' }}>
                                {fileName ? fileName : 'SELECIONE A SUA PLANILHA .CSV'}
                            </h3>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label htmlFor="owner-name" className="vcr-font" style={{ fontSize: '1.2em', color: 'var(--black)' }}>Dono da Coleção:</label>
                            <input type="text" id="owner-name" placeholder="NOME NA CAPA..." value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                        </div>

                        <button className="primary-btn" onClick={() => setViewMode('preview')} disabled={csvData.length === 0}>
                            {csvData.length === 0 ? 'A Aguardar Ficheiro...' : 'Gerar e Visualizar Catálogo'}
                        </button>
                    </div>
                )}

                {viewMode === 'preview' && (
                    <div className="preview-wrapper">
                        <div className="floating-bar no-print">
                            <button onClick={() => setViewMode('upload')}>← Voltar</button>
                            <button className="print-btn" onClick={handlePrint}>Guardar PDF / Imprimir</button>
                        </div>

                        {pdfPages}
                    </div>
                )}
            </>
        </ErrorBoundary>
    );
}
