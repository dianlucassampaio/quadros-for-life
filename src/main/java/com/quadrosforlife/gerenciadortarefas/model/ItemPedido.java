package com.quadrosforlife.gerenciadortarefas.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore // Evita um loop invisível onde os arrays travam a memória do Spring
    private OrdemProducao ordemProducao;

    private Integer quantidade;
    private String tipoMoldura; // MADEIRA_BRANCA, MADEIRA_PRETA, ALUMINIO
    private String tamanho; // A3, A4
    private Double valorUnitario;

    public ItemPedido() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public OrdemProducao getOrdemProducao() { return ordemProducao; }
    public void setOrdemProducao(OrdemProducao ordemProducao) { this.ordemProducao = ordemProducao; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public String getTipoMoldura() { return tipoMoldura; }
    public void setTipoMoldura(String tipoMoldura) { this.tipoMoldura = tipoMoldura; }
    public String getTamanho() { return tamanho; }
    public void setTamanho(String tamanho) { this.tamanho = tamanho; }
    public Double getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(Double valorUnitario) { this.valorUnitario = valorUnitario; }
}
