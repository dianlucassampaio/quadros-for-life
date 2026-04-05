package com.quadrosforlife.gerenciadortarefas.service;

import com.quadrosforlife.gerenciadortarefas.model.Cliente;
import com.quadrosforlife.gerenciadortarefas.model.OrdemProducao;
import com.quadrosforlife.gerenciadortarefas.model.Usuario;
import com.quadrosforlife.gerenciadortarefas.repository.ClienteRepository;
import com.quadrosforlife.gerenciadortarefas.repository.OrdemProducaoRepository;
import com.quadrosforlife.gerenciadortarefas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@SuppressWarnings("null")
@Service
public class OrdemProducaoService {

    @Autowired
    private OrdemProducaoRepository opRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PedidoService calculador;

    public OrdemProducao salvarNovaOp(OrdemProducao novaOp, Long userId) {
        if (novaOp.getCliente() != null && novaOp.getCliente().getId() == null) {
            Cliente clienteSalvo = clienteRepository.save(novaOp.getCliente());
            novaOp.setCliente(clienteSalvo);
        }

        calculador.processarValoresDaOP(novaOp);

        if (novaOp.getEtapaAtual() == null) {
            novaOp.setEtapaAtual("ATENDIMENTO");
        }
        novaOp.setEtapaOk(false);

        if (novaOp.getCodigoRastreio() == null) {
            String uuidCorrigido = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            novaOp.setCodigoRastreio("#OP-" + uuidCorrigido);
        }

        if (userId != null) {
            Usuario u = usuarioRepository.findById(userId).orElse(null);
            if (u != null) {
                novaOp.setVendedorId(u.getId());
                novaOp.setNomeVendedor(u.getLogin());
            }
        } else {
            novaOp.setNomeVendedor("Sistema Master");
        }

        return opRepository.save(novaOp);
    }
}
