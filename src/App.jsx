import React, { useState, useRef, useEffect, useMemo } from 'react';

// CSS Global - Design Minimalista e Discreto
const globalCSS = `
  :root {
      --pink: #FF007F;
      --cyan: #00FFFF;
      --gold: #D4AF37; /* Dourado um pouco mais suave e elegante */
      --black: #222222;
      --gray: #888888;
      --light-gray: #F9F9F9;
      --white: #FFFFFF;
  }

  body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      background-color: #fafafa;
      margin: 0;
      padding: 20px;
      color: var(--black);
  }

  /* UI do Aplicativo */
  .app-ui {
      max-width: 700px;
      margin: 40px auto;
      background: var(--white);
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }

  .app-ui h1 {
      font-weight: 300;
      font-size: 2.2em;
      margin-top: 0;
      color: var(--black);
      letter-spacing: -1px;
  }

  .app-ui p {
      color: var(--gray);
      line-height: 1.6;
  }

  .upload-area {
      border: 1px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      margin: 30px 0;
      transition: all 0.3s ease;
      background: var(--light-gray);
  }
  
  .upload-area:hover {
      border-color: var(--cyan);
      background: #f0ffff;
  }

  button {
      background: var(--black);
      color: var(--white);
      border: none;
      border-radius: 4px;
      padding: 15px 30px;
      font-size: 1em;
      cursor: pointer;
      font-weight: 500;
      width: 100%;
      transition: 0.2s;
      margin-top: 10px;
  }

  button:hover:not(:disabled) {
      background: var(--pink);
  }

  button:disabled {
      background: #e0e0e0;
      color: #aaa;
      cursor: not-allowed;
  }

  /* Área do PDF - Tamanho exato de A4 */
  #pdf-viewport {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -999;
      opacity: 0.01; /* Evita display: none que quebra o html2pdf, mas esconde da visão */
      pointer-events: none;
  }

  .pdf-page {
      width: 210mm;
      min-height: 297mm;
      box-sizing: border-box;
      background: var(--white);
      position: relative;
      padding: 20mm 15mm 25mm 15mm; /* Margens generosas */
      page-break-after: always;
  }

  /* Cabeçalho e Rodapé Minimalistas */
  .page-header {
      position: absolute;
      top: 12mm; left: 15mm; right: 15mm;
      display: flex; justify-content: space-between;
      font-size: 0.75em;
      color: var(--gray);
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
  }

  .page-footer {
      position: absolute;
      bottom: 12mm; left: 15mm; right: 15mm;
      text-align: right;
      font-size: 0.75em;
      color: var(--gray);
      border-top: 1px solid #eee;
      padding-top: 5px;
  }

  /* Capas Minimalistas */
  .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      height: 100%;
      padding-left: 20mm;
  }

  .cover-title {
      font-size: 3.5em;
      font-weight: 200;
      margin: 0 0 10px 0;
      letter-spacing: -2px;
      color: var(--black);
  }

  .cover-accent {
      width: 50px;
      height: 3px;
      margin-bottom: 20px;
  }

  .cover-meta {
      font-size: 1.1em;
      color: var(--gray);
      margin-top: 30px;
  }

  /* Layout do Catálogo - Fluido e Leve */
  .catalog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 15mm;
      row-gap: 10mm;
      align-content: start;
  }

  /* Item Individual */
  .catalog-item {
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      padding-left: 10px;
      border-left: 2px solid var(--black); /* Cor alterada dinamicamente via style */
  }

  .catalog-item.star-5 {
      border-left: 3px solid var(--gold);
      background-color: rgba(212, 175, 55, 0.03); /* Fundo dourado extremamente sutil */
      padding: 10px 10px 10px 12px;
      border-radius: 0 4px 4px 0;
  }

  .item-header {
      margin-bottom: 8px;
  }

  .item-title {
      font-size: 1.1em;
      font-weight: 600;
      color: var(--black);
      line-height: 1.2;
      margin-bottom: 4px;
  }
  
  .star-5 .item-title {
      color: #B8860B; /* Dourado escuro para o texto */
  }

  .item-subtitle {
      font-size: 0.75em;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
  }

  .item-body {
      font-size: 0.75em;
      color: #444;
      line-height: 1.4;
  }

  .item-data-row {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 2px;
  }

  .item-data-label {
      font-weight: 600;
      margin-right: 5px;
      color: var(--gray);
  }

  .item-desc {
      margin-top: 6px;
      font-style: italic;
      color: var(--gray);
      display: -webkit-box;
      -webkit-line-clamp: 3; /* Limita a 3 linhas para não poluir */
      -webkit-box-orient: vertical;  
      overflow: hidden;
  }

  .stars-container {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 2px;
      color: var(--gold);
  }

  .star { width: 12px; height: 12px; }
  
  .chart-container { 
      width: 100%; 
      height: 350px; 
      margin-bottom: 40px; 
  }
  
  #loading {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.95);
      display: flex; justify-content: center; align-items: center; z-index: 9999; flex-direction: column;
  }
  .spinner { width: 40px; height: 40px; border: 3px solid #eee; border-top-color: var(--black); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// Hook para carregar as bibliotecas dinamicamente
const useExternalScripts = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
        ]).then(() => setLoaded(true)).catch(err => console.error("Erro ao carregar libs", err));
    }, []);

    return loaded;
};

// Ícones de Estrela (Pequenos e delicados)
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

// Helpers
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

// Componente de Capa (Minimalista)
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
                        <div style={{ fontSize: '0.8em', marginTop: '5px' }}>Gerado em {dateStr}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente do Item (Limpo e simples)
const ItemCard = ({ item, index }) => {
    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    
    let isStar5 = nota === 5;
    
    // Distribui as cores sutilmente pela lista se não for 5 estrelas
    const borderColor = isStar5 ? 'var(--gold)' : getAccentColor(index);

    // Campos que serão exibidos discretamente em linha
    const fieldsToShow = ['Autor/Desenvolvedor', 'Ano', 'Editora/Gravadora'];
    let metaString = fieldsToShow
        .map(field => item[field])
        .filter(val => val && val.trim() !== '')
        .join(' • ');

    // Outros dados detalhados (Ignorando campos óbvios)
    const ignoreKeys = ['Título', 'Tipo', 'Nota', 'Descrição', 'URL da Capa', 'Autor/Desenvolvedor', 'Ano', 'Editora/Gravadora'];
    const details = Object.keys(item)
        .filter(key => !ignoreKeys.includes(key) && item[key] && item[key].trim() !== '')
        .map(key => (
            <div className="item-data-row" key={key}>
                <span className="item-data-label">{key}:</span> 
                <span>{item[key]}</span>
            </div>
        ));

    return (
        <div className={`catalog-item ${isStar5 ? 'star-5' : ''}`} style={{ borderLeftColor: borderColor }}>
            <div className="item-header">
                <div className="item-subtitle">{item['Tipo'] || 'N/A'}</div>
                <div className="item-title">{item['Título'] || 'Sem Título'}</div>
                {metaString && <div className="item-body" style={{ color: 'var(--gray)' }}>{metaString}</div>}
            </div>
            
            <div className="item-body">
                {details}
            </div>
            
            {item['Descrição'] && (
                <div className="item-desc">"{item['Descrição']}"</div>
            )}
            
            {(nota > 0) && <StarRating nota={nota} />}
        </div>
    );
};

export default function App() {
    const scriptsLoaded = useExternalScripts();
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    const fileInputRef = useRef(null);
    const pdfContainerRef = useRef(null);
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

    // Geração das páginas (Paginando de 10 em 10 para evitar quebras abruptas do html2pdf)
    const pdfPages = useMemo(() => {
        if (!csvData.length) return [];
        
        const pages = [];
        let pageCounter = 1;
        const dateStr = new Date().toLocaleDateString('pt-BR');

        // Agrupa os itens
        const grouped = {};
        csvData.forEach(item => {
            const cat = getCategoryInfo(item['Tipo']);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        const sortedCategories = Object.keys(grouped).sort();

        // 1. Capa Principal
        pages.push(<CoverPage key="main-cover" title="Catálogo" isMain={true} ownerName={ownerName} dateStr={dateStr} colorKey={3} />);

        // 2. Páginas de Categorias
        sortedCategories.forEach((cat, catIndex) => {
            grouped[cat].sort((a, b) => (a['Título'] || '').localeCompare(b['Título'] || ''));
            
            // Folha de Rosto da categoria com cor de destaque intercalada
            pages.push(<CoverPage key={`cover-${cat}`} title={cat.substring(2)} colorKey={catIndex} />);
            
            const itemsPerPage = 10; // 10 itens por página = 2 colunas x 5 linhas (cabe folgadamente em A4)
            for (let i = 0; i < grouped[cat].length; i += itemsPerPage) {
                const chunk = grouped[cat].slice(i, i + itemsPerPage);
                
                const firstItem = chunk[0]['Título'] || '?';
                const lastItem = chunk[chunk.length - 1]['Título'] || '?';
                const firstLetter = firstItem.charAt(0).toUpperCase();
                const lastLetter = lastItem.charAt(0).toUpperCase();
                const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                const currentPage = pageCounter;

                pages.push(
                    <div className="pdf-page" key={`page-${cat}-${currentPage}`}>
                        <div className="page-header">
                            <span>{cat.substring(2)}</span>
                            <span>{dictStr}</span>
                        </div>
                        
                        <div className="catalog-grid">
                            {chunk.map((item, idx) => (
                                <ItemCard key={`item-${currentPage}-${idx}`} item={item} index={idx} />
                            ))}
                        </div>
                        
                        <div className="page-footer">{currentPage}</div>
                    </div>
                );
                pageCounter++;
            }
        });

        // 3. Estatísticas
        pages.push(
            <div className="pdf-page" key="stats-page">
                <div className="page-header">
                    <span>Estatísticas</span>
                    <span>Visão Geral</span>
                </div>
                
                <h2 style={{ fontWeight: 300, fontSize: '2em', marginBottom: '30px', marginTop: '10px' }}>Visão Geral</h2>
                <div className="chart-container"><canvas id="chartType" ref={chartTypeRef}></canvas></div>
                <div className="chart-container"><canvas id="chartStatus" ref={chartStatusRef}></canvas></div>
                
                <div className="page-footer">{pageCounter}</div>
            </div>
        );

        return pages;
    }, [csvData, ownerName]);

    // Hooks dos Gráficos
    useEffect(() => {
        let chartTypeInstance = null;
        let chartStatusInstance = null;

        if (isGenerating && chartTypeRef.current && chartStatusRef.current && csvData.length > 0 && window.Chart) {
            const catCount = {};
            const statusCount = {};

            csvData.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']).substring(2);
                catCount[cat] = (catCount[cat] || 0) + 1;
                const stat = item['Status'] || 'Sem Status';
                statusCount[stat] = (statusCount[stat] || 0) + 1;
            });

            window.Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
            window.Chart.defaults.color = "#888";

            chartTypeInstance = new window.Chart(chartTypeRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(catCount),
                    datasets: [{
                        label: 'Acervo',
                        data: Object.values(catCount),
                        backgroundColor: ['#00FFFF', '#FF007F', '#D4AF37', '#222', '#eee'],
                        borderRadius: 4
                    }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            chartStatusInstance = new window.Chart(chartStatusRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{
                        data: Object.values(statusCount),
                        backgroundColor: ['#222222', '#D4AF37', '#FF007F', '#00FFFF', '#eeeeee'],
                        borderWidth: 0
                    }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }

        return () => {
            if (chartTypeInstance) chartTypeInstance.destroy();
            if (chartStatusInstance) chartStatusInstance.destroy();
        };
    }, [isGenerating, csvData]);

    const handleGenerate = () => {
        setIsGenerating(true);

        // Tempo ampliado para garantir que a renderização DOM e os gráficos ocorram perfeitamente
        setTimeout(async () => {
            if (pdfContainerRef.current && window.html2pdf) {
                const opt = {
                    margin:       0,
                    filename:     'Acervo_Minimalista.pdf',
                    image:        { type: 'jpeg', quality: 1 },
                    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                try {
                    await window.html2pdf().set(opt).from(pdfContainerRef.current).save();
                } catch (err) {
                    console.error("Erro no PDF:", err);
                    alert("Ops! Houve um problema ao compilar o PDF.");
                } finally {
                    setIsGenerating(false);
                }
            }
        }, 2500);
    };

    if (!scriptsLoaded) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Iniciando o sistema...</div>;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
            
            <div className="app-ui">
                <h1>Minimalist Catalog</h1>
                <p>Importe sua coleção em formato CSV. Nós geraremos um relatório PDF elegante, discreto e tipográfico com os seus itens.</p>
                
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
                        style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box', fontSize: '1.1em', fontFamily: 'inherit', outline: 'none', background: 'transparent' }} 
                    />
                </div>

                <button onClick={handleGenerate} disabled={csvData.length === 0}>
                    {csvData.length === 0 ? 'Aguardando Arquivo' : 'Baixar PDF'}
                </button>
            </div>

            {isGenerating && (
                <div id="loading">
                    <div className="spinner"></div>
                    <h3 style={{ marginTop: '20px', fontWeight: 300 }}>Montando arquivo para impressão...</h3>
                </div>
            )}

            {/* O Viewport oculto garante que o html2pdf consiga renderizar sem estar display:none */}
            {isGenerating && (
                <div id="pdf-viewport">
                    <div ref={pdfContainerRef}>
                        {pdfPages}
                    </div>
                </div>
            )}
        </>
    );
}
