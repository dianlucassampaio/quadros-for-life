function showLoader() { document.getElementById('global-loader').style.display = 'flex'; }
function hideLoader() { document.getElementById('global-loader').style.display = 'none'; }

let itensCarrinho = [];
        let clienteEmMemoria = null;

        function mascaraTelefone(input) {
            let v = input.value.replace(/\D/g, "");
            v = v.substring(0, 11);
            if(v.length === 0) input.value = '';
            else if(v.length <= 2) input.value = '(' + v;
            else if(v.length <= 6) input.value = '(' + v.substring(0,2) + ') ' + v.substring(2);
            else if(v.length <= 10) input.value = '(' + v.substring(0,2) + ') ' + v.substring(2,6) + '-' + v.substring(6);
            else input.value = '(' + v.substring(0,2) + ') ' + v.substring(2,7) + '-' + v.substring(7);
        }
        
        function validarEmail(email) {
            if(!email) return true;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        }

        function alternarTabCliente(tab) {
            if(tab === 'existente') {
                document.getElementById('tab-cliente-existente').style.display = 'block';
                document.getElementById('tab-cliente-novo').style.display = 'none';
                document.getElementById('btn-tab-existente').style.borderColor = 'var(--primary)';
                document.getElementById('btn-tab-existente').style.color = 'var(--primary)';
                document.getElementById('btn-tab-novo').style.borderColor = 'var(--border)';
                document.getElementById('btn-tab-novo').style.color = 'var(--text-main)';
                carregarTabelaClientesCompleta();
            } else {
                document.getElementById('tab-cliente-existente').style.display = 'none';
                document.getElementById('tab-cliente-novo').style.display = 'block';
                document.getElementById('btn-tab-existente').style.borderColor = 'var(--border)';
                document.getElementById('btn-tab-existente').style.color = 'var(--text-main)';
                document.getElementById('btn-tab-novo').style.borderColor = 'var(--primary)';
                document.getElementById('btn-tab-novo').style.color = 'var(--primary)';
            }
        }

        let listaClientesCache = [];
        
        function carregarTabelaClientesCompleta() {
            fetch('/clientes').then(r => r.json()).then(clientes => {
                listaClientesCache = clientes;
                renderizarListaClientes(clientes);
            });
        }

        function filtrarListaClientes() {
            const termo = document.getElementById('filtro-cliente').value.toLowerCase();
            const filtrados = listaClientesCache.filter(c => c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo));
            renderizarListaClientes(filtrados);
        }

        function renderizarListaClientes(clientes) {
            const tbody = document.querySelector('#tabela-clientes-full tbody');
            if (clientes.length === 0) {
                tbody.innerHTML = '<tr><td style="padding:15px; text-align:center; color:var(--text-light);">Nenhum cliente encontrado.</td></tr>';
            } else {
                tbody.innerHTML = clientes.map(c => `
                    <tr style="border-bottom:1px solid var(--border); cursor:pointer;" onclick="selecionarClienteExistente(${c.id}, '${c.nome.replace(/'/g, "\\'")}', '${c.telefone}', '${c.email||''}', '${c.endereco ? c.endereco.replace(/'/g, "\\'") : ''}')">
                        <td style="padding:12px; background:var(--surface);"><strong>${c.nome}</strong><br><span style="color:var(--text-light); font-size:11px;">${c.telefone}</span></td>
                        <td style="padding:12px; text-align:right; background:var(--surface);"><button class="btn-close" style="padding:4px 8px; font-size:12px;">Continuar ➔</button></td>
                    </tr>
                `).join('');
            }
        }

        function abrirModalCliente() {
            if(document.getElementById('modalOP').style.display === 'flex') document.getElementById('modalOP').style.display = 'none';
            document.getElementById('modalCliente').style.display = 'flex';
            
            document.getElementById('tel').value = '';
            document.getElementById('nome').value = '';
            document.getElementById('email').value = '';
            document.getElementById('endereco').value = '';
            if(document.getElementById('filtro-cliente')) document.getElementById('filtro-cliente').value = '';
            
            document.getElementById('tab-cliente-existente').style.display = 'none';
            document.getElementById('tab-cliente-novo').style.display = 'none';
            document.getElementById('btn-tab-existente').style.borderColor = 'var(--border)';
            document.getElementById('btn-tab-existente').style.color = 'var(--text-main)';
            document.getElementById('btn-tab-novo').style.borderColor = 'var(--border)';
            document.getElementById('btn-tab-novo').style.color = 'var(--text-main)';
        }

        function selecionarClienteExistente(id, n, t, e, end) {
            clienteEmMemoria = { id: id, nome: n, telefone: t, email: e, endereco: end };
            avancarParaCarrinho();
        }

        function avancarClienteNovo() {
            const tel = document.getElementById('tel').value;
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const endereco = document.getElementById('endereco').value;

            if(!nome || nome.trim().length <= 2) { mostrarToast("⚠ Preencha o nome corretamente (mínimo 3 letras)."); return; }
            if(!tel || tel.replace(/\D/g, "").length < 10) { mostrarToast("⚠ Preencha o telefone completo com DDD válido."); return; }
            if(email && email.trim() !== '' && !validarEmail(email)) { mostrarToast("⚠ O e-mail digitado não está em um formato válido."); return; }
            if(!endereco || endereco.trim().length <= 5) { mostrarToast("⚠ Preencha o endereço completo."); return; }

            clienteEmMemoria = { nome: nome.trim(), telefone: tel, email: email ? email.trim() : null, endereco: endereco.trim() };
            avancarParaCarrinho();
        }

        function avancarParaCarrinho() {
            document.getElementById('modalCliente').style.display = 'none';
            document.getElementById('modalOP').style.display = 'flex';
            
            document.getElementById('nome-cliente-resumo').innerText = clienteEmMemoria.nome;
            document.getElementById('tel-cliente-resumo').innerText = clienteEmMemoria.telefone;

            itensCarrinho = [];
            atualizarCarrinhoUI();
            document.getElementById('div-parcelas').style.display = 'none'; 
            document.getElementById('pagamento').value = 'A_VISTA_PIX';
            document.getElementById('parcelas').value = 1;
            document.getElementById('obs-calendario').value = '';
        }

        function voltarParaCliente() {
            document.getElementById('modalOP').style.display = 'none';
            abrirModalCliente();
        }

        function fecharModal() { document.getElementById('modalOP').style.display = 'none'; document.getElementById('modalCliente').style.display = 'none'; }

        function adicionarItem() {
            const prod = document.getElementById('produto').value;
            const tam = prod.split('|')[0];
            const molVal = prod.split('|')[1];
            const qtd = parseInt(document.getElementById('qtd').value);
            const nomeLindo = document.getElementById('produto').options[document.getElementById('produto').selectedIndex].text.split('-')[0].trim();
            
            let precoUnitario = 0;
            if(tam === 'A3') precoUnitario += 50; else precoUnitario += 30;
            if(molVal.includes('MADEIRA')) precoUnitario += 100; else precoUnitario += 50;
            
            itensCarrinho.push({ tamanho: tam,  tipoMoldura: molVal, descricaoFina: nomeLindo, quantidade: qtd, valorUnitario: precoUnitario });
            atualizarCarrinhoUI();
        }

        function removerDoCarrinho(index) {
            itensCarrinho.splice(index, 1);
            atualizarCarrinhoUI();
        }

        function atualizarCarrinhoUI() {
            const div = document.getElementById('lista-carrinho');
            if(itensCarrinho.length === 0) div.innerHTML = 'O carrinho está vazio.';
            else div.innerHTML = itensCarrinho.map((it, idx) => 
                `<div style="display:flex; justify-content:space-between; margin-bottom:6px; padding:4px 0; border-bottom: 1px dotted var(--border);">
                    <span>${it.quantidade}x <strong>${it.descricaoFina}</strong> <span style="font-size:11px; color:var(--text-light)">(R$ ${it.valorUnitario.toFixed(2)})</span></span>
                    <div>
                        <span style="color:var(--text-light); font-weight:600; margin-right:10px;">R$ ${(it.valorUnitario * it.quantidade).toFixed(2)}</span>
                        <button onclick="removerDoCarrinho(${idx})" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer;" title="Remover item">✕</button>
                    </div>
                </div>`
            ).join('');
            atualizarTotalTudo();
        }

        function atualizarTotalTudo() {
            let soma = 0; let totalQuadros = 0;
            itensCarrinho.forEach(it => { soma += (it.valorUnitario * it.quantidade); totalQuadros += it.quantidade; });
            
            const pag = document.getElementById('pagamento').value;
            let par = parseInt(document.getElementById('parcelas').value);
            
            const divPar = document.getElementById('div-parcelas');
            if(pag.startsWith('PARCELADO')) divPar.style.display = 'block';
            else { divPar.style.display = 'none'; document.getElementById('parcelas').value = 1; par = 1; }

            if(pag.startsWith('PARCELADO') && par >= 5) soma = soma * 1.032;
            if(pag.startsWith('PARCELADO') && par >= 9) soma = soma * 1.0013;
            
            document.getElementById('total-estimado').innerText = soma.toFixed(2);
            
            if(par > 1) document.getElementById('detalhe-parcela').innerText = `(${par}x de R$ ${(soma/par).toFixed(2)})`;
            else document.getElementById('detalhe-parcela').innerText = '';

            const lblPrazo = document.getElementById('prazo-dias');
            if(totalQuadros === 0) { lblPrazo.innerText = '0 dias'; lblPrazo.style.color = 'var(--text-light)'; }
            else if (totalQuadros <= 4) { lblPrazo.innerText = 'Até 4 dias úteis'; lblPrazo.style.color = 'var(--color-faturamento)'; }
            else if (totalQuadros < 10) { lblPrazo.innerText = 'Até 6 dias úteis'; lblPrazo.style.color = 'var(--color-producao)'; }
            else { lblPrazo.innerText = 'Até 10 dias úteis'; lblPrazo.style.color = 'var(--color-expedicao)'; }
        }

        function salvarOP() {
            if(itensCarrinho.length === 0) { mostrarToast("Adicione quadros na OP!"); return; }
            if(!clienteEmMemoria) { mostrarToast("Erro: Cliente não foi identificado!"); voltarParaCliente(); return; }

            const cliente = {
                nome: clienteEmMemoria.nome, telefone: clienteEmMemoria.telefone,
                email: clienteEmMemoria.email, endereco: clienteEmMemoria.endereco
            };
            if(clienteEmMemoria.id) cliente.id = parseInt(clienteEmMemoria.id);

            let totalQuadros = itensCarrinho.reduce((a, it) => a + it.quantidade, 0);
            let prazoParaJava = 6;
            if (totalQuadros <= 4) prazoParaJava = 4;
            else if (totalQuadros >= 10) prazoParaJava = 10;

            // Calcula Data Corretamente (Evita erro de Timezone no Banco)
            let dt = new Date();
            dt.setDate(dt.getDate() + prazoParaJava);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            const dataIso = dt.toISOString().split('T')[0];

            const op = {
                cliente: cliente, canalAtendimento: 'BALCAO', formaPagamento: document.getElementById('pagamento').value,
                parcelas: parseInt(document.getElementById('parcelas').value), itens: itensCarrinho,
                dataEntregaEstimada: dataIso, observacaoCalendario: document.getElementById('obs-calendario').value
            };

            showLoader(); fetch('/ops', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(op) })
            .then(r => r.json()).then(novaOp => {
                hideLoader(); mostrarToast("✨ O.P. " + (novaOp.codigoRastreio || ("#"+novaOp.id)) + " Inserida!");
                fecharModal(); hideLoader(); carregarKanban();
            });
        }

        function carregarKanban() {
            ['ATENDIMENTO','FATURAMENTO','PRODUCAO','EXPEDICAO','ENTREGA'].forEach(id => {
                document.getElementById(id).innerHTML = '';
            });

            fetch('/ops').then(r => r.json()).then(ops => {
                ops.forEach(op => {
                    // Item 1 (Requisao 1): OP só some quando for etapa de Entrega E a caixinha OK marcada!
                    if (op.etapaAtual === 'ENTREGA' && op.etapaOk) return;

                    const col = document.getElementById(op.etapaAtual || 'ATENDIMENTO');
                    if (col) {
                        const totalQuadros = op.itens ? op.itens.reduce((acc, it) => acc + it.quantidade, 0) : 0;
                        let corBorda = 'var(--primary)';
                        if(op.etapaAtual === 'ATENDIMENTO') corBorda = 'var(--color-atendimento)';
                        if(op.etapaAtual === 'FATURAMENTO') corBorda = 'var(--color-faturamento)';
                        if(op.etapaAtual === 'PRODUCAO') corBorda = 'var(--color-producao)';
                        if(op.etapaAtual === 'EXPEDICAO') corBorda = 'var(--color-expedicao)';
                        if(op.etapaAtual === 'ENTREGA') corBorda = 'var(--color-entrega)';
                        
                        const codShow = op.codigoRastreio ? op.codigoRastreio : '#OP-'+op.id;
                        let formatoPtBr = (op.formaPagamento || 'S/N').replace(/_/g, ' '); 
                        
                        // Formata Data Entrega pt-BR (Item 6)
                        let textoPrazo = 'Não agendado';
                        if (op.dataEntregaEstimada) {
                            textoPrazo = op.dataEntregaEstimada.split('-').reverse().join('/');
                        }
                        
                        col.innerHTML += `
                            <div class="card" style="border-left-color: ${corBorda}; position: relative;" draggable="true" ondragstart="drag(event, ${op.id})" id="card-${op.id}" onclick="abrirDetalhesOP(${op.id})">
                                <div style="position:absolute; top:8px; right:8px; display:flex;">
                                    <button onclick="event.stopPropagation(); excluirOP(${op.id})" title="Apagar O.P permanentemente" style="background:none; border:none; color:#ef4444; cursor:pointer;" aria-label="Apagar OP">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                                <div class="card-header" style="margin-right:25px; display:flex; flex-direction:column; align-items:flex-start; gap:4px;">
                                    <span style="background:var(--bg); padding:2px 6px; border-radius:4px; font-weight:700; color:var(--primary); font-family:monospace; font-size:14px;">${codShow}</span>
                                    <span style="font-size:11px; font-weight:700; color:var(--text-main);">Vendedor(a): ${op.nomeVendedor || 'Desconhecido'}</span>
                                    <span style="font-size:11px; text-transform:capitalize; font-weight:600; color:var(--text-light);">${formatoPtBr.toLowerCase()} (${op.parcelas}x)</span>
                                </div>
                                <div class="card-title">${op.cliente ? op.cliente.nome : 'S/N'}</div>
                                <div style="font-size:12px; color:#6b7280; margin-bottom:10px;">${totalQuadros == 1 ? '1 quadro' : totalQuadros + ' quadros'}</div>
                                
                                <!-- Item 6: Prazo escrito no card (Req 6) -->
                                <div style="font-size:11px; font-weight:600; color:var(--text-light); margin-top:5px; border-top:1px dashed #e5e7eb; padding-top:6px; margin-bottom:8px;">
                                    📅 Prazo / Entrega: <strong style="color:var(--primary)">${textoPrazo}</strong>
                                </div>

                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <div class="card-price">R$ ${op.valorTotal ? op.valorTotal.toFixed(2) : '0.00'}</div>
                                    <label onclick="event.stopPropagation();" style="display:flex; align-items:center; cursor:pointer;" title="Marcar esta etapa como finalizada">
                                        <input type="checkbox" class="ok-checkbox" style="margin:0 6px 0 0;" ${op.etapaOk ? 'checked' : ''} onchange="toggleOk(event, ${op.id})">
                                        <span style="font-size:12px; font-weight:700; color:var(--text-main)">Concluir</span>
                                    </label>
                                </div>
                            </div>
                        `;
                    }
                });
            });
        }

        function abrirDetalhesOP(id) {
            fetch('/ops').then(r => r.json()).then(ops => {
                const op = ops.find(o => o.id === id);
                if(!op) return;
                document.getElementById('modalDetalhes').style.display = 'flex';
                
                const badgetinhas = {
                    'ATENDIMENTO': '<span style="background:var(--color-atendimento); color:white; padding: 2px 6px; border-radius:4px; font-size:12px;">Atend.</span>',
                    'ENTREGA': '<span style="background:var(--color-entrega); color:white; padding: 2px 6px; border-radius:4px; font-size:12px;">Entrega</span>'
                };
                const statusBadge = badgetinhas[op.etapaAtual] || '<span style="background:var(--primary); color:white; padding: 2px 6px; border-radius:4px; font-size:12px;">'+op.etapaAtual+'</span>';

                const codShow = op.codigoRastreio ? op.codigoRastreio : '#OP-'+op.id;
                document.getElementById('detalhe-titulo').innerHTML = `Ordem ${codShow} ${statusBadge}`;
                let itensHtml = op.itens.map(it => `<li style="margin-bottom:4px;">${it.quantidade}x Moldura ${it.tipoMoldura.replace(/_/g,' ')} ${it.tamanho} </li>`).join('');
                
                document.getElementById('detalhe-conteudo').innerHTML = `
                    <div style="background:var(--bg); padding:10px; border-radius:8px; margin-bottom:15px; border:1px solid var(--border);">
                        <p style="margin:4px 0;"><strong>👤 Cliente:</strong> ${op.cliente ? op.cliente.nome : 'S/C'}</p>
                        <p style="margin:4px 0;"><strong>📞 Contato:</strong> ${op.cliente ? op.cliente.telefone : ''}</p>
                        <p style="margin:4px 0;"><strong>💼 Vendedor:</strong> ${op.nomeVendedor || 'Desconhecido'}</p>
                        <p style="margin:4px 0;"><strong>📍 Endereço:</strong> ${op.cliente ? op.cliente.endereco : '-'}</p>
                    </div>
                    <ul style="padding-left:20px; color:var(--primary); font-weight:600;">${itensHtml}</ul>
                    <hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">
                    <p><strong>💰 Total da OP:</strong> <span style="color:#10b981; font-weight:700; font-size:18px;">R$ ${op.valorTotal.toFixed(2)}</span></p>
                    <p><strong>💳 Pagamento:</strong> ${(op.formaPagamento || '').replace(/_/g, ' ')} (${op.parcelas}x)</p>
                    <p><strong>📅 Prazo (Agendamento):</strong> ${op.dataEntregaEstimada ? op.dataEntregaEstimada.split('-').reverse().join('/') : 'Não possui'}</p>
                    <p><strong>💬 Anotação Pessoal:</strong> ${op.observacaoCalendario || 'Nenhuma'}</p>
                `;
            });
        }

        // Calendário Histórico B2B (Fase 4)
        let dataFocoCalendario = new Date();

        function mudarMes(direcao) {
            if(direcao === 0) dataFocoCalendario = new Date();
            else dataFocoCalendario.setMonth(dataFocoCalendario.getMonth() + direcao);
            abrirCalendario(true);
        }

        function abrirCalendario(mantemVisor = false) {
            if(!mantemVisor) dataFocoCalendario = new Date();
            document.getElementById('modalCalendario').style.display = 'flex';
            fetch('/ops').then(r => r.json()).then(ops => {
                const today = dataFocoCalendario;
                const anoAtual = today.getFullYear();
                const mesAtual = today.getMonth();
                
                const nomeDosMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
                document.getElementById('titulo-mes-calendario').innerText = `${nomeDosMeses[mesAtual]} / ${anoAtual}`;

                // Regras Mês
                const primeiroDiaDaSemana = new Date(anoAtual, mesAtual, 1).getDay(); // 0(Dom) a 6(Sab)
                const ultimoDiaDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

                let html = '<div class="cal-header">Dom</div><div class="cal-header">Seg</div><div class="cal-header">Ter</div><div class="cal-header">Qua</div><div class="cal-header">Qui</div><div class="cal-header">Sex</div><div class="cal-header">Sáb</div>';
                
                // Preenche buracos do mês passado
                for(let i=0; i < primeiroDiaDaSemana; i++) { html += `<div style="background:var(--bg); border-radius:6px; opacity:0.5;"></div>`; }

                for(let dia = 1; dia <= ultimoDiaDoMes; dia++) {
                    const strMes = String(mesAtual+1).padStart(2,'0');
                    const strDia = String(dia).padStart(2,'0');
                    const dateStr = `${anoAtual}-${strMes}-${strDia}`;

                    let diaOps = ops.filter(o => o.dataEntregaEstimada === dateStr);
                    
                    const renderCard = (o) => {
                        // Item 2: O verde do calendário só aparece no ENTREGA *E* OK! Senão vermelho.
                        let isGreen = (o.etapaAtual === 'ENTREGA' && o.etapaOk);
                        let color = isGreen ? '#dcfce7' : '#fee2e2';
                        let border = isGreen ? '#10b981' : '#ef4444';
                        let textC = isGreen ? '#065f46' : '#991b1b';
                        return `<div style="background:${color}; border:1px solid ${border}; color:${textC}; padding:5px; margin:2px 0; border-radius:4px; font-size:11px; cursor:pointer; line-height:1.2;" onclick="abrirDetalhesOP(${o.id});">
                            <strong>#${o.id}</strong>-${o.cliente?o.cliente.nome.substring(0,8):'S/C'}<br>
                            <span style="font-size:9px; font-weight:600;">Vend: ${o.nomeVendedor || 'S/N'}</span><br>
                            <span style="font-size:9px">${o.observacaoCalendario ? o.observacaoCalendario.substring(0,18)+'...' : ''}</span>
                        </div>`;
                    };

                    let cardsHtml = '';
                    if (diaOps.length > 0) {
                        // Item 3 (Múltiplas Ops com Collapse / setinha)
                        if (diaOps.length <= 2) {
                            cardsHtml = diaOps.map(renderCard).join('');
                        } else {
                            // Deixa as duas 2 visiveis
                            const topo = diaOps.slice(0, 2);
                            const sobra = diaOps.slice(2);
                            cardsHtml = topo.map(renderCard).join('') + 
                                `<details>
                                    <summary class="btn-summary" title="Ver mais entregas">▼</summary>
                                    ${sobra.map(renderCard).join('')}
                                 </details>`;
                        }
                    }

                    const dtHj = new Date(); dtHj.setMinutes(dtHj.getMinutes() - dtHj.getTimezoneOffset());
                    let isToday = (dateStr === dtHj.toISOString().split('T')[0]);
                    let cellBg = isToday ? 'background: #eff6ff; border:2px solid var(--primary);' : 'background: var(--surface); border:1px solid var(--border);';

                    html += `<div style="${cellBg} padding:6px; border-radius:6px; min-height:90px; display:flex; flex-direction:column; gap:2px;">
                        <span style="font-weight:700; font-size:12px; text-align:right; display:block; color: ${isToday? 'var(--primary)':'#6b7280'};">${dia}</span>
                        ${cardsHtml}
                    </div>`;
                }
                document.getElementById('calendar-grid').innerHTML = html;
            });
        }

        function toggleOk(ev, opId) {
            const isOk = ev.target.checked;
            fetch('/ops/' + opId + '/ok', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ok: isOk}) })
            .then(async r => { 
                if(r.ok) carregarKanban(); 
                else { 
                    let err = await r.json(); 
                    mostrarToast(err.erro || "Erro de Conexão"); 
                    ev.target.checked = !isOk; 
                } 
            });
        }

        function excluirOP(opId) {
            if(confirm("Deseja apagar permanentemente? Essa ação não pode ser desfeita.")) {
                fetch('/ops/' + opId, { method: 'DELETE' }).then(async r => { 
                    if(r.ok) carregarKanban(); 
                    else { let err = await r.json(); mostrarToast(err.erro || "Erro!"); }
                })
            }
        }

        function drag(ev, opId) { ev.dataTransfer.setData("opId", opId); }
        function allowDrop(ev) { ev.preventDefault(); }
        function drop(ev, novaEtapa) {
            ev.preventDefault();
            const opId = ev.dataTransfer.getData("opId");
            fetch('/ops/' + opId + '/etapa', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({novaEtapa: novaEtapa}) })
            .then(async r => { if(!r.ok) { const data = await r.json(); mostrarToast(data.erro); } carregarKanban(); });
        }

        // ---------- LÓGICA DE LOGIN E SEGURANÇA (Fases 3 e 4) ----------
        let loggedUserCache = null;

        window.onload = function() {
            if(localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark-theme');
                const btnTh = document.getElementById('btn-theme-toggle');
                if(btnTh) btnTh.innerText = '☀️ Modo Padrão Claro';
            }

            fetch('/auth/me').then(async r => {
                if (r.ok) {
                    document.getElementById('modalLogin').style.display = 'none';
                    loggedUserCache = await r.json();
                    configurarPainelUser(loggedUserCache);
                    carregarKanban();
                } else {
                    document.getElementById('modalLogin').style.display = 'flex';
                }
            }).catch(e => {
                document.getElementById('modalLogin').style.display = 'flex';
            });
        };
        
        function configurarPainelUser(user) {
            document.getElementById('dropdown-name').innerText = user.login;
            
            let iniciais = user.login.substring(0, 2).toUpperCase();
            if (user.login.includes(' ')) {
                const partes = user.login.split(' ');
                iniciais = (partes[0][0] + partes[1][0]).toUpperCase();
            }
            document.getElementById('avatarIcon').innerText = iniciais;
            
            document.getElementById('btn-novo-vendedor').style.display = user.isAdmin ? 'inline-flex' : 'none';
            if(document.getElementById('btn-visao-financeira')) {
                document.getElementById('btn-visao-financeira').style.display = user.isAdmin ? 'block' : 'none';
            }
        }

        function toggleDropdown() {
            let dm = document.getElementById('userMenu');
            dm.style.display = dm.style.display === 'flex' ? 'none' : 'flex';
        }

        document.addEventListener('click', function(e) {
            if(!e.target.closest('#avatarIcon') && !e.target.closest('#userMenu')) {
                const dm = document.getElementById('userMenu');
                if(dm) dm.style.display = 'none';
            }
        });

        function toggleDarkMode() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            document.getElementById('btn-theme-toggle').innerText = isDark ? '☀️ Modo Padrão Claro' : '🌗 Modo Dark';
        }

        function abrirDetalhesMinhasOps(id) {
            document.getElementById('modalMinhasOps').style.display = 'none';
            abrirDetalhesOP(id);
        }

        function abrirMinhasOps() {
            document.getElementById('userMenu').style.display = 'none';
            document.getElementById('modalMinhasOps').style.display = 'flex';
            
            fetch('/ops').then(r => r.json()).then(ops => {
                const minhas = ops.filter(o => o.vendedorId === loggedUserCache.id);
                const ct = document.getElementById('lista-minhas-ops');
                
                if (minhas.length === 0) {
                    ct.innerHTML = '<p style="color:var(--text-light); text-align:center;">Você ainda não possui vendas registradas em seu nome.</p>';
                    return;
                }

                ct.innerHTML = minhas.map(op => {
                    const okE = op.etapaAtual === 'ENTREGA' && op.etapaOk;
                    const bg = okE ? '#dcfce7' : 'var(--bg)';
                    const corB = okE ? '#10b981' : 'var(--border)';
                    const tdColor = okE ? '#065f46' : 'var(--text-main)';
                    const codShow = op.codigoRastreio ? op.codigoRastreio : '#OP-'+op.id;
                    return `<div onclick="abrirDetalhesMinhasOps(${op.id})" style="background:${bg}; border:2px solid ${corB}; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" class="cal-card">
                        <div>
                            <div style="font-weight:700; color:${tdColor}; font-size:15px;">${codShow} - ${op.cliente ? op.cliente.nome : ''}</div>
                            <div style="font-size:12px; color:var(--text-light); margin-top:4px;">📅 Prz: ${op.dataEntregaEstimada ? op.dataEntregaEstimada.split('-').reverse().join('/') : '-'} &nbsp;|&nbsp; 🏷️ Etapa: ${op.etapaAtual}</div>
                        </div>
                        <div style="font-weight:bold; font-size:15px; color:var(--primary);">R$ ${(op.valorTotal||0).toFixed(2)}</div>
                    </div>`;
                }).reverse().join('');
            });
        }

        function fazerLogin() {
            const u = document.getElementById('logUser').value;
            const p = document.getElementById('logPass').value;
            showLoader(); fetch('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({login:u, senha:p}) })
            .then(async r => {
                hideLoader(); if (!r.ok) mostrarToast("❌ Acesso Negado: Usuário ou senha incorretos.");
                else {
                    document.getElementById('modalLogin').style.display = 'none';
                    const user = await r.json();
                    loggedUserCache = user;
                    configurarPainelUser(user);
                    document.getElementById('logUser').value = ''; document.getElementById('logPass').value = '';
                    carregarKanban();
                }
            });
        }
        
        function fazerLogout() {
            if(confirm("Deseja desconectar sua conta?")) {
                fetch('/auth/logout', { method:'POST' }).then(() => {
                    window.location.reload(); // Refresh completo pra limpar o cache e zerar a "tela branca"
                });
            }
        }

        function fazerRegistro() {
            const u = document.getElementById('regUser').value;
            const p = document.getElementById('regPass').value;
            if(!u || !p) { mostrarToast("Preencha ambos os campos!"); return; }
            fetch('/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({login:u, senha:p}) })
            .then(async r => {
                if (!r.ok) { let err = await r.json(); mostrarToast(err.erro); }
                else {
                    mostrarToast("✅ Vendedor habilitado no sistema!");
                    document.getElementById('modalRegister').style.display = 'none';
                    document.getElementById('regUser').value = ''; document.getElementById('regPass').value = '';
                }
            });
        }

// ==== Módulo de Notificações Toastify ====
function mostrarToast(mensagem, tipo = 'info') {
    let bgColor = "var(--primary)";
    if(mensagem.includes('❌') || mensagem.toLowerCase().includes('erro') || mensagem.includes('⚠')) {
        bgColor = "#ef4444"; // red
    } else if (mensagem.includes('✨') || mensagem.includes('✅')) {
        bgColor = "#10b981"; // green
    }

    Toastify({
        text: mensagem,
        duration: 3500,
        close: true,
        gravity: "bottom", // top or bottom
        position: "left", // left, center or right
        style: {
            background: bgColor,
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }
    }).showToast();
}

// ==== Módulo do Dashboard Financeiro (Chart.js) ====
let myChart = null;

window.plotarGraficoDashboard = function() {
    fetch('/ops').then(r => r.json()).then(ops => {
        let totais = {
            'ATENDIMENTO': 0,
            'FATURAMENTO': 0,
            'PRODUCAO': 0,
            'EXPEDICAO': 0,
            'ENTREGA': 0
        };
        let receitaTotalGeral = 0;

        ops.forEach(op => {
            if(!op.etapaAtual) op.etapaAtual = 'ATENDIMENTO';
            totais[op.etapaAtual] += (op.valorTotal || 0);
            receitaTotalGeral += (op.valorTotal || 0);
        });

        document.getElementById('receita-bruta-total').innerText = 'R$ ' + receitaTotalGeral.toFixed(2).replace('.',',');

        const ctx = document.getElementById('financeChart');
        if(!ctx) return;

        if(myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Atendimento', 'Faturamento', 'Produção', 'Expedição', 'Entrega'],
                datasets: [{
                    label: 'Valor Bruto Preso na Fase (R$)',
                    data: [totais['ATENDIMENTO'], totais['FATURAMENTO'], totais['PRODUCAO'], totais['EXPEDICAO'], totais['ENTREGA']],
                    backgroundColor: [
                        '#8b5cf6', // Atendimento
                        '#ec4899', // Faturamento
                        '#eab308', // Producao
                        '#3b82f6', // Expedicao
                        '#10b981'  // Entrega
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    });
};
