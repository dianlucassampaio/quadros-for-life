package com.quadrosforlife.gerenciadortarefas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import com.quadrosforlife.gerenciadortarefas.model.Usuario;
import com.quadrosforlife.gerenciadortarefas.repository.UsuarioRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository repository;

    // Regra Oculta: Se ligar a maquina e o H2 for virgem, crie um admin poderoso padrao
    @EventListener(ApplicationReadyEvent.class)
    public void criarAdminSeed() {
        if (repository.count() == 0) {
            Usuario u = new Usuario();
            u.setLogin("admin");
            u.setSenha("admin123");
            u.setIsAdmin(true);
            repository.save(u);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String login = body.get("login");
        String senha = body.get("senha");
        
        Optional<Usuario> userOpt = repository.findByLogin(login);
        if (userOpt.isPresent() && userOpt.get().getSenha().equals(senha)) {
            Usuario u = userOpt.get();
            // Carimba Passaporte Virtual Invisivel de sessao Spring Native
            session.setAttribute("USER_ID", u.getId());
            session.setAttribute("USER_ADMIN", u.getIsAdmin());
            
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", u.getId());
            resp.put("login", u.getLogin());
            resp.put("isAdmin", u.getIsAdmin());
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", "Credenciais Invalidas"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> sessionAtiva(HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Pede pra tela abrir modal gigante
        }
        Usuario u = repository.findById(userId).orElseThrow();
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", u.getId());
        resp.put("login", u.getLogin());
        resp.put("isAdmin", u.getIsAdmin());
        return ResponseEntity.ok(resp);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate(); // Rasga o passaporte
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> criarVendedor(@RequestBody Map<String, String> body, HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("USER_ADMIN");
        // Trava do Chefe Req 3: Somente logados E donos da patente ADMIN fazem conta!
        if (isAdmin == null || !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", "Somente um Administrador matriculado pode cadastrar novos vendedores."));
        }
        
        if(repository.findByLogin(body.get("login")).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Atenção: Login já existe no sistema. Tente um diferente."));
        }

        Usuario v = new Usuario();
        v.setLogin(body.get("login"));
        v.setSenha(body.get("senha"));
        v.setIsAdmin(false); // Nasce mero mortal como vendedor
        repository.save(v);
        
        return ResponseEntity.ok().build();
    }
}
