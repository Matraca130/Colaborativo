# Site Colaborativo

Um site colaborativo para organizar informações, conversar com outras pessoas, integrar slides do Manus e gerenciar agentes de IA.

## Funcionalidades

- **Organização de Informações**: Centralize e organize informações importantes por categorias
- **Chat Colaborativo**: Sistema de chat em tempo real com múltiplas salas (versão estática usa localStorage)
- **Integração de Slides**: Upload e visualização de slides (PDF, PPT, PPTX, ODP)
- **Gerenciamento de Agentes**: Organize e controle seus agentes de produção
- **Interface Responsiva**: Funciona em desktop e mobile

## Como Hospedar no GitHub Pages

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique em "New repository"
3. Nomeie o repositório (ex: `site-colaborativo`)
4. Marque como "Public"
5. Clique em "Create repository"

### 2. Upload dos Arquivos

1. Faça download de todos os arquivos desta pasta
2. No seu repositório GitHub, clique em "uploading an existing file"
3. Arraste todos os arquivos para a área de upload
4. Adicione uma mensagem de commit (ex: "Primeiro commit do site colaborativo")
5. Clique em "Commit changes"

### 3. Ativar GitHub Pages

1. No seu repositório, vá em "Settings"
2. Role para baixo até a seção "Pages"
3. Em "Source", selecione "Deploy from a branch"
4. Selecione "main" como branch
5. Selecione "/ (root)" como pasta
6. Clique em "Save"

### 4. Acessar o Site

Após alguns minutos, seu site estará disponível em:
`https://[seu-usuario].github.io/[nome-do-repositorio]`

## Estrutura dos Arquivos

- `index.html` - Página principal
- `style.css` - Estilos CSS
- `script-static.js` - JavaScript para funcionalidades (versão estática)
- `README.md` - Este arquivo de instruções

## Versão Estática vs Dinâmica

Esta é a versão estática do site, que funciona apenas com HTML, CSS e JavaScript. Os dados são salvos no localStorage do navegador.

**Limitações da versão estática:**
- Chat não é em tempo real (apenas simula)
- Dados são salvos apenas localmente
- Não há sincronização entre usuários

**Para uma versão dinâmica completa:**
- Use a pasta `chat-backend` que contém uma aplicação Flask
- Deploy em serviços como Heroku, Railway ou Vercel
- Banco de dados real para persistência
- WebSockets para chat em tempo real

## Personalização

Você pode personalizar:
- Cores no arquivo `style.css`
- Textos no arquivo `index.html`
- Funcionalidades no arquivo `script-static.js`

## Suporte

Este site foi criado pelo Manus. Para dúvidas ou melhorias, consulte a documentação do Manus.

---

© 2025 Site Colaborativo - Criado com Manus

