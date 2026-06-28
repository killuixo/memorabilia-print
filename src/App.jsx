import React, { useState, useRef, useEffect, useMemo } from 'react';

// CSS Global (Estilo Mondrian + PDF) injetado diretamente
const globalCSS = `
  :root {
      --pink: #FF007F;
      --cyan: #00FFFF;
      --gold: #FFD700;
      --black: #000000;
      --white: #FFFFFF;
      --line-weight: 6px;
  }

  body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      padding: 20px;
      color: var(--black);
  }

  .app-ui {
      max-width: 800px;
      margin: 0 auto 30px;
      background: var(--white);
      padding: 30px;
      border: var(--line-weight) solid var(--black);
      box-shadow: 15px 15px 0px var(--pink);
  }

  .app-ui h1 {
      text-transform: uppercase;
      font-size: 2em;
      margin-top: 0;
      border-bottom: var(--line-weight) solid var(--black);
      padding-bottom: 10px;
  }

  .upload-area {
      border: 2px dashed var(--black);
      padding: 40px;
      text-align: center;
      cursor: pointer;
      margin: 20px 0;
      background: rgba(0, 255, 255, 0.1);
      transition: all 0.3s ease;
  }
  
  .upload-area:hover {
      background: rgba(255, 0, 127, 0.1);
      border-style: solid;
  }

  button {
      background: var(--black);
      color: var(--white);
      border: none;
      padding: 15px 30px;
      font-size: 1.1em;
      cursor: pointer;
      text-transform: uppercase;
      font-weight: bold;
      width: 100%;
      transition: 0.2s;
  }

  button:hover:not(:disabled) {
      background: var(--pink);
      box-shadow: 5px 5px 0px var(--gold);
  }

  button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
  }

  #pdf-container {
      width: 210mm;
      margin: 0 auto;
      background: var(--white);
  }

  .pdf-page {
      width: 210mm;
      min-height: 297mm;
      box-sizing: border-box;
      background: var(--white);
      page-break-after: always;
      position: relative;
      border: var(--line-weight) solid var(--black);
  }

  .mondrian-cover {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      grid-template-rows: 1fr 2fr 1fr;
      gap: var(--line-weight);
      background: var(--black);
      height: calc(297mm - 30mm);
      border: var(--line-weight) solid var(--black);
  }

  .mondrian-box { background: var(--white); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .box-pink { background: var(--pink); }
  .box-cyan { background: var(--cyan); }
  .box-gold { background: var(--gold); }
  
  .title-box {
      grid-column: 2 / 4;
      grid-row: 2 / 3;
      background: var(--white);
      flex-direction: column;
      text-align: right;
      padding: 20px;
      display: flex;
      justify-content: center;
  }

  .title-box h2 {
      font-size: 4em;
      margin: 0;
      text-transform: uppercase;
      color: var(--black);
      line-height: 1;
  }

  .catalog-grid {
      display: flex;
      flex-wrap: wrap;
      background: var(--black);
      gap: var(--line-weight);
      border: var(--line-weight) solid var(--black);
      margin-top: 5mm;
      align-content: flex-start;
  }

  .catalog-item {
      background: var(--white);
      width: calc(50% - (var(--line-weight) / 2));
      height: 55mm;
      box-sizing: border-box;
      padding: 15px;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      overflow: hidden;
  }

  .catalog-item.star-5 {
      width: 100%;
      height: calc(110mm + var(--line-weight));
      padding: 25px;
      background: linear-gradient(135deg, var(--pink) 0%, var(--cyan) 50%, var(--gold) 100%);
      position: relative;
  }
  
  .page-header {
      position: absolute;
      top: 10mm; left: 15mm; right: 15mm;
      display: flex; justify-content: space-between;
      font-weight: bold; font-size: 1.2em; text-transform: uppercase;
      border-bottom: 3px solid var(--black); padding-bottom: 5px;
      color: var(--black);
  }

  .page-footer {
      position: absolute;
      bottom: 10mm; left: 15mm; right: 15mm;
      text-align: right;
      font-weight: bold; font-size: 1.2em;
      border-top: 3px solid var(--black); padding-top: 5px;
      color: var(--black);
  }

  .star-5-content {
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border: 2px solid var(--black);
      height: 100%;
      display: flex;
      gap: 20px;
  }

  .item-header { border-bottom: 2px solid var(--black); padding-bottom: 10px; margin-bottom: 10px; }
  .item-title { font-size: 1.4em; font-weight: bold; text-transform: uppercase; }
  .item-meta { font-size: 0.9em; color: #444; margin-top: 5px; }
  
  .badge { background: var(--black); color: var(--white); padding: 2px 6px; font-size: 0.7em; text-transform: uppercase; vertical-align: middle; }
  .item-details { font-size: 0.8em; margin-top: 10px; flex-grow: 1; }
  .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 3px 0; }
  .detail-label { font-weight: bold; }
  .item-desc { font-size: 0.85em; font-style: italic; margin: 10px 0; border-left: 4px solid var(--cyan); padding-left: 8px; }

  .item-image { max-width: 100px; max-height: 140px; border: 2px solid var(--black); object-fit: cover; }
  .star-5 .item-image { max-width: 200px; max-height: 250px; border-width: 4px; box-shadow: 5px 5px 0 var(--pink); }

  .stars-container { color: var(--black); margin: 5px 0; display: inline-flex; align-items: center;}
  .star { width: 16px; height: 16px; display: inline-block; }
  .star-5-icon { width: 40px; height: 40px; color: var(--gold); filter: drop-shadow(2px 2px 0 var(--pink)); }
  .star-5-label { font-size: 1.5em; font-weight: bold; margin-left: 10px; text-transform: uppercase; letter-spacing: 2px;}

  .chart-container { width: 100%; height: 400px; margin-bottom: 40mm; background: white; border: 2px solid var(--black); padding: 10px; box-sizing: border-box;}
  
  #loading {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9);
      display: flex; justify-content: center; align-items: center; z-index: 999; flex-direction: column;
  }
  .spinner { width: 50px; height: 50px; border: 5px solid var(--black); border-top-color: var(--pink); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// Hook para carregar as bibliotecas dinamicamente, ignorando erros de compilação
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
        ]).then(() => setLoaded(true)).catch(err => console.error("Erro ao carregar bibliotecas", err));
    }, []);

    return loaded;
};

// Componentes Auxiliares (Ícones)
const StarFull = () => <svg className="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const StarHalf = () => <svg className="star" viewBox="0 0 24 24" fill="url(#halfGrad)"><defs><linearGradient id="halfGrad"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs><path stroke="currentColor" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const StarEmpty = () => <svg className="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const StarGold = () => <svg className="star-5-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;

// Helpers
const getCategoryInfo = (tipo) => {
    const t = (tipo || '').toLowerCase().trim();
    if (['livro', 'quadrinho', 'revista', 'hq', 'mangá', 'hqs'].includes(t)) return { class: '1 LIVROS', sub: t };
    if (['vinil', 'cd', 'fita cassete', 'k7', 'lp', 'disco'].includes(t)) return { class: '2 DISCOS', sub: t };
    if (['vhs', 'dvd', 'blu-ray', 'filme', 'video', 'vídeo'].includes(t)) return { class: '3 VÍDEO', sub: t };
    if (['mega drive', 'snes', 'wii', 'ps1', 'ps2', 'ps4', 'game', 'jogo', 'nintendo'].includes(t)) return { class: '4 GAMES', sub: t };
    return { class: '5 OUTROS', sub: t };
};

const StarRating = ({ nota }) => {
    if (nota === 5) {
        return (
            <div className="stars-container">
                <StarGold /> <span className="star-5-label">Masterpiece</span>
            </div>
        );
    }
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (nota >= i) stars.push(<StarFull key={i} />);
        else if (nota >= i - 0.5) stars.push(<StarHalf key={i} />);
        else stars.push(<StarEmpty key={i} />);
    }
    return (
        <div className="stars-container">
            {stars}
            <span style={{ marginLeft: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>{nota}</span>
        </div>
    );
};

const CoverPage = ({ title, isMain, ownerName, dateStr }) => (
    <div className="pdf-page" style={{ padding: '15mm' }}>
        <div className="mondrian-cover">
            <div className="mondrian-box box-pink"></div>
            <div className="mondrian-box"></div>
            <div className="mondrian-box box-cyan"></div>
            
            <div className="mondrian-box"></div>
            <div className="title-box">
                <h2>{title}</h2>
                {isMain && (
                    <div style={{ marginTop: '20px', borderTop: 'var(--line-weight) solid var(--black)', paddingTop: '10px', textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{ownerName || 'Acervo Pessoal'}</div>
                        <div style={{ fontSize: '1.2rem' }}>{dateStr}</div>
                    </div>
                )}
            </div>
            
            <div className="mondrian-box box-gold"></div>
            <div className="mondrian-box"></div>
            <div className="mondrian-box box-pink"></div>
        </div>
    </div>
);

const ItemCard = ({ item }) => {
    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
    if (isNaN(nota)) nota = 0;
    
    let isStar5 = nota === 5;
    let cardClass = isStar5 ? 'catalog-item star-5' : 'catalog-item';
    
    const fieldsToSkip = ['Título', 'Tipo', 'Autor/Desenvolvedor', 'Ano', 'Editora/Gravadora', 'Nota', 'Descrição', 'URL da Capa'];
    
    const details = Object.keys(item)
        .filter(key => !fieldsToSkip.includes(key) && item[key] && item[key].trim() !== '')
        .map(key => (
            <div className="detail-row" key={key}>
                <span className="detail-label">{key}:</span> 
                <span style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{item[key]}</span>
            </div>
        ));
        
    if (item['URL da Capa']) {
        details.push(
            <div className="detail-row" key="urlCapa">
                <span className="detail-label">URL Capa:</span> 
                <span style={{ fontSize: '0.6em', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{item['URL da Capa']}</span>
            </div>
        );
    }

    const innerContent = (
        <>
            <div className="item-header">
                <div className="item-title">{item['Título'] || 'Sem Título'} <span className="badge">{item['Tipo'] || 'N/A'}</span></div>
                <div className="item-meta">
                    {item['Autor/Desenvolvedor'] ? <strong>{item['Autor/Desenvolvedor']} • </strong> : null}
                    {item['Ano'] ? `${item['Ano']} • ` : ''}
                    {item['Editora/Gravadora'] || ''}
                </div>
                <StarRating nota={nota} />
            </div>
            <div style={{ display: 'flex', gap: '15px', flexGrow: 1, alignItems: 'flex-start' }}>
                {item['URL da Capa'] && (
                    <img 
                        src={item['URL da Capa']} 
                        className="item-image" 
                        crossOrigin="anonymous" 
                        onError={(e) => e.target.style.display='none'} 
                        alt="Capa" 
                    />
                )}
                <div style={{ flexGrow: 1 }}>
                    {item['Descrição'] && <div className="item-desc">{item['Descrição']}</div>}
                    <div className="item-details">{details}</div>
                </div>
            </div>
        </>
    );

    if (isStar5) {
        return (
            <div className={cardClass}>
                <div className="star-5-content" style={{ flexDirection: item['URL da Capa'] ? 'row' : 'column' }}>
                    {innerContent}
                </div>
            </div>
        );
    }
    return <div className={cardClass}>{innerContent}</div>;
};

// Componente Principal
export default function App() {
    const scriptsLoaded = useExternalScripts();
    const [csvData, setCsvData] = useState([]);
    const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
    const [ownerName, setOwnerName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    const fileInputRef = useRef(null);
    const pdfContainerRef = useRef(null);
    const chartTypeRef = useRef(null);
    const chartStatusRef = useRef(null);

    // Carregamento do CSV
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

    // Montar a Lógica do PDF (Separada da UI)
    const pdfPages = useMemo(() => {
        if (!csvData.length) return [];
        
        const pages = [];
        let pageCounter = 1;
        const dateStr = new Date().toLocaleDateString('pt-BR');

        // Agrupamento
        const grouped = {};
        csvData.forEach(item => {
            const cat = getCategoryInfo(item['Tipo']).class;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        const sortedCategories = Object.keys(grouped).sort();

        // Capa Principal
        pages.push(<CoverPage key="main-cover" title="Acervo Pessoal" isMain={true} ownerName={ownerName} dateStr={dateStr} />);

        // Gerador de Páginas das Categorias
        sortedCategories.forEach(cat => {
            grouped[cat].sort((a, b) => (a['Título'] || '').localeCompare(b['Título'] || ''));
            pages.push(<CoverPage key={`cover-${cat}`} title={cat} />);
            
            const MAX_WEIGHT = 8;
            let currentWeight = 0;
            let pageItems = [];

            const flushPage = () => {
                if (pageItems.length === 0) return;
                
                const firstTitle = pageItems[0]['Título'] || '?';
                const lastTitle = pageItems[pageItems.length-1]['Título'] || '?';
                const firstLetter = firstTitle.charAt(0).toUpperCase();
                const lastLetter = lastTitle.charAt(0).toUpperCase();
                const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                
                const currentItems = [...pageItems];
                const currentPageNum = pageCounter;

                pages.push(
                    <div className="pdf-page" style={{ padding: '25mm 15mm 25mm 15mm' }} key={`page-${currentPageNum}-${cat}`}>
                        <div className="page-header"><span>{cat}</span><span>{dictStr}</span></div>
                        <div className="catalog-grid" style={{ height: '240mm' }}>
                            {currentItems.map((item, idx) => <ItemCard key={`item-${currentPageNum}-${idx}`} item={item} />)}
                        </div>
                        <div className="page-footer">{currentPageNum}</div>
                    </div>
                );
                
                pageCounter++;
                pageItems = [];
                currentWeight = 0;
            };

            grouped[cat].forEach(item => {
                let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
                let weight = (nota === 5) ? 2 : 1;
                
                if (currentWeight + weight > MAX_WEIGHT) {
                    flushPage();
                }
                
                pageItems.push(item);
                currentWeight += weight;
            });
            
            flushPage();
        });

        // Página de Estatísticas (O conteúdo dos canvas é gerado via useEffect)
        pages.push(
            <div className="pdf-page" style={{ padding: '25mm 15mm 25mm 15mm' }} key="stats-page">
                <h1 style={{ borderBottom: 'var(--line-weight) solid var(--black)', textTransform: 'uppercase', marginBottom: '30px' }}>Estatísticas do Acervo</h1>
                <div className="chart-container"><canvas id="chartType" ref={chartTypeRef}></canvas></div>
                <div className="chart-container"><canvas id="chartStatus" ref={chartStatusRef}></canvas></div>
                <div className="page-footer">{pageCounter}</div>
            </div>
        );

        return pages;
    }, [csvData, ownerName]);

    // Hook para rodar ChartJS caso o container de PDF esteja visível na tela
    useEffect(() => {
        let chartTypeInstance = null;
        let chartStatusInstance = null;

        if (isGenerating && chartTypeRef.current && chartStatusRef.current && csvData.length > 0 && window.Chart) {
            const catCount = {};
            const statusCount = {};

            csvData.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']).class;
                catCount[cat] = (catCount[cat] || 0) + 1;
                const stat = item['Status'] || 'Sem Status';
                statusCount[stat] = (statusCount[stat] || 0) + 1;
            });

            window.Chart.defaults.font.family = "'Helvetica Neue', Arial, sans-serif";
            window.Chart.defaults.color = "#000";

            chartTypeInstance = new window.Chart(chartTypeRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(catCount),
                    datasets: [{
                        label: 'Quantidade',
                        data: Object.values(catCount),
                        backgroundColor: ['#FF007F', '#00FFFF', '#FFD700', '#000000', '#cccccc'],
                        borderColor: '#000',
                        borderWidth: 2
                    }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Distribuição do Acervo por Suporte', font: { size: 18 } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });

            chartStatusInstance = new window.Chart(chartStatusRef.current, {
                type: 'pie',
                data: {
                    labels: Object.keys(statusCount),
                    datasets: [{
                        data: Object.values(statusCount),
                        backgroundColor: ['#00FFFF', '#FF007F', '#FFD700', '#000000', '#ffffff'],
                        borderColor: '#000',
                        borderWidth: 2
                    }]
                },
                options: { animation: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Status de Consumo/Progresso', font: { size: 18 } } } }
            });
        }

        return () => {
            if (chartTypeInstance) chartTypeInstance.destroy();
            if (chartStatusInstance) chartStatusInstance.destroy();
        };
    }, [isGenerating, csvData]);

    // Função Principal de Gatilho
    const handleGenerate = () => {
        setIsGenerating(true);

        // Dá 2 segundos para o React montar o HTML escondido, carregar os gráficos e as imagens
        setTimeout(async () => {
            if (pdfContainerRef.current && window.html2pdf) {
                const opt = {
                    margin:       0,
                    filename:     'Catalogo_Colecao.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                try {
                    await window.html2pdf().set(opt).from(pdfContainerRef.current).save();
                } catch (err) {
                    console.error("Erro no html2pdf:", err);
                    alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
                } finally {
                    setIsGenerating(false);
                }
            }
        }, 2000);
    };

    if (!scriptsLoaded) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <h2 style={{ color: '#FF007F' }}>Carregando ambiente...</h2>
                <p>Baixando bibliotecas necessárias.</p>
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
            
            {/* UI Principal (Escondida enquanto o PDF é gerado e montado) */}
            <div style={{ display: isGenerating ? 'none' : 'block' }}>
                <div className="app-ui">
                    <h1>Catálogo de Coleção</h1>
                    <p>Carregue sua planilha CSV contendo o acervo. O sistema irá gerar um PDF com design inspirado em Mondrian, categorizado e com estatísticas.</p>
                    
                    <input type="file" ref={fileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                    
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <h3>Clique para selecionar seu arquivo .csv</h3>
                        <p>{fileName}</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="owner-name" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Dono do Acervo:</label>
                        <input 
                            type="text" 
                            id="owner-name" 
                            placeholder="Digite seu nome para a capa" 
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            style={{ width: '100%', padding: '12px', border: 'var(--line-weight) solid var(--black)', marginTop: '5px', boxSizing: 'border-box', fontSize: '1.1em', fontFamily: 'inherit' }} 
                        />
                    </div>

                    <button onClick={handleGenerate} disabled={csvData.length === 0}>
                        Gerar Catálogo PDF
                    </button>
                </div>
            </div>

            {/* Overlay de Loading (Aparece ao clicar em "Gerar") */}
            {isGenerating && (
                <div id="loading">
                    <div className="spinner"></div>
                    <h2 style={{ marginTop: '20px', fontFamily: 'sans-serif' }}>Gerando Catálogo Mondrian...</h2>
                    <p>Isso pode levar alguns segundos dependendo do tamanho da coleção.</p>
                </div>
            )}

            {/* Container onde o HTML do PDF será montado e lido pela lib html2pdf */}
            {isGenerating && (
                <div ref={pdfContainerRef} id="pdf-container">
                    {pdfPages}
                </div>
            )}
        </>
    );
}
