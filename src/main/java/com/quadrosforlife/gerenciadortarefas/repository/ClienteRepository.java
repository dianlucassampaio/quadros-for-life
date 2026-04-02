package com.quadrosforlife.gerenciadortarefas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.quadrosforlife.gerenciadortarefas.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Cliente findByTelefone(String telefone);
}
