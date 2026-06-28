import React, { useState, useRef, useEffect, useMemo } from 'react';

// CSS com as regras estritas de impressão nativa (@media print)
const globalCSS = `
  :root {
      --pink: #FF007F;
      --cyan: #00FFFF;
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

  /* ------------- INTERFACE DE USUÁRIO (TELA INICIAL) ------------- */
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
      border: 1px dashed #ccc;
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
      padding: 16px 30px; font-size: 1em; cursor: pointer; font-weight: 500; width: 100%; transition: 0.2s;
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
      position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8);
      padding: 15px 25px; border-radius: 50px; z-index: 1000;
      display: flex; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  .floating-bar button {
      background: white; color: black; border: none; padding: 10px 20px;
      border-radius: 20px; font-weight: bold; cursor: pointer;
  }
  .floating-bar button.print-btn { background: var(--cyan); }

  /* ------------- PÁGINA A4 ------------- */
  .pdf-page {
      width: 210mm;
      height: 297mm; /* Altura cravada A4 */
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
      display: flex; justify-content: space-between; font-size: 0.7em; color: var(--gray);
      border-top: 1px solid #eee; padding-top: 5px;
  }

  /* ------------- CAPAS ------------- */
  .cover-page { display: flex; flex-direction: column; justify-content: center; height: 100%; padding-left: 15mm; }
  .cover-title { font-size: 3em; font-weight: 300; margin: 0 0 10px 0; letter-spacing: -1px; color: var(--black); }
  .cover-accent { width: 60px; height: 4px; margin-bottom: 25px; }
  .cover-meta { font-size: 1.1em; color: var(--gray); margin-top: 40px; }

  /* ------------- GRID DE ITENS ------------- */
  .catalog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 12mm;
      row-gap: 10mm;
      height: 245mm;
      align-content: start;
  }

  .catalog-item {
      position: relative;
      display: flex; 
      flex-direction: column;
      padding: 10px 10px 10px 12px;
      border-left: 2px solid var(--gray);
      height: 75mm; /* Ajustado para caber 6 itens (3 linhas x 2 colunas) */
      overflow: hidden;
      background: var(--white);
      border-radius: 0 4px 4px 0;
  }

  .catalog-item.star-5 {
      border: 1px solid rgba(197, 160, 89, 0.3);
      border-left: 4px solid var(--gold); 
      background: linear-gradient(135deg, rgba(255,0,127,0.03) 0%, rgba(0,255,255,0.03) 50%, rgba(197,160,89,0.08) 100%);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(197, 160, 89, 0.12);
  }

  .item-code {
      position: absolute;
      top: 8px;
      right: 10px;
      font-size: 0.55em;
      color: #aaa;
      font-family: monospace;
      letter-spacing: 0.5px;
      z-index: 2;
  }

  .item-title { font-size: 1em; font-weight: 600; color: var(--black); line-height: 1.2; margin-bottom: 4px; padding-right: 50px; }
  .star-5 .item-title { color: #9A7B3E; }
  
  .stars-container { margin-bottom: 8px; display: flex; gap: 2px; color: var(--gold); }
  .star { width: 11px; height: 11px; }
  .star-gradient { width: 22px; height: 22px; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.1)); margin-bottom: 4px; }

  /* ------------- IMAGEM E CONTEÚDO ------------- */
  .item-body-wrapper {
      display: flex;
      gap: 10px;
      height: 100%;
      overflow: hidden;
  }

  .item-cover-box {
      flex-shrink: 0;
      width: 48px;
      height: 68px;
      background: #f4f4f4;
      border: 1px solid #eaeaea;
      border-radius: 3px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .item-cover-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }

  .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
  }

  /* ------------- FICHA CATALOGRÁFICA ------------- */
  .catalog-ficha {
      margin-top: 2px;
      padding: 6px;
      background-color: rgba(255,255,255,0.6);
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 4px;
      font-size: 0.6em;
      display: flex;
      flex-direction: column;
      gap: 3px;
  }
  
  .star-5 .catalog-ficha { border-color: rgba(197, 160, 89, 0.2); }

  .ficha-row {
      display: flex;
      flex-direction: row;
      gap: 4px;
      line-height: 1.3;
  }

  .ficha-label { font-weight: 600; color: var(--gray); white-space: nowrap; }
  .ficha-value { 
      color: var(--black); 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
  }

  .chart-container { width: 100%; height: 350px; margin-bottom: 50px; }

  /* ------------- REGRAS DE IMPRESSÃO NATIVA ------------- */
  @media print {
      body { background-color: var(--white) !important; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 0; }
      .pdf-page { margin: 0 !important; box-shadow: none !important; border: none !important; page-break-after: always; }
  }
`;

// Hook para carregar as bibliotecas (PapaParse e ChartJS)
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

// Ícones
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
    const colors = ['var(--cyan)', 'var(--pink)', 'var(--black)'];
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
    return (
        <div className="pdf-page">
            <div className="cover-page">
                <div className="cover-accent" style={{ backgroundColor: accent }}></div>
                <h2 className="cover-title">{title}</h2>
                {isMain && (
                    <div className="cover-meta">
                        <div>{ownerName || 'Acervo Pessoal'}</div>
                        <div style={{ fontSize: '0.8em', marginTop: '8px' }}>Exportado em {dateStr}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// COMPONENTE DO ITEM
const ItemCard = ({ item, index }) => {
    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    
    let isStar5 = nota === 5;
    const borderColor = isStar5 ? 'var(--gold)' : getAccentColor(index);

    const excludedKeys = ['ID', 'Código Arquivístico', 'Código de Barras', 'Descrição', 'URL da Capa', 'Título', 'Nota'];
    
    const fichaFields = Object.keys(item).filter(key => 
        !excludedKeys.includes(key) && item[key] !== null && item[key] !== undefined && item[key].toString().trim() !== ''
    );

    return (
        <div className={`catalog-item ${isStar5 ? 'star-5' : ''}`} style={{ borderLeftColor: borderColor }}>
            {item['Código Arquivístico'] && (
                <div className="item-code">{item['Código Arquivístico']}</div>
            )}

            <div className="item-body-wrapper">
                {item['URL da Capa'] && item['URL da Capa'].trim() !== '' && (
                    <div className="item-cover-box">
                        <img 
                            src={item['URL da Capa']} 
                            alt="Capa" 
                            crossOrigin="anonymous" 
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.display = 'none'; }} 
                        />
                    </div>
                )}

                <div className="item-content">
                    <div className="item-title">{item['Título'] || 'Sem Título'}</div>
                    
                    {isStar5 ? (
                        <GradientStarIcon />
                    ) : (
                        (nota > 0) && <StarRating nota={nota} />
                    )}

                    {fichaFields.length > 0 && (
                        <div className="catalog-ficha">
                            {fichaFields.map(key => (
                                <div className="ficha-row" key={key}>
                                    <span className="ficha-label">{key}:</span>
                                    <span className="ficha-value" title={item[key]}>{item[key]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

        // Função de utilidade para determinar a chave de ordenação primária
        const getSortKey = (item) => {
            const autor = (item['Autor/Desenvolvedor'] || '').trim();
            // Se existir autor e não for "various", ordena por autor. Senão, ordena por título.
            if (autor && autor.toLowerCase() !== 'various') {
                return autor;
            }
            return (item['Título'] || '').trim();
        };

        // Função para formatar a letra do dicionário no cabeçalho
        const getDictLetter = (str) => {
            if (!str) return '?';
            const char = str.charAt(0).toUpperCase();
            // Se começar por um número, devolve '#'
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
            
            // Nova lógica de ordenação (Natural sort: números antes de letras, '2' antes de '16')
            grouped[cat].sort((a, b) => {
                const keyA = getSortKey(a);
                const keyB = getSortKey(b);
                // Utilizando localeCompare com 'numeric: true' para forçar a avaliação natural dos números
                return keyA.localeCompare(keyB, 'pt', { numeric: true, sensitivity: 'base' });
            });
            
            const cleanCatName = cat.substring(2);
            pages.push(<CoverPage key={`cover-${cat}`} title={cleanCatName} colorKey={catIndex} />);
            
            const itemsPerPage = 6; 
            for (let i = 0; i < grouped[cat].length; i += itemsPerPage) {
                const chunk = grouped[cat].slice(i, i + itemsPerPage);
                
                // Cabeçalho adaptado para refletir a nova chave de ordenação primária
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
                        
                        <div className="catalog-grid">
                            {chunk.map((item, idx) => (
                                <ItemCard key={`item-${currentPage}-${idx}`} item={item} index={idx} />
                            ))}
                        </div>
                        
                        <div className="page-footer">
                            <span>Acervo Pessoal</span>
                            <span>{currentPage}</span>
                        </div>
                    </div>
                );
                pageCounter++;
            }
        });

        pages.push(
            <div className="pdf-page" key="stats-page">
                <div className="page-header"><span>Estatísticas</span><span>Visão Geral</span></div>
                <h2 style={{ fontWeight: 300, fontSize: '2em', marginBottom: '40px', marginTop: '10px' }}>Visão Geral</h2>
                <div className="chart-container"><canvas id="chartType" ref={chartTypeRef}></canvas></div>
                <div className="chart-container"><canvas id="chartStatus" ref={chartStatusRef}></canvas></div>
                <div className="page-footer"><span>Acervo Pessoal</span><span>{pageCounter}</span></div>
            </div>
        );

        return pages;
    }, [csvData, ownerName]);

    useEffect(() => {
        let chartTypeInstance = null;
        let chartStatusInstance = null;

        if (viewMode === 'preview' && chartTypeRef.current && chartStatusRef.current && csvData.length > 0 && window.Chart) {
            const catCount = {};
            const statusCount = {};

            csvData.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']).substring(2);
                catCount[cat] = (catCount[cat] || 0) + 1;
                const stat = item['Status'] || 'Não Definido';
                statusCount[stat] = (statusCount[stat] || 0) + 1;
            });

            window.Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
            window.Chart.defaults.color = "#777";

            chartTypeInstance = new window.Chart(chartTypeRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(catCount),
                    datasets: [{ label: 'Itens', data: Object.values(catCount), backgroundColor: ['#00FFFF', '#FF007F', '#C5A059', '#222', '#ddd'], borderRadius: 4 }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            chartStatusInstance = new window.Chart(chartStatusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{ data: Object.values(statusCount), backgroundColor: ['#222222', '#C5A059', '#FF007F', '#00FFFF', '#eeeeee'], borderWidth: 0 }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }

        return () => {
            if (chartTypeInstance) chartTypeInstance.destroy();
            if (chartStatusInstance) chartStatusInstance.destroy();
        };
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
