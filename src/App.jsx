import React, { useState, useRef, useEffect, useMemo } from 'react';

const globalCSS = `
  :root {
      --pink: #FF007F;
      --cyan: #00FFFF;
      --gold: #C5A059;
      --black: #111111;
      --gray: #888888;
      --light-gray: #F5F5F5;
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

  /* ------------- INTERFACE DE USUÁRIO (TELA INICIAL) ------------- */
  .app-ui {
      max-width: 600px;
      margin: 10vh auto;
      background: var(--white);
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .app-ui h1 { font-weight: 300; font-size: 2.2em; margin-top: 0; color: var(--black); letter-spacing: -1px; }
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
      padding: 16px 30px; font-size: 1.1em; cursor: pointer; font-weight: 600; width: 100%; transition: 0.2s;
  }
  button.primary-btn:hover:not(:disabled) { background: var(--pink); }
  button.primary-btn:disabled { background: #d0d0d0; cursor: not-allowed; }

  .preview-wrapper { padding: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 30px; }
  .floating-bar {
      position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.85);
      padding: 15px 25px; border-radius: 50px; z-index: 1000;
      display: flex; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  .floating-bar button { background: white; color: black; border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }
  .floating-bar button.print-btn { background: var(--cyan); }

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
      display: flex; justify-content: flex-end; font-size: 0.8em; font-weight: bold; color: var(--black);
      border-top: 1px solid #eee; padding-top: 5px;
  }

  /* Capa Principal com Geometria Mondrian */
  .mondrian-decor { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
  .m-line-v { position: absolute; width: 6px; background: var(--black); top: 0; bottom: 0; left: 20mm; }
  .m-line-h { position: absolute; height: 6px; background: var(--black); left: 0; right: 0; bottom: 60mm; }
  .m-box-1 { position: absolute; width: 40mm; height: 50mm; background: var(--pink); top: 0; right: 30mm; }
  .m-box-2 { position: absolute; width: 80mm; height: 60mm; background: var(--cyan); bottom: 0; right: 0; }
  .m-box-3 { position: absolute; width: 20mm; height: 20mm; background: var(--gold); bottom: 60mm; left: 20mm; }

  .cover-page { 
      display: flex; flex-direction: column; justify-content: center; 
      height: 100%; padding-left: 15mm; position: relative; z-index: 10;
  }
  .cover-title { font-size: 2.5em; font-weight: 300; margin: 0 0 15px 0; letter-spacing: 1px; color: var(--gray); text-transform: uppercase; background: white; display: inline-block; padding-right: 15px;}
  .cover-owner { font-size: 6.5em; font-weight: 900; margin: 0; color: var(--black); line-height: 0.9; letter-spacing: -3px; text-transform: uppercase; background: white; display: inline-block; padding: 10px 20px 10px 0;}
  .cover-meta { font-size: 1.2em; color: var(--gray); margin-top: 40px; background: white; display: inline-block; padding-right: 10px;}
  .cover-accent { width: 80px; height: 6px; margin-bottom: 30px; }

  .catalog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 15mm;
      row-gap: 8mm;
      height: 245mm;
      align-content: start;
      align-items: start; /* Garante que a caixa pare de crescer quando o texto acabar */
  }

  .catalog-item {
      position: relative;
      display: block; 
      padding: 0 0 0 12px;
      border-left: 3px solid; 
      overflow: hidden; /* Clearfix para a imagem flutuante */
      background: var(--white);
      box-sizing: border-box;
      page-break-inside: avoid;
  }

  /* Destaque 5 Estrelas */
  .catalog-item.star-5 {
      border-left-width: 6px !important;
      background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,248,248,1) 100%);
      box-shadow: 4px 6px 20px rgba(0,0,0,0.06);
      border-radius: 0 8px 8px 0;
      padding: 12px 12px 12px 15px;
  }

  .item-code { position: absolute; top: 0; right: 5px; font-size: 0.5em; color: #ccc; font-family: monospace; z-index: 2; }

  /* Imagem Flutuante */
  .item-cover-img {
      float: left;
      width: 85px; /* Capas maiores */
      height: auto;
      max-height: 125px; /* Capas maiores */
      object-fit: cover;
      margin: 0 15px 5px 0;
      border-radius: 3px;
      box-shadow: 2px 3px 8px rgba(0,0,0,0.15);
      background-color: #eee;
  }

  /* Textos Principais */
  .item-title { font-size: 1.15em; font-weight: 800; color: var(--black); line-height: 1.1; margin-bottom: 2px; padding-right: 25px; }
  .star-5 .item-title { font-size: 1.25em; color: var(--black); }
  
  .item-author { font-size: 0.95em; font-weight: 700; color: #444; margin-bottom: 6px; line-height: 1.1;}

  .stars-container { margin-bottom: 8px; display: flex; align-items: center; gap: 2px; color: var(--gold); clear: right; }
  .star { width: 13px; height: 13px; }
  
  /* A Estrela Gradiente Gigante */
  .star-gradient { width: 26px; height: 26px; filter: drop-shadow(1px 2px 3px rgba(0,0,0,0.2)); margin-bottom: 4px; }

  /* Ficha Catalográfica em Blocos Fluidos */
  .catalog-ficha {
      display: block;
      margin-top: 8px;
  }

  .ficha-block {
      display: inline-block;
      margin-right: 15px;
      margin-bottom: 8px;
      vertical-align: top;
      max-width: 100%;
  }

  .ficha-label {
      display: block;
      font-size: 0.55em;
      text-transform: uppercase;
      color: var(--gray);
      margin-bottom: 2px;
      letter-spacing: 0.5px;
      font-weight: 600;
  }

  .ficha-value {
      display: block;
      font-size: 0.8em;
      font-weight: 800;
      color: var(--black);
      line-height: 1.2;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* Limita a 2 linhas se for muito longo */
      -webkit-box-orient: vertical;
      overflow: hidden;
  }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; margin-top: 20px;}
  .chart-card { background: var(--white); border-radius: 8px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);}
  .chart-card h3 { font-size: 0.75em; text-transform: uppercase; color: var(--gray); margin-top: 0; margin-bottom: 15px; text-align: center; letter-spacing: 0.5px;}
  .chart-container { height: 180px; width: 100%; }

  @media print {
      body { background-color: var(--white) !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0; }
      .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; page-break-after: always; }
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

const StarIcon = ({ filled }) => (
    <svg className="star" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);
const HalfStarIcon = () => (
    <svg className="star" viewBox="0 0 24 24" fill="url(#half)">
        <defs><linearGradient id="half"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs>
        <path stroke="currentColor" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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

const getCategoryInfo = (tipo) => {
    const t = (tipo || '').toLowerCase().trim();
    if (['livro', 'quadrinho', 'revista', 'hq', 'mangá', 'hqs'].includes(t)) return '1 LIVROS';
    if (['vinil', 'cd', 'fita cassete', 'k7', 'lp', 'disco'].includes(t)) return '2 DISCOS';
    if (['vhs', 'dvd', 'blu-ray', 'filme', 'video', 'vídeo'].includes(t)) return '3 VÍDEO';
    if (['mega drive', 'snes', 'wii', 'ps1', 'ps2', 'ps4', 'game', 'jogo', 'nintendo'].includes(t)) return '4 GAMES';
    return '5 OUTROS';
};

const getAccentColor = (index) => {
    const colors = ['var(--cyan)', 'var(--pink)', 'var(--gold)'];
    return colors[index % colors.length];
};

const StarRating = ({ nota }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (nota >= i) stars.push(<StarIcon key={i} filled={true} />);
        else if (nota >= i - 0.5) stars.push(<HalfStarIcon key={i} />);
        else stars.push(<StarIcon key={i} filled={false} />);
    }
    return <div className="stars-container">{stars}</div>;
};

const CoverPage = ({ title, isMain, ownerName, dateStr, colorKey = 2 }) => {
    const colors = ['var(--cyan)', 'var(--pink)', 'var(--gold)', 'var(--black)'];
    const accent = colors[colorKey % colors.length];
    
    if (isMain) {
        return (
            <div className="pdf-page">
                <div className="mondrian-decor">
                    <div className="m-line-v"></div>
                    <div className="m-line-h"></div>
                    <div className="m-box-1"></div>
                    <div className="m-box-2"></div>
                    <div className="m-box-3"></div>
                </div>
                <div className="cover-page">
                    <h2 className="cover-title">Catálogo de Acervo</h2>
                    <h1 className="cover-owner">{ownerName || 'Coleção'}</h1>
                    <div className="cover-meta">Exportado em {dateStr}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-page">
            <div className="cover-page">
                <div className="cover-accent" style={{ backgroundColor: accent }}></div>
                <h1 className="cover-owner" style={{ fontSize: '4em', padding: 0 }}>{title}</h1>
            </div>
        </div>
    );
};

const ItemCard = ({ item, index }) => {
    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    
    let isStar5 = nota === 5;
    const borderColor = isStar5 ? 'var(--gold)' : getAccentColor(index);

    // Campos ignorados no miolo da ficha (pois já estão renderizados de outra forma ou foram omitidos pelo usuário)
    const excludedKeys = ['ID', 'Código Arquivístico', 'Código de Barras', 'Descrição', 'URL da Capa', 'Título', 'Nota', 'Autor/Desenvolvedor'];
    
    const fichaFields = Object.keys(item).filter(key => 
        !excludedKeys.includes(key) && item[key] !== null && item[key] !== undefined && item[key].toString().trim() !== ''
    );

    const autor = (item['Autor/Desenvolvedor'] || '').trim();

    return (
        <div className={`catalog-item ${isStar5 ? 'star-5' : ''}`} style={{ borderLeftColor: borderColor }}>
            
            {item['Código Arquivístico'] && <div className="item-code">{item['Código Arquivístico']}</div>}

            {/* Imagem com Float Left para o texto fluir embaixo */}
            {item['URL da Capa'] && item['URL da Capa'].trim() !== '' && (
                <img 
                    className="item-cover-img"
                    src={item['URL da Capa']} 
                    alt="Capa" 
                    crossOrigin="anonymous" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                />
            )}

            <div className="item-title">{item['Título'] || 'Sem Título'}</div>
            
            {autor && autor.toLowerCase() !== 'various' && (
                <div className="item-author">{autor}</div>
            )}
            
            {isStar5 ? <GradientStarIcon /> : (nota > 0 && <StarRating nota={nota} />)}

            <div className="catalog-ficha">
                {fichaFields.map(key => (
                    <div className="ficha-block" key={key}>
                        <span className="ficha-label">{key}</span>
                        <span className="ficha-value">{item[key]}</span>
                    </div>
                ))}
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
    const chartDecadeRef = useRef(null);
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

        const grouped = {};
        csvData.forEach(item => {
            const cat = getCategoryInfo(item['Tipo']);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        const sortedCategories = Object.keys(grouped).sort();

        pages.push(<CoverPage key="main-cover" title="Catálogo" isMain={true} ownerName={ownerName} dateStr={dateStr} colorKey={3} />);

        sortedCategories.forEach((cat, catIndex) => {
            grouped[cat].sort((a, b) => {
                const keyA = getSortKey(a);
                const keyB = getSortKey(b);
                return keyA.localeCompare(keyB, 'pt', { numeric: true, sensitivity: 'base' });
            });
            
            const cleanCatName = cat.substring(2);
            pages.push(<CoverPage key={`cover-${cat}`} title={cleanCatName} colorKey={catIndex} />);
            
            const itemsPerPage = 10; /* Aumentado para otimizar o espaço da página */
            for (let i = 0; i < grouped[cat].length; i += itemsPerPage) {
                const chunk = grouped[cat].slice(i, i + itemsPerPage);
                
                const firstTitle = getSortKey(chunk[0]);
                const lastTitle = getSortKey(chunk[chunk.length - 1]);
                const firstLetter = getDictLetter(firstTitle);
                const lastLetter = getDictLetter(lastTitle);
                const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                const currentPage = pageCounter;

                pages.push(
                    <div className="pdf-page" key={`page-${cat}-${currentPage}`}>
                        <div className="page-header">
                            <span>{cleanCatName}</span>
                            <span>{dictStr}</span>
                        </div>
                        
                        <div className="catalog-grid">
                            {chunk.map((item, idx) => (
                                <ItemCard key={`item-${currentPage}-${idx}`} item={item} index={idx} />
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

        pages.push(
            <div className="pdf-page" key="stats-page">
                <div className="page-header"><span>Estatísticas</span><span>Dashboard</span></div>
                <h2 style={{ fontWeight: 300, fontSize: '2.5em', marginBottom: '20px', marginTop: '10px', letterSpacing: '-1px' }}>Dashboard do Acervo</h2>
                
                <div className="stats-grid">
                    <div className="chart-card">
                        <h3>Divisão por Suporte</h3>
                        <div className="chart-container"><canvas ref={chartTypeRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Status de Consumo</h3>
                        <div className="chart-container"><canvas ref={chartStatusRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Lançamentos por Década</h3>
                        <div className="chart-container"><canvas ref={chartDecadeRef}></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3>Top 5 Editoras/Gravadoras</h3>
                        <div className="chart-container"><canvas ref={chartPubRef}></canvas></div>
                    </div>
                </div>

                <div className="page-footer"><span>{pageCounter}</span></div>
            </div>
        );

        return pages;
    }, [csvData, ownerName]);

    useEffect(() => {
        const instances = [];

        if (viewMode === 'preview' && chartTypeRef.current && window.Chart && csvData.length > 0) {
            window.Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
            window.Chart.defaults.color = "#777";

            const catCount = {};
            const statusCount = {};
            const decadeCount = {};
            const pubCount = {};

            csvData.forEach(item => {
                // Tipos
                const cat = getCategoryInfo(item['Tipo']).substring(2);
                catCount[cat] = (catCount[cat] || 0) + 1;
                
                // Status
                const stat = item['Status'] || 'Não Definido';
                statusCount[stat] = (statusCount[stat] || 0) + 1;

                // Décadas
                let year = parseInt(item['Ano']);
                if (!isNaN(year) && year > 1800 && year <= new Date().getFullYear()) {
                    let decade = Math.floor(year / 10) * 10 + 's';
                    decadeCount[decade] = (decadeCount[decade] || 0) + 1;
                }

                // Editoras
                let pub = (item['Editora/Gravadora'] || '').trim();
                if (pub) pubCount[pub] = (pubCount[pub] || 0) + 1;
            });

            const sortedDecades = Object.keys(decadeCount).sort();
            const topPubs = Object.entries(pubCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

            // 1. Gráfico de Tipos
            instances.push(new window.Chart(chartTypeRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(catCount),
                    datasets: [{ data: Object.values(catCount), backgroundColor: ['#00FFFF', '#FF007F', '#C5A059', '#222', '#ddd'], borderRadius: 4 }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));

            // 2. Gráfico de Status
            instances.push(new window.Chart(chartStatusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{ data: Object.values(statusCount), backgroundColor: ['#222222', '#C5A059', '#FF007F', '#00FFFF', '#eeeeee'], borderWidth: 0 }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            }));

            // 3. Gráfico de Décadas
            instances.push(new window.Chart(chartDecadeRef.current, {
                type: 'line',
                data: {
                    labels: sortedDecades,
                    datasets: [{ data: sortedDecades.map(d => decadeCount[d]), borderColor: '#FF007F', backgroundColor: 'rgba(255,0,127,0.1)', fill: true, tension: 0.3 }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }));

            // 4. Gráfico Top Editoras
            instances.push(new window.Chart(chartPubRef.current, {
                type: 'bar',
                data: {
                    labels: topPubs.map(p => p[0].length > 15 ? p[0].substring(0, 15) + '...' : p[0]),
                    datasets: [{ data: topPubs.map(p => p[1]), backgroundColor: '#00FFFF', borderRadius: 4 }]
                },
                options: { indexAxis: 'y', animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            }));
        }

        return () => { instances.forEach(inst => inst.destroy()); };
    }, [viewMode, csvData]);

    const handlePrint = () => {
        window.print();
    };

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
                        <h3 style={{ fontWeight: 400, color: '#333' }}>
                            {fileName ? fileName : 'Selecione sua planilha .csv'}
                        </h3>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label htmlFor="owner-name" style={{ fontSize: '0.85em', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Dono da Coleção</label>
                        <input 
                            type="text" 
                            id="owner-name" 
                            placeholder="Nome na capa..." 
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', outline: 'none', fontSize: '1.1em', fontFamily: 'inherit' }} 
                        />
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
