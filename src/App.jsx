import React, { useState, useRef, useEffect, useMemo } from 'react';

// Barreira de erros para evitar Tela Branca
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error }; }
    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 40, color: '#FF007F', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2>Erro Crítico ao Processar o Catálogo</h2>
                <p>Ocorreu uma falha ao ler os dados do seu CSV.</p>
                <code style={{ background: '#eee', padding: 10, display: 'block', borderRadius: 5 }}>{this.state.errorInfo.toString()}</code>
                <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>Recarregar Aplicativo</button>
            </div>;
        }
        return this.props.children;
    }
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=VT323&display=swap');

  :root {
      --pink: #FF007F;
      --cyan: #008B8B; /* Ciano Escuro / Legível */
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

  /* ------------- INTERFACE DE UTILIZADOR ------------- */
  .app-ui {
      max-width: 600px; margin: 10vh auto; background: var(--white);
      padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .app-ui h1 { font-weight: 300; font-size: 2em; margin-top: 0; letter-spacing: -1px; }
  .app-ui p { color: var(--gray); line-height: 1.6; }

  .upload-area {
      border: 1px dashed #ccc; border-radius: 8px; padding: 40px; text-align: center;
      cursor: pointer; margin: 30px 0; background: var(--light-gray); transition: 0.2s;
  }
  .upload-area:hover { border-color: var(--cyan); background: #f0ffff; }

  button.primary-btn {
      background: var(--black); color: var(--white); border: none; border-radius: 6px;
      padding: 16px 30px; font-size: 1em; cursor: pointer; font-weight: 500; width: 100%; transition: 0.2s;
  }
  button.primary-btn:hover:not(:disabled) { background: var(--pink); }
  button.primary-btn:disabled { background: #d0d0d0; cursor: not-allowed; }

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
  
  .cover-subtitle { font-size: 2.2em; font-weight: 300; margin: 0 0 15px 0; color: var(--gray); text-transform: uppercase; letter-spacing: -0.5px;}
  
  .category-title { 
      font-size: 6.5em; margin: 0; line-height: 1; letter-spacing: 2px; text-transform: uppercase;
      -webkit-text-stroke: 3px currentColor;
  }

  .cover-owner { 
      font-size: 9.5em; margin: 0; line-height: 0.9;
      background: linear-gradient(135deg, var(--pink) 0%, var(--cyan) 50%, var(--gold) 100%);
      -webkit-background-clip: text;
      color: transparent;
      -webkit-text-stroke: 2px var(--black);
      filter: drop-shadow(5px 5px 0px rgba(0,0,0,0.15));
  }

  .mondrian-decor { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
  .m-line-v { position: absolute; width: 4px; background: var(--black); top: 0; bottom: 0; }
  .m-line-h { position: absolute; height: 4px; background: var(--black); left: 0; right: 0; }
  .m-block { position: absolute; }

  /* ------------- GRELHA MASONRY (ASSIMÉTRICA PERFEITA) ------------- */
  .masonry-layout {
      display: flex;
      gap: 10mm;
      align-items: flex-start;
      height: 245mm; /* Limite de segurança antes do rodapé */
  }

  .masonry-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6mm; /* Respiro vertical entre os itens */
  }

  .catalog-item {
      display: flow-root; /* Clearfix moderno para floats */
      padding: 10px 10px 10px 15px;
      border-left: 4px solid; 
      background: var(--white);
      border-radius: 0 6px 6px 0;
      box-sizing: border-box;
      box-shadow: 2px 2px 10px rgba(0,0,0,0.05); /* Sombra mais visível */
  }

  .catalog-item.star-5 {
      border-left-width: 8px !important;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 12px 30px rgba(0,0,0,0.18); /* Sombra hiper-contrastante */
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
  
  .stars-container { margin-bottom: 6px; display: flex; gap: 2px; }
  .star { width: 13px; height: 13px; }
  .star-gradient { width: 22px; height: 22px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.2)); margin-bottom: 4px; }

  /* ------------- FICHA CATALOGRÁFICA ------------- */
  .catalog-ficha { font-size: 0.65em; display: flex; flex-direction: column; gap: 3px; margin-top: 4px; clear: none; }
  .ficha-row { display: flex; flex-direction: row; gap: 4px; line-height: 1.3; }
  .ficha-label { font-weight: 600; color: var(--gray); text-transform: uppercase; white-space: nowrap; font-size: 0.9em;}
  .ficha-value { font-weight: 700; color: var(--black); word-break: break-word; }

  /* ------------- ESTATÍSTICAS (GRELHA 6 GRÁFICOS) ------------- */
  .stats-header-bar {
      display: flex; justify-content: space-between; background: var(--black); color: white;
      padding: 10px 20px; border-radius: 8px; margin-bottom: 20px;
  }
  .stat-block { text-align: center; width: 25%; }
  .stat-num { font-size: 2em; font-weight: 800; color: var(--gold); line-height: 1; margin-bottom: 3px; font-family: 'VT323', monospace; text-shadow: 2px 2px 0 #000;}
  .stat-lbl { font-size: 0.6em; text-transform: uppercase; letter-spacing: 1px; color: #ccc;}

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
  .chart-card { background: var(--white); border: 2px solid #eee; border-radius: 8px; padding: 10px; }
  .chart-card h3 { font-size: 0.75em; text-transform: uppercase; color: var(--black); margin-top: 0; margin-bottom: 8px; text-align: center; font-weight: 800; }
  .chart-container { height: 140px; width: 100%; }

  /* ------------- REGRAS DE IMPRESSÃO NATIVA ------------- */
  @media print {
      body, html { background-color: var(--white) !important; margin: 0; padding: 0; height: auto !important; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0; }
      .preview-wrapper { display: block !important; padding: 0 !important; gap: 0 !important; }
      .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; page-break-after: always !important; page-break-inside: avoid !important; }
  }
`;

// Hook para carregar as bibliotecas externas
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

// Ícones Customizados
const StarIcon = ({ filled, color }) => (
    <svg className="star" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={filled ? color : "#aaa"} strokeWidth="2">
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

// Funções Utilitárias Blindadas
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

// Estimador de Altura do Item para o Motor Masonry
const estimateItemHeight = (item) => {
    let nota = parseFloat(safeString(item['Nota']).replace(',', '.'));
    let h = 8; // Padding base + gap mínimo

    let titleLen = safeString(item['Título']).length;
    h += Math.ceil(titleLen / 25) * 5.5; // Altura do título

    let autor = safeString(item['Autor/Desenvolvedor']).trim();
    if (autor && autor.toLowerCase() !== 'various') h += 5.5;

    h += 6; // Altura das Estrelas

    let rows = 0;
    if (item['Tipo']) rows++;
    if (item['Ano']) rows++;
    if (item['Editora/Gravadora'] || item['Produtora'] || item['Desenvolvedora']) rows++;
    if (item['Status']) rows++;
    if (item['Páginas/Tempo'] || item['Faixas'] || item['Minutos'] || item['Horas']) rows++;
    h += rows * 4.5; // Altura da Ficha

    // Se tiver capa, a altura mínima é o tamanho da capa
    let hasCover = safeString(item['URL da Capa']).trim() !== '';
    if (hasCover) h = Math.max(h, 28); 

    if (nota === 5) h += 12; // Compensação de padding extra e estrela grande

    return h + 6; // Adiciona o Gap (6mm) de respiro ao total
};

const StarRating = ({ notaStr }) => {
    let n = parseFloat(safeString(notaStr).replace(',', '.'));
    if (isNaN(n)) n = 0;

    if (n === 5) return <div className="stars-container"><GradientStarIcon /></div>;
    
    let color = '#ccc';
    if (n > 0 && n <= 2) color = 'var(--gold)';
    else if (n > 2 && n <= 3) color = 'var(--cyan)';
    else if (n > 3 && n < 5) color = 'var(--pink)';

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (n >= i) stars.push(<StarIcon key={i} filled={true} color={color} />);
        else if (n >= i - 0.5) stars.push(<HalfStarIcon key={i} color={color} />);
        else stars.push(<StarIcon key={i} filled={false} color={color} />);
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
                        <h2 className="cover-subtitle">Coleção em Suporte Físico - Memorabilia</h2>
                        <h1 className="cover-owner vcr-font">{ownerName || 'Acervo'}</h1>
                        <div className="cover-meta">
                            <div style={{ fontSize: '0.85em', marginTop: '15px' }}>Gerado a {dateStr}</div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="cover-subtitle">Categoria</h2>
                        <h1 className="category-title vcr-font" style={{ color: accent }}>{title}</h1>
                    </>
                )}
            </div>
        </div>
    );
};

// Componente Cartão (Flutuação de Imagem Otimizada)
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
        stat = nota > 0 ? 'Concluído' : 'Não Iniciado';
    }

    let pLabel = 'EDITORA/GRAVADORA';
    let tLabel = 'PÁGINAS/TEMPO';
    let isDisco = false;

    if(cat === 'LIVROS') { pLabel = 'Editora'; tLabel = 'Páginas'; }
    if(cat === 'DISCOS') { pLabel = 'Gravadora'; tLabel = 'Faixas'; isDisco = true; }
    if(cat === 'GAMES') { pLabel = 'Desenv.'; tLabel = 'Horas'; }
    if(cat === 'VÍDEO') { pLabel = 'Produtora'; tLabel = 'Minutos'; }

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
                {!isDisco && stat && <div className="ficha-row"><span className="ficha-label">Status:</span><span className="ficha-value">{stat}</span></div>}
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
    
    const fileInputRef = useRef(null);
    const chartTypeRef = useRef(null);
    const chartStatusRef = useRef(null);
    const chartRatingRef = useRef(null);
    const chartDecadeRef = useRef(null); // Novo Gráfico Décadas
    const chartAuthorRef = useRef(null);
    const chartPubRef = useRef(null); // Novo Gráfico Editoras

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
        let p = 0, f = 0, m = 0, h = 0;
        csvData.forEach(item => {
            const catInfo = getCategoryInfo(item['Tipo']);
            const cat = catInfo ? catInfo.substring(2) : '';
            const rawVal = safeString(item['Páginas/Tempo'] || item['Faixas'] || item['Minutos'] || item['Horas']);
            const val = parseInt(rawVal.replace(/\D/g, '') || '0', 10);
            
            if (!isNaN(val)) {
                if (cat === 'LIVROS') p += val;
                if (cat === 'DISCOS') f += val;
                if (cat === 'VÍDEO') m += val;
                if (cat === 'GAMES') h += val;
            }
        });
        return { p, f, m, h };
    }, [csvData]);

    // Motor de Paginação Dinâmica (Masonry)
    const pdfPages = useMemo(() => {
        if (!csvData.length) return [];
        
        const pages = [];
        let pageCounter = 1;
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

        // Capa Principal
        pages.push(<CoverPage key="main-cover" isMain={true} ownerName={ownerName} dateStr={dateStr} colorIndex={0} />);

        sortedCategories.forEach((cat, catIndex) => {
            
            grouped[cat].sort((a, b) => {
                const keyA = getSortKey(a);
                const keyB = getSortKey(b);
                return keyA.localeCompare(keyB, 'pt', { numeric: true, sensitivity: 'base' });
            });

            const cleanCatName = cat.substring(2);
            pages.push(<CoverPage key={`cover-${cat}`} title={cleanCatName} isMain={false} colorIndex={catIndex + 1} />);
            
            // --- Lógica Masonry (Duas Colunas Fluídas sem Estouro) ---
            let allItemsToProcess = [...grouped[cat]];
            let lastColorIdx = -1;
            const authorColorMap = {};
            const MAX_HEIGHT_MM = 240; // Margem de segurança máxima (não toca no rodapé)

            while (allItemsToProcess.length > 0) {
                let col1 = [], col2 = [];
                let h1 = 0, h2 = 0;

                while (allItemsToProcess.length > 0) {
                    let item = allItemsToProcess[0]; // Espreitar o próximo
                    let itemH = estimateItemHeight(item);

                    // Se adicionar o item à coluna mais curta estourar a página, QUEBRA de Página!
                    if (Math.min(h1, h2) + itemH > MAX_HEIGHT_MM) {
                        break;
                    }

                    // Se couber, retira da lista e insere na coluna mais curta
                    item = allItemsToProcess.shift();
                    if (h1 <= h2) { col1.push(item); h1 += itemH; } 
                    else { col2.push(item); h2 += itemH; }
                }

                if (col1.length > 0 || col2.length > 0) {
                    const currentPage = pageCounter;
                    
                    // Lógica do Dicionário (Primeira e Última Letra da Página)
                    let firstItem = col1[0] || col2[0];
                    let lastItem = col2[col2.length-1] || col1[col1.length-1];
                    const getDictLetter = (str) => {
                        if (!str) return '?';
                        const char = str.charAt(0).toUpperCase();
                        return /[0-9]/.test(char) ? '#' : char;
                    };
                    const firstLetter = getDictLetter(getSortKey(firstItem));
                    const lastLetter = getDictLetter(getSortKey(lastItem));
                    const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;

                    // Renderiza a Página com as Duas Colunas Masonry
                    pages.push(
                        <div className="pdf-page" key={`page-${cat}-${currentPage}`}>
                            <div className="page-header">
                                <span className="vcr-font">{cleanCatName}</span>
                                <span>{dictStr}</span>
                            </div>
                            
                            <div className="masonry-layout">
                                <div className="masonry-col">
                                    {col1.map((item, idx) => {
                                        const authKey = getSortKey(item);
                                        if (authorColorMap[authKey] === undefined) {
                                            let nextColor = (lastColorIdx + 1) % 3;
                                            authorColorMap[authKey] = nextColor;
                                            lastColorIdx = nextColor;
                                        }
                                        return <ItemCard key={`c1-${idx}`} item={item} accentColor={colorPalette[authorColorMap[authKey]]} />;
                                    })}
                                </div>
                                <div className="masonry-col">
                                    {col2.map((item, idx) => {
                                        const authKey = getSortKey(item);
                                        if (authorColorMap[authKey] === undefined) {
                                            let nextColor = (lastColorIdx + 1) % 3;
                                            authorColorMap[authKey] = nextColor;
                                            lastColorIdx = nextColor;
                                        }
                                        return <ItemCard key={`c2-${idx}`} item={item} accentColor={colorPalette[authorColorMap[authKey]]} />;
                                    })}
                                </div>
                            </div>
                            
                            <div className="page-footer"><span></span><span>{currentPage}</span></div>
                        </div>
                    );
                    pageCounter++;
                }
            }
        });

        // Dashboard de Estatísticas (6 Gráficos)
        pages.push(
            <div className="pdf-page" key="stats-page">
                <div className="page-header"><span className="vcr-font">Estatísticas</span><span>Visão Geral</span></div>
                
                <h2 style={{ fontWeight: 300, fontSize: '2em', marginBottom: '15px', marginTop: '5px' }}>Visão Geral do Acervo</h2>
                
                <div className="stats-header-bar">
                    <div className="stat-block"><div className="stat-num">{aggregates.p}</div><div className="stat-lbl">Páginas Lidas</div></div>
                    <div className="stat-block"><div className="stat-num">{aggregates.f}</div><div className="stat-lbl">Faixas Ouvidas</div></div>
                    <div className="stat-block"><div className="stat-num">{aggregates.m}</div><div className="stat-lbl">Min. Assistidos</div></div>
                    <div className="stat-block"><div className="stat-num">{aggregates.h}</div><div className="stat-lbl">Horas Jogadas</div></div>
                </div>

                <div className="stats-grid">
                    <div className="chart-card"><h3>Divisão por Suporte</h3><div className="chart-container"><canvas ref={chartTypeRef}></canvas></div></div>
                    <div className="chart-card"><h3>Status de Consumo</h3><div className="chart-container"><canvas ref={chartStatusRef}></canvas></div></div>
                    <div className="chart-card"><h3>Distribuição de Notas</h3><div className="chart-container"><canvas ref={chartRatingRef}></canvas></div></div>
                    <div className="chart-card"><h3>Décadas de Lançamento</h3><div className="chart-container"><canvas ref={chartDecadeRef}></canvas></div></div>
                    <div className="chart-card"><h3>Top 5 Autores/Desenv.</h3><div className="chart-container"><canvas ref={chartAuthorRef}></canvas></div></div>
                    <div className="chart-card"><h3>Top 5 Editoras/Gravadoras</h3><div className="chart-container"><canvas ref={chartPubRef}></canvas></div></div>
                </div>

                <div className="page-footer"><span></span><span>{pageCounter}</span></div>
            </div>
        );

        return pages;
    }, [csvData, ownerName, aggregates]);

    // Motor de Renderização dos 6 Gráficos
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
            const decadeCount = {};

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

                const autor = safeString(item['Autor/Desenvolvedor']).trim();
                if(autor && autor.toLowerCase() !== 'various') authorCount[autor] = (authorCount[autor] || 0) + 1;

                const publisher = safeString(item['Editora/Gravadora'] || item['Produtora'] || item['Desenvolvedora']).trim();
                if(publisher) pubCount[publisher] = (pubCount[publisher] || 0) + 1;

                const ano = parseInt(safeString(item['Ano']), 10);
                if (!isNaN(ano) && ano > 1000) {
                    const decada = Math.floor(ano / 10) * 10 + 's';
                    decadeCount[decada] = (decadeCount[decada] || 0) + 1;
                }
            });

            const sortedAuthors = Object.entries(authorCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const sortedPubs = Object.entries(pubCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const sortedDecades = Object.entries(decadeCount).sort((a, b) => a[0].localeCompare(b[0]));
            
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
                data: { labels: sortedDecades.map(a => a[0]), datasets: [{ data: sortedDecades.map(a => a[1]), borderColor: '#C5A059', backgroundColor: 'rgba(197, 160, 89, 0.2)', fill: true, tension: 0.3 }] },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartAuthorRef.current, {
                type: 'bar',
                data: { labels: sortedAuthors.map(a => a[0].length > 15 ? a[0].substring(0, 15) + '...' : a[0]), datasets: [{ data: sortedAuthors.map(a => a[1]), backgroundColor: '#FF007F', borderRadius: 4 }] },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            instances.push(new window.Chart(chartPubRef.current, {
                type: 'bar',
                data: { labels: sortedPubs.map(a => a[0].length > 15 ? a[0].substring(0, 15) + '...' : a[0]), datasets: [{ data: sortedPubs.map(a => a[1]), backgroundColor: '#222222', borderRadius: 4 }] },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));
        }

        return () => instances.forEach(instance => instance.destroy());
    }, [viewMode, csvData]);

    const handlePrint = () => window.print();

    if (!scriptsLoaded) return <div style={{ padding: 40, textAlign: 'center' }}>A iniciar o sistema...</div>;

    return (
        <ErrorBoundary>
            <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

            {viewMode === 'upload' && (
                <div className="app-ui no-print">
                    <h1>Catálogo Editorial</h1>
                    <p>Importe a sua coleção em formato CSV. O layout editorial será gerado fluidamente para a máxima otimização de espaço em A4.</p>
                    
                    <input type="file" ref={fileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                    
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <h3 style={{ fontWeight: 400, color: '#333' }}>{fileName ? fileName : 'Selecione a sua folha de cálculo .csv'}</h3>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label htmlFor="owner-name" style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Dono da Coleção</label>
                        <input type="text" id="owner-name" placeholder="Nome na capa..." value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                            style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', outline: 'none', fontSize: '1.1em', fontFamily: 'inherit' }} 
                        />
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
        </ErrorBoundary>
    );
}
