package com.quadrosforlife.gerenciadortarefas.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class OrdemProducao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // Várias OPs podem pertencer ao mesmo Cliente
    private Cliente cliente;

    private String canalAtendimento; // whatsapp, telefone, instagram
    private String etapaAtual; // ATENDIMENTO, FATURAMENTO, PRODUCAO, EXPEDICAO, ENTREGA
    private String formaPagamento; // A_VISTA, PARCELADO
    private Integer parcelas;
    private Double valorTotal;

    @OneToMany(mappedBy = "ordemProducao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens;

    private Boolean etapaOk;
    private String codigoRastreio;

    private String dataEntregaEstimada;
    private String observacaoCalendario;

    // Construtor obrigatorio
    public OrdemProducao() {
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getCanalAtendimento() {
        return canalAtendimento;
    }

    public void setCanalAtendimento(String canalAtendimento) {
        this.canalAtendimento = canalAtendimento;
    }

    public String getEtapaAtual() {
        return etapaAtual;
    }

    public void setEtapaAtual(String etapaAtual) {
        this.etapaAtual = etapaAtual;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public Integer getParcelas() {
        return parcelas;
    }

    public void setParcelas(Integer parcelas) {
        this.parcelas = parcelas;
    }

    public Double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }

    public Boolean getEtapaOk() {
        return etapaOk;
    }

    public void setEtapaOk(Boolean etapaOk) {
        this.etapaOk = etapaOk;
    }

    public String getCodigoRastreio() {
        return codigoRastreio;
    }

    public void setCodigoRastreio(String codigoRastreio) {
        this.codigoRastreio = codigoRastreio;
    }

    public String getDataEntregaEstimada() { return dataEntregaEstimada; }
    public void setDataEntregaEstimada(String dataEntregaEstimada) { this.dataEntregaEstimada = dataEntregaEstimada; }
    public String getObservacaoCalendario() { return observacaoCalendario; }
    public void setObservacaoCalendario(String observacaoCalendario) { this.observacaoCalendario = observacaoCalendario; }
}
