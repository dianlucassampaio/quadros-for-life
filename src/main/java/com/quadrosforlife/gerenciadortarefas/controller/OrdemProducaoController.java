package com.quadrosforlife.gerenciadortarefas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.quadrosforlife.gerenciadortarefas.model.OrdemProducao;
import com.quadrosforlife.gerenciadortarefas.model.Cliente;
import com.quadrosforlife.gerenciadortarefas.repository.OrdemProducaoRepository;
import com.quadrosforlife.gerenciadortarefas.repository.ClienteRepository;
import com.quadrosforlife.gerenciadortarefas.service.PedidoService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ops")
public class OrdemProducaoController {

    @Autowired
    private OrdemProducaoRepository opRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PedidoService calculador; // Nosso matemático financeiro em ação!

    @GetMapping
    public List<OrdemProducao> listarKanban() {
        return opRepository.findAll();
    }

    @PostMapping
    public OrdemProducao abrirNovaOP(@RequestBody OrdemProducao novaOp) {
        // Regra 11 e 12 do seu pedido: Cliente novo x Cliente de casa
        if (novaOp.getCliente() != null) {
            if (novaOp.getCliente().getId() == null) {
                // Se não tem ID, é gente nova, salva ele na tabela de clientes primeiro!
                Cliente clienteSalvo = clienteRepository.save(novaOp.getCliente());
                novaOp.setCliente(clienteSalvo);
            }
        }
        
        // Chama a nossa calculadora para aplicar juros e definir total (Regra 4 e 5)
        calculador.processarValoresDaOP(novaOp);

        // Toda viagem no Kanban precisa começar no Início
        if (novaOp.getEtapaAtual() == null) {
            novaOp.setEtapaAtual("ATENDIMENTO");
        }
        
        novaOp.setEtapaOk(false);

        // Gerar o código sequencial/hash do pedido se não existir
        if (novaOp.getCodigoRastreio() == null) {
            String uuidCorrigido = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            novaOp.setCodigoRastreio("#OP-" + uuidCorrigido);
        }

        return opRepository.save(novaOp);
    }

    // Regra 3 e 7: Rotacionar pelo Kanban com validação!
    @PutMapping("/{id}/etapa")
    public ResponseEntity<?> arrastarKanban(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String novaEtapa = body.get("novaEtapa");
        OrdemProducao op = opRepository.findById(id).orElseThrow();
        
        // Trava de segurança: Se o vendedor arrastar pra Faturamento ou Produto sem o dinheiro
        if ("FATURAMENTO".equals(novaEtapa) || "PRODUCAO".equals(novaEtapa)) {
            if (op.getFormaPagamento() == null || op.getFormaPagamento().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"erro\": \"Ops! Não dá para avançar antes de definir a Forma de Pagamento com o cliente!\"}");
            }
        }
        
        // Verifica se a etapa atual está marcada como OK para avançar
        if (!Boolean.TRUE.equals(op.getEtapaOk()) && !novaEtapa.equals(op.getEtapaAtual()) && !novaEtapa.equals("ATENDIMENTO")) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"erro\": \"Você precisa marcar o card como OK antes de avançar para a próxima etapa!\"}");
        }
        
        op.setEtapaAtual(novaEtapa); 
        op.setEtapaOk(false); // Reseta para a próxima fase
        return ResponseEntity.ok(opRepository.save(op));
    }

    @PutMapping("/{id}/ok")
    public ResponseEntity<?> marcarEtapaOk(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isOk = body.get("ok");
        OrdemProducao op = opRepository.findById(id).orElseThrow();
        op.setEtapaOk(isOk);
        return ResponseEntity.ok(opRepository.save(op));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirOP(@PathVariable Long id) {
        // Encontra o objeto completo (com seus itens) e desvincula corretamente tudo para o banco não dar conflito
        OrdemProducao op = opRepository.findById(id).orElseThrow();
        opRepository.delete(op);
        return ResponseEntity.ok().build();
    }
}
