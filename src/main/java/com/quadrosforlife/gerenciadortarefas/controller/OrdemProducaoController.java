package com.quadrosforlife.gerenciadortarefas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import com.quadrosforlife.gerenciadortarefas.model.OrdemProducao;
import com.quadrosforlife.gerenciadortarefas.repository.OrdemProducaoRepository;
import com.quadrosforlife.gerenciadortarefas.service.OrdemProducaoService;

import java.util.List;
import java.util.Map;

@SuppressWarnings("null")
@RestController
@RequestMapping("/ops")
public class OrdemProducaoController {

    @Autowired
    private OrdemProducaoRepository opRepository;
    


    @Autowired
    private OrdemProducaoService opService;

    @GetMapping
    public List<OrdemProducao> listarKanban() {
        return opRepository.findAll();
    }

    @PostMapping
    public OrdemProducao abrirNovaOP(@RequestBody OrdemProducao novaOp, HttpSession session) {
        Long userId = session != null ? (Long) session.getAttribute("USER_ID") : null;
        return opService.salvarNovaOp(novaOp, userId);
    }

    @PutMapping("/{id}/etapa")
    public ResponseEntity<?> arrastarKanban(@PathVariable Long id, @RequestBody Map<String, String> body, HttpSession session) {
        String novaEtapa = body.get("novaEtapa");
        OrdemProducao op = opRepository.findById(id).orElseThrow();
        
        // Bloqueio do Invasor: O Vendedor puxando a OP pertence a ele? A Gerência escapa!
        Long loggedUserId = (Long) session.getAttribute("USER_ID");
        Boolean isAdmin = (Boolean) session.getAttribute("USER_ADMIN");
        if (Boolean.FALSE.equals(isAdmin) && !loggedUserId.equals(op.getVendedorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", "✋ Acesso Negado: Apenas a vendedora '" + op.getNomeVendedor() + "' (criadora desta encomenda) ou uma Gerente pode manipular esta O.P!"));
        }

        if ("FATURAMENTO".equals(novaEtapa) || "PRODUCAO".equals(novaEtapa)) {
            if (op.getFormaPagamento() == null || op.getFormaPagamento().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Ops! Não dá para avançar antes de definir a Forma de Pagamento com o cliente!"));
            }
        }
        
        if (!Boolean.TRUE.equals(op.getEtapaOk()) && !novaEtapa.equals(op.getEtapaAtual()) && !novaEtapa.equals("ATENDIMENTO")) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Você precisa assinalar a O.P como 'Concluir' nesta etapa antes de empurrá-la à frente!"));
        }
        
        op.setEtapaAtual(novaEtapa); 
        op.setEtapaOk(false);
        return ResponseEntity.ok(opRepository.save(op));
    }

    @PutMapping("/{id}/ok")
    public ResponseEntity<?> marcarEtapaOk(@PathVariable Long id, @RequestBody Map<String, Boolean> body, HttpSession session) {
        Boolean isOk = body.get("ok");
        OrdemProducao op = opRepository.findById(id).orElseThrow();

        Long loggedUserId = (Long) session.getAttribute("USER_ID");
        Boolean isAdmin = (Boolean) session.getAttribute("USER_ADMIN");
        if (Boolean.FALSE.equals(isAdmin) && !loggedUserId.equals(op.getVendedorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", "✋ Acesso Negado: Apenas a vendedora '" + op.getNomeVendedor() + "' (dona da O.P.) pode concluir essas etapas!"));
        }

        op.setEtapaOk(isOk);
        return ResponseEntity.ok(opRepository.save(op));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirOP(@PathVariable Long id, HttpSession session) {
        OrdemProducao op = opRepository.findById(id).orElseThrow();

        Long loggedUserId = (Long) session.getAttribute("USER_ID");
        Boolean isAdmin = (Boolean) session.getAttribute("USER_ADMIN");
        if (Boolean.FALSE.equals(isAdmin) && !loggedUserId.equals(op.getVendedorId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", "🗑️ Acesso Negado: Apenas a própria '" + op.getNomeVendedor() + "' ou a Gerente Administrativa pode enviar essa ordem à lixeira!"));
        }

        opRepository.delete(op);
        return ResponseEntity.ok().build();
    }
}
