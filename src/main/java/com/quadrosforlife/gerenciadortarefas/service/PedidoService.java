package com.quadrosforlife.gerenciadortarefas.service;

import org.springframework.stereotype.Service;
import com.quadrosforlife.gerenciadortarefas.model.OrdemProducao;
import com.quadrosforlife.gerenciadortarefas.model.ItemPedido;

@Service
public class PedidoService {

    public void processarValoresDaOP(OrdemProducao op) {
        double totalItens = 0.0;
        
        if (op.getItens() != null) {
            for (ItemPedido item : op.getItens()) {
                double precoBase = 0.0; 
                
                // Regras Base de Precificação Absoluta
                if ("A3".equalsIgnoreCase(item.getTamanho()) || "30x42".equals(item.getTamanho())) {
                    precoBase += 50.0; 
                } else {
                    precoBase += 30.0; // Custo do A4
                }
                
                // Regra de preço da moldura
                if (item.getTipoMoldura() != null && item.getTipoMoldura().toUpperCase().contains("MADEIRA")) {
                    precoBase += 100.0; 
                } else {
                    precoBase += 50.0; // Custo do Aluminio
                }

                // Salva o cálculo no item e soma ao total da OP
                item.setValorUnitario(precoBase);
                item.setOrdemProducao(op); // Amarra a relação invertida do JPA
                
                totalItens += (precoBase * item.getQuantidade());
            }
        }
        
        // 2. Aplicar juros ou descontos com base no pagamento
        double totalFinal = totalItens;
        
        // Se parcelado em 5x ou mais, adiciona juros de 3.2%
        if (op.getParcelas() != null && op.getParcelas() >= 5) {
            totalFinal = totalFinal + (totalFinal * 0.032);
        }

        op.setValorTotal(totalFinal);
    }
}
