package com.quadrosforlife.gerenciadortarefas.controller;

import com.quadrosforlife.gerenciadortarefas.model.Usuario;
import com.quadrosforlife.gerenciadortarefas.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SuppressWarnings("null")
@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioRepository repository;

    @Test
    public void testeBloqueioForcaBruta_CredenciaisInvalidas_Retorna401() throws Exception {
        Mockito.when(repository.findByLogin("admin")).thenReturn(Optional.empty());

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"admin\", \"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Credenciais Invalidas"));
    }

    @Test
    public void testeConexaoSegura_SenhaHasheada_Retorna200() throws Exception {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setLogin("admin");
        u.setIsAdmin(true);
        // Simulando a senha hasheada salva no banco (Proteção)
        u.setSenha(BCrypt.hashpw("senhaForte", BCrypt.gensalt(10)));
        
        Mockito.when(repository.findByLogin("admin")).thenReturn(Optional.of(u));

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"admin\", \"senha\":\"senhaForte\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("admin"))
                .andExpect(jsonPath("$.isAdmin").value(true));
    }
}
