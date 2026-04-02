package com.quadrosforlife.gerenciadortarefas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.quadrosforlife.gerenciadortarefas.model.Cliente;
import com.quadrosforlife.gerenciadortarefas.repository.ClienteRepository;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @GetMapping("/buscar/{telefone}")
    public ResponseEntity<?> buscarCliente(@PathVariable String telefone) {
        Cliente c = clienteRepository.findByTelefone(telefone);
        if (c != null) {
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.ok().build();
    }
}
