package com.quadrosforlife.gerenciadortarefas.controller;

import com.quadrosforlife.gerenciadortarefas.model.Cliente;
import com.quadrosforlife.gerenciadortarefas.repository.ClienteRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("null")
@WebMvcTest(ClienteController.class)
public class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClienteRepository repository;

    @MockitoBean
    private com.quadrosforlife.gerenciadortarefas.config.AuthInterceptor authInterceptor;

    @Test
    public void listarClientes_RetornaOKELista() throws Exception {
        Mockito.when(authInterceptor.preHandle(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(true);
        Cliente c = new Cliente();
        c.setId(1L);
        c.setNome("João Segurança Blindada");
        Mockito.when(repository.findAll()).thenReturn(Collections.singletonList(c));

        mockMvc.perform(get("/clientes")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
