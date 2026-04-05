package com.quadrosforlife.gerenciadortarefas.service;

import com.quadrosforlife.gerenciadortarefas.model.Cliente;
import com.quadrosforlife.gerenciadortarefas.model.OrdemProducao;
import com.quadrosforlife.gerenciadortarefas.model.Usuario;
import com.quadrosforlife.gerenciadortarefas.repository.ClienteRepository;
import com.quadrosforlife.gerenciadortarefas.repository.OrdemProducaoRepository;
import com.quadrosforlife.gerenciadortarefas.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
public class OrdemProducaoServiceTest {

    @InjectMocks
    private OrdemProducaoService ordemProducaoService;

    @Mock
    private OrdemProducaoRepository opRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PedidoService calculador;

    @BeforeEach
    void setUp() {
        // Inicializaçao via MockitoExtension
    }

    @Test
    void testeSalvarNovaOp_ComVendedorLogado_DeveAtribuirVendedorEGerarCodigo() {
        // Arrange
        OrdemProducao op = new OrdemProducao();
        Long userId = 1L;
        
        Usuario usuarioMock = new Usuario();
        usuarioMock.setId(userId);
        usuarioMock.setLogin("vendedor_teste");

        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuarioMock));
        when(opRepository.save(any(OrdemProducao.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        OrdemProducao salva = ordemProducaoService.salvarNovaOp(op, userId);

        // Assert
        assertNotNull(salva.getCodigoRastreio(), "O código de rastreio deve ser gerado auto.");
        assertTrue(salva.getCodigoRastreio().startsWith("#OP-"), "Padrão de rastreio inválido.");
        assertEquals("ATENDIMENTO", salva.getEtapaAtual());
        assertFalse(salva.getEtapaOk());
        assertEquals(userId, salva.getVendedorId());
        assertEquals("vendedor_teste", salva.getNomeVendedor());
        
        verify(calculador, times(1)).processarValoresDaOP(any(OrdemProducao.class));
        verify(opRepository, times(1)).save(any(OrdemProducao.class));
    }

    @Test
    void testeSalvarNovaOp_SemVendedorLogado_DeveAtribuirSistemaMaster() {
        // Arrange
        OrdemProducao op = new OrdemProducao();
        
        when(opRepository.save(any(OrdemProducao.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        OrdemProducao salva = ordemProducaoService.salvarNovaOp(op, null);

        // Assert
        assertEquals("Sistema Master", salva.getNomeVendedor());
        assertNull(salva.getVendedorId());
    }

    @Test
    void testeSalvarNovaOp_ComClienteNovoSemId_DeveSalvarClienteAntesDaOp() {
        // Arrange
        OrdemProducao op = new OrdemProducao();
        Cliente clienteNovo = new Cliente();
        clienteNovo.setNome("Cliente do Teste");
        op.setCliente(clienteNovo);

        Cliente clienteSalvoNoBanco = new Cliente();
        clienteSalvoNoBanco.setId(99L);
        clienteSalvoNoBanco.setNome("Cliente do Teste");

        when(clienteRepository.save(clienteNovo)).thenReturn(clienteSalvoNoBanco);
        when(opRepository.save(any(OrdemProducao.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        OrdemProducao salva = ordemProducaoService.salvarNovaOp(op, null);

        // Assert
        assertNotNull(salva.getCliente().getId(), "O ID do cliente não pode ser nulo após ser persistido pelo service");
        assertEquals(99L, salva.getCliente().getId());
        verify(clienteRepository, times(1)).save(clienteNovo);
    }
}
