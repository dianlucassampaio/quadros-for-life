# Gerenciador de Tarefas - Quadros for Life

Este é o nosso projeto final para a disciplina de Projeto Integrador III-B. Fizemos um sistema de Kanban focado em gerenciar vendas e as etapas de produção de uma loja de quadros. Com ele, conseguimos organizar as encomendas desde o primeiro atendimento até a entrega do produto!

## Tecnologias que usamos no projeto
* Java com Spring Boot (para o Back-end)
* Banco de Dados H2 (escolhemos esse porque salva em um arquivo local, aí facilita na hora de apresentar sem precisar instalar servidor pesado).
* HTML, CSS e JavaScript Vanilla.
* Usamos também o Bcrypt para criptografar as senhas no banco.
* Chart.js para fazer o gráfico bonitão de vendas e Toastify para dar aqueles alertas na tela em vez do alert do navegador.

## Como testar e rodar o sistema

É bem tranquilo rodar ele localmente:
1. Só precisa ter o Java instalado no PC e ver se a porta `8081` não está sendo usada.
2. Abre a tela do terminal, entra na pasta do projeto e roda:
   - No Windows: `.\mvnw spring-boot:run`
   - Linux ou Mac: `./mvnw spring-boot:run`
3. Depois que a barrinha carregar no terminal, é só ir no Chrome e digitar: `http://localhost:8081`

(Dica: se quiser testar a versão já empacotada que a gente entregou, basta ir onde o arquivo `.jar` está e digitar `java -jar gerenciador-tarefas-0.0.1-SNAPSHOT.jar`).

## Senha de acesso
Para facilitar a correção, o sistema já gera um usuário administrador sozinho na primeira vez que você liga ele, assim não precisa mexer no banco de dados para logar.
- **Login do sistema:** admin
- **Senha:** admin123

## Testes Automatizados
Conseguimos também implementar alguns testes com JUnit e Mockito seguindo o que foi pedido! Para ver eles rodando direitinho, basta usar o comando `.\mvnw test` no terminal da IDE.
