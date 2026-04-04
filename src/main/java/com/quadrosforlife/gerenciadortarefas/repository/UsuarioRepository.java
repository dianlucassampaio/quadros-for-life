package com.quadrosforlife.gerenciadortarefas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.quadrosforlife.gerenciadortarefas.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
}
