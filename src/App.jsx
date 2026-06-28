<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo Mondrian - Coleção</title>
    
    <!-- Bibliotecas Necessárias -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

    <style>
        /* Variáveis de Cores - Estilo Mondrian Moderno */
        :root {
            --pink: #FF007F;
            --cyan: #00FFFF;
            --gold: #FFD700;
            --black: #000000;
            --white: #FFFFFF;
            --line-weight: 6px; /* Espessura das linhas do Mondrian */
        }

        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
            color: var(--black);
        }

        /* UI do Aplicativo */
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

        button:hover {
            background: var(--pink);
            box-shadow: 5px 5px 0px var(--gold);
        }

        button:disabled {
            background: #ccc;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Área do PDF / Catálogo */
        #pdf-container {
            width: 210mm; /* Tamanho A4 */
            margin: 0 auto;
            background: var(--white);
            display: none; /* Escondido até carregar dados */
        }

        .pdf-page {
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
            background: var(--white);
            page-break-after: always;
            position: relative;
            padding: 15mm;
            border: var(--line-weight) solid var(--black);
        }

        /* Estilo Capa Mondrian */
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
        }

        .title-box h2 {
            font-size: 4em;
            margin: 0;
            text-transform: uppercase;
            color: var(--black);
            line-height: 1;
        }

        /* Grid de Itens */
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
            height: 55mm; /* Altura fixa para garantir 4 linhas por página */
            box-sizing: border-box;
            padding: 15px;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            overflow: hidden; /* Corta textos longos mantendo o grid Mondrian perfeito */
        }

        /* Item Nota 5 Especial */
        .catalog-item.star-5 {
            width: 100%;
            height: calc(110mm + var(--line-weight)); /* Ocupa duas linhas */
            padding: 25px;
            /* Efeito CD Furta Cor */
            background: linear-gradient(135deg, var(--pink) 0%, var(--cyan) 50%, var(--gold) 100%);
            position: relative;
        }
        
        /* Cabeçalho e Rodapé de Página */
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
            background: rgba(255, 255, 255, 0.9); /* Fundo branco semi-transparente para leitura */
            padding: 20px;
            border: 2px solid var(--black);
            height: 100%;
            display: flex;
            gap: 20px;
        }

        .item-header { border-bottom: 2px solid var(--black); padding-bottom: 10px; margin-bottom: 10px; }
        .item-title { font-size: 1.4em; font-weight: bold; text-transform: uppercase; }
        .item-meta { font-size: 0.9em; color: #444; margin-top: 5px; }
        
        .badge {
            background: var(--black); color: var(--white); padding: 2px 6px; font-size: 0.7em; text-transform: uppercase; vertical-align: middle;
        }

        .item-details { font-size: 0.8em; margin-top: 10px; flex-grow: 1; }
        .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 3px 0; }
        .detail-label { font-weight: bold; }
        .item-desc { font-size: 0.85em; font-style: italic; margin: 10px 0; border-left: 4px solid var(--cyan); padding-left: 8px; }

        .item-image { max-width: 100px; max-height: 140px; border: 2px solid var(--black); object-fit: cover; }
        .star-5 .item-image { max-width: 200px; max-height: 250px; border-width: 4px; box-shadow: 5px 5px 0 var(--pink); }

        /* Estrelas */
        .stars-container { color: var(--black); margin: 5px 0; display: inline-flex; align-items: center;}
        .star { width: 16px; height: 16px; display: inline-block; }
        .star-5-icon { width: 40px; height: 40px; color: var(--gold); filter: drop-shadow(2px 2px 0 var(--pink)); }
        .star-5-label { font-size: 1.5em; font-weight: bold; margin-left: 10px; text-transform: uppercase; letter-spacing: 2px;}

        /* Gráficos */
        .chart-container { width: 100%; height: 400px; margin-bottom: 40mm; background: white; border: 2px solid var(--black); padding: 10px; box-sizing: border-box;}
        
        /* Loading Overlay */
        #loading {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9);
            display: none; justify-content: center; align-items: center; z-index: 999; flex-direction: column;
        }
        .spinner { width: 50px; height: 50px; border: 5px solid var(--black); border-top-color: var(--pink); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>

    <div id="loading">
        <div class="spinner"></div>
        <h2 style="margin-top: 20px; font-family: sans-serif;">Gerando Catálogo Mondrian...</h2>
        <p>Isso pode levar alguns segundos dependendo do tamanho da coleção.</p>
    </div>

    <div class="app-ui" id="ui-panel">
        <h1>Catálogo de Coleção</h1>
        <p>Carregue sua planilha CSV contendo o acervo. O sistema irá gerar um PDF com design inspirado em Mondrian, categorizado e com estatísticas.</p>
        
        <input type="file" id="csv-file" accept=".csv" style="display: none;">
        <div class="upload-area" onclick="document.getElementById('csv-file').click()">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <h3>Clique para selecionar seu arquivo .csv</h3>
            <p id="file-name">Nenhum arquivo selecionado</p>
        </div>

        <div style="margin-bottom: 20px;">
            <label for="owner-name" style="font-weight: bold; text-transform: uppercase;">Dono do Acervo:</label>
            <input type="text" id="owner-name" placeholder="Digite seu nome para a capa" style="width: 100%; padding: 12px; border: var(--line-weight) solid var(--black); margin-top: 5px; box-sizing: border-box; font-size: 1.1em; font-family: inherit;">
        </div>

        <button id="btn-generate" disabled>Gerar Catálogo PDF</button>
    </div>

    <!-- Container onde o HTML do PDF será montado -->
    <div id="pdf-container"></div>

    <script>
        let globalData = [];

        // Ícones SVG para as notas
        const starFull = `<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        const starHalf = `<svg class="star" viewBox="0 0 24 24" fill="url(#halfGrad)"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path stroke="currentColor" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        const starEmpty = `<svg class="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        const starGold = `<svg class="star-5-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

        document.getElementById('csv-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('file-name').innerText = file.name;
                document.getElementById('btn-generate').disabled = false;
                
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        globalData = results.data;
                    }
                });
            }
        });

        document.getElementById('btn-generate').addEventListener('click', () => {
            if(globalData.length > 0) {
                document.getElementById('loading').style.display = 'flex';
                // Pequeno delay para a UI de loading aparecer antes do processamento pesado
                setTimeout(() => {
                    generateCatalog(globalData);
                }, 100);
            }
        });

        // Função para classificar o tipo do item
        function getCategoryInfo(tipo) {
            const t = (tipo || '').toLowerCase().trim();
            if (['livro', 'quadrinho', 'revista', 'hq', 'mangá', 'hqs'].includes(t)) return { class: '1 LIVROS', sub: t };
            if (['vinil', 'cd', 'fita cassete', 'k7', 'lp', 'disco'].includes(t)) return { class: '2 DISCOS', sub: t };
            if (['vhs', 'dvd', 'blu-ray', 'filme', 'video', 'vídeo'].includes(t)) return { class: '3 VÍDEO', sub: t };
            if (['mega drive', 'snes', 'wii', 'ps1', 'ps2', 'ps4', 'game', 'jogo', 'nintendo'].includes(t)) return { class: '4 GAMES', sub: t };
            return { class: '5 OUTROS', sub: t };
        }

        function renderStars(notaStr) {
            let nota = parseFloat((notaStr || '0').replace(',', '.'));
            if (isNaN(nota)) nota = 0;

            if (nota === 5) {
                return `<div class="stars-container">${starGold} <span class="star-5-label">Masterpiece</span></div>`;
            }

            let html = '<div class="stars-container">';
            for (let i = 1; i <= 5; i++) {
                if (nota >= i) html += starFull;
                else if (nota >= i - 0.5) html += starHalf;
                else html += starEmpty;
            }
            html += ` <span style="margin-left: 5px; font-weight:bold; font-size: 0.9em">${nota}</span></div>`;
            return html;
        }

        function createCoverPage(title, isMain = false, ownerName = '', dateStr = '') {
            let extraHtml = '';
            if (isMain) {
                extraHtml = `
                    <div style="margin-top: 20px; border-top: var(--line-weight) solid var(--black); padding-top: 10px; text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: bold;">${ownerName || 'Acervo'}</div>
                        <div style="font-size: 1.2rem;">${dateStr}</div>
                    </div>
                `;
            }

            return `
                <div class="pdf-page">
                    <div class="mondrian-cover">
                        <div class="mondrian-box box-pink"></div>
                        <div class="mondrian-box"></div>
                        <div class="mondrian-box box-cyan"></div>
                        
                        <div class="mondrian-box"></div>
                        <div class="title-box">
                            <h2>${title}</h2>
                            ${extraHtml}
                        </div>
                        
                        <div class="mondrian-box box-gold"></div>
                        <div class="mondrian-box"></div>
                        <div class="mondrian-box box-pink"></div>
                    </div>
                </div>
            `;
        }

        function createItemCard(item) {
            let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
            let isStar5 = nota === 5;
            let cardClass = isStar5 ? 'catalog-item star-5' : 'catalog-item';
            
            // Tratamento da imagem
            let imgHtml = '';
            if (item['URL da Capa']) {
                // crossOrigin anônimo e fallback pra evitar que o html2pdf trave por CORS
                imgHtml = `<img src="${item['URL da Capa']}" class="item-image" crossorigin="anonymous" onerror="this.style.display='none'" alt="Capa">`;
            }

            // Mapeando todas as infos (ignorar vazias para ficar limpo, mas garantir que TODAS constem se existirem)
            let detailsHtml = '';
            const fieldsToSkip = ['Título', 'Tipo', 'Autor/Desenvolvedor', 'Ano', 'Editora/Gravadora', 'Nota', 'Descrição', 'URL da Capa'];
            
            for (let key in item) {
                if (!fieldsToSkip.includes(key) && item[key] && item[key].trim() !== '') {
                    detailsHtml += `<div class="detail-row"><span class="detail-label">${key}:</span> <span style="text-align:right; max-width:60%; word-break: break-word;">${item[key]}</span></div>`;
                }
            }
            
            // Garantir que a URL apareça escrita, já que é uma info da planilha
            if (item['URL da Capa']) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">URL Capa:</span> <span style="font-size: 0.6em; text-align:right; max-width:60%; word-break: break-all;">${item['URL da Capa']}</span></div>`;
            }

            let innerContent = `
                <div class="item-header">
                    <div class="item-title">${item['Título'] || 'Sem Título'} <span class="badge">${item['Tipo'] || 'N/A'}</span></div>
                    <div class="item-meta">
                        ${item['Autor/Desenvolvedor'] ? `<strong>${item['Autor/Desenvolvedor']}</strong> • ` : ''}
                        ${item['Ano'] ? `${item['Ano']} • ` : ''}
                        ${item['Editora/Gravadora'] || ''}
                    </div>
                    ${renderStars(item['Nota'])}
                </div>
                <div style="display: flex; gap: 15px; flex-grow: 1; align-items: flex-start;">
                    ${imgHtml}
                    <div style="flex-grow: 1;">
                        ${item['Descrição'] ? `<div class="item-desc">${item['Descrição']}</div>` : ''}
                        <div class="item-details">${detailsHtml}</div>
                    </div>
                </div>
            `;

            if(isStar5) {
                return `<div class="${cardClass}"><div class="star-5-content" style="flex-direction: ${imgHtml ? 'row' : 'column'}">${innerContent}</div></div>`;
            }
            return `<div class="${cardClass}">${innerContent}</div>`;
        }

        async function generateCatalog(data) {
            const container = document.getElementById('pdf-container');
            container.innerHTML = '';
            container.style.display = 'block';
            document.getElementById('ui-panel').style.display = 'none';

            const ownerName = document.getElementById('owner-name').value;
            const dateStr = new Date().toLocaleDateString('pt-BR');

            // 1. Agrupar dados
            const grouped = {};
            data.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']).class;
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(item);
            });

            // 2. Ordenar chaves e gerar páginas
            const sortedCategories = Object.keys(grouped).sort();
            
            let fullHtml = '';
            let pageCounter = 1;

            // Capa Principal (Não conta na numeração)
            fullHtml += createCoverPage('Acervo Pessoal', true, ownerName, dateStr);

            sortedCategories.forEach(cat => {
                // Ordenar itens alfabeticamente para o dicionário funcionar
                grouped[cat].sort((a, b) => (a['Título'] || '').localeCompare(b['Título'] || ''));

                // Folha de Rosto da Categoria (Não mostra numeração)
                fullHtml += createCoverPage(cat);
                
                // Paginação Manual Estrita para controle de Cabeçalho e Rodapé
                const MAX_WEIGHT = 8; // Uma página comporta 4 linhas (8 itens normais ou 4 star-5)
                let currentWeight = 0;
                let pageItems = [];

                const flushPage = () => {
                    if (pageItems.length === 0) return;
                    
                    const firstTitle = pageItems[0]['Título'] || '?';
                    const lastTitle = pageItems[pageItems.length-1]['Título'] || '?';
                    const firstLetter = firstTitle.charAt(0).toUpperCase();
                    const lastLetter = lastTitle.charAt(0).toUpperCase();
                    const dictStr = firstLetter === lastLetter ? firstLetter : `${firstLetter} - ${lastLetter}`;
                    
                    fullHtml += `<div class="pdf-page" style="padding: 25mm 15mm 25mm 15mm;">`;
                    fullHtml += `<div class="page-header"><span>${cat}</span><span>${dictStr}</span></div>`;
                    fullHtml += `<div class="catalog-grid" style="height: 240mm;">`; // Limite exato da grade
                    
                    pageItems.forEach(item => {
                        fullHtml += createItemCard(item);
                    });
                    
                    fullHtml += `</div>`;
                    fullHtml += `<div class="page-footer">${pageCounter}</div>`;
                    fullHtml += `</div>`;
                    
                    pageCounter++;
                    pageItems = [];
                    currentWeight = 0;
                };

                grouped[cat].forEach(item => {
                    let nota = parseFloat((item['Nota'] || '0').replace(',', '.'));
                    let weight = (nota === 5) ? 2 : 1; // Star 5 ocupa a linha toda (peso 2)
                    
                    // Se o item não couber na página atual, gera a página e reseta
                    if (currentWeight + weight > MAX_WEIGHT) {
                        flushPage();
                    }
                    
                    pageItems.push(item);
                    currentWeight += weight;
                });
                
                // Descarrega os itens restantes na última página da categoria
                flushPage();
            });

            // 3. Página de Estatísticas
            fullHtml += `
                <div class="pdf-page" style="padding: 25mm 15mm 25mm 15mm;">
                    <h1 style="border-bottom: var(--line-weight) solid var(--black); text-transform: uppercase; margin-bottom: 30px;">Estatísticas do Acervo</h1>
                    <div class="chart-container"><canvas id="chartType"></canvas></div>
                    <div class="chart-container"><canvas id="chartStatus"></canvas></div>
                    <div class="page-footer">${pageCounter}</div>
                </div>
            `;

            container.innerHTML = fullHtml;

            // 4. Renderizar Gráficos (desativando animações para o PDF pegar o gráfico pronto)
            renderCharts(data);

            // 5. Iniciar HTML2PDF
            const opt = {
                margin:       0,
                filename:     'Catalogo_Colecao.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Esperar imagens carregarem ou falharem antes de gerar o PDF
            await new Promise(r => setTimeout(r, 2000)); 

            html2pdf().set(opt).from(container).save().then(() => {
                // Restaura a UI
                document.getElementById('loading').style.display = 'none';
                document.getElementById('ui-panel').style.display = 'block';
                container.style.display = 'none';
            }).catch(err => {
                console.error(err);
                alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
                document.getElementById('loading').style.display = 'none';
                document.getElementById('ui-panel').style.display = 'block';
                container.style.display = 'none';
            });
        }

        function renderCharts(data) {
            // Contagem por Categoria
            const catCount = {};
            const statusCount = {};

            data.forEach(item => {
                const cat = getCategoryInfo(item['Tipo']).class;
                catCount[cat] = (catCount[cat] || 0) + 1;
                
                const stat = item['Status'] || 'Sem Status';
                statusCount[stat] = (statusCount[stat] || 0) + 1;
            });

            Chart.defaults.font.family = "'Helvetica Neue', Arial, sans-serif";
            Chart.defaults.color = "#000";

            new Chart(document.getElementById('chartType'), {
                type: 'bar',
                data: {
                    labels: Object.keys(catCount),
                    datasets: [{
                        label: 'Quantidade por Suporte',
                        data: Object.values(catCount),
                        backgroundColor: ['#FF007F', '#00FFFF', '#FFD700', '#000000', '#cccccc'],
                        borderColor: '#000',
                        borderWidth: 2
                    }]
                },
                options: {
                    animation: false,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, title: { display: true, text: 'Distribuição do Acervo por Suporte', font: { size: 18 } } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });

            new Chart(document.getElementById('chartStatus'), {
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
                options: {
                    animation: false,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' }, title: { display: true, text: 'Status de Consumo/Progresso', font: { size: 18 } } }
                }
            });
        }
    </script>
</body>
</html>
