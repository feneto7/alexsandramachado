# Alexsandra Machado · Engenharia Civil

Portfólio em português do Brasil, feito com HTML, CSS e JavaScript. Inclui trajetória profissional, competências, formação, contato e uma montagem didática em 3D inspirada no case de manutenção da Ponte Dom Pedro II.

A montagem acompanha a rolagem nos dois sentidos, no desktop e no celular. O modelo é esquemático, sem escala; não representa a autoria da construção original da ponte.

## Estrutura

```text
.
├── index.html                  # Conteúdo, SEO e marcação da página
├── assets/
│   ├── css/styles.css          # Estilos, responsividade e cenas de montagem
│   ├── js/main.js              # Interações, modelo 3D e animações
│   ├── images/
│   │   ├── alexsandra-retrato.jpg
│   │   ├── alexsandra-engenharia.jpg
│   │   └── favicon.svg
│   └── documents/
│       └── curriculo-alexsandra.pdf  # Currículo original disponível para download
├── scripts/
│   ├── serve.mjs               # Servidor local sem dependências
│   ├── check.mjs               # Verifica sintaxe e referências locais
│   └── build.mjs               # Gera a versão em um único HTML
├── docs/PENDENCIAS.md          # Dados e arquivos a confirmar antes de publicar
├── package.json
├── vercel.json                # Build e diretório de publicação na Vercel
├── .editorconfig
├── .gitattributes
├── .gitignore
└── .nojekyll
```

As pastas `dist/` e `.local/` são ignoradas pelo Git. `dist/` contém a exportação gerada; `.local/` preserva capturas de revisão, backups e scripts antigos específicos do ambiente de desenvolvimento. Nenhuma delas é necessária para executar o código do repositório.

## Visualizar localmente

Abra `index.html` no navegador, mantendo a pasta `assets/` ao lado dele. Para usar um servidor local, utilize Node.js 24.x, a mesma versão principal configurada para o deploy:

```sh
npm run dev
```

Abra o endereço indicado no terminal, normalmente `http://127.0.0.1:4173`. Para outra porta:

```sh
npm run dev -- --port 4174
```

Não é necessário executar `npm install`: os scripts usam somente módulos nativos do Node.js.

## Verificar e gerar o HTML único

```sh
npm run check
npm run build
```

O build gera **`dist/index.html`**, com CSS, JavaScript, fotos, favicon e currículo em PDF incorporados. Essa versão pode ser enviada como um único arquivo, mantendo o download do currículo. Edite os arquivos de origem e gere novamente; não edite `dist/` manualmente.

As fontes do Google Fonts, GSAP 3.12.5, ScrollTrigger 3.12.5 e Lenis 1.1.20 continuam sendo carregadas por CDN. O conteúdo, as fotos e a montagem estrutural nativa funcionam sem essas bibliotecas; a tipografia e os efeitos complementares usam os recursos disponíveis. O modo `prefers-reduced-motion` apresenta a estrutura completa sem a montagem animada.

## Editar

- **Textos, contatos e SEO:** `index.html`. Atualize também o objeto `Person` no JSON-LD ao alterar os dados da engenheira.
- **Cores, fontes, layout e responsividade:** `assets/css/styles.css`.
- **Montagem estrutural:** função `initStructures()` em `assets/js/main.js`. Ela usa Canvas 2D para projetar geometria 3D, sem WebGL. As demais animações estão em `initMotion()`.
- **Fotos:** substitua os arquivos em `assets/images/`. Se as dimensões mudarem, atualize os atributos `width` e `height` das imagens no HTML.
- **Currículo:** substitua `assets/documents/curriculo-alexsandra.pdf` pela versão atualizada, mantendo o nome. Revise o tamanho e a quantidade de páginas informados junto ao botão e execute `npm run build` para atualizar também a exportação única.

Não altere os IDs e as classes usados pelos scripts sem atualizar suas referências.

## Subir para o repositório e hospedar

Envie os arquivos de origem listados acima. O `.gitignore` já exclui saídas geradas, histórico local e arquivos privados. Não há credenciais ou caminhos absolutos desta máquina no código de distribuição.

O site é estático: para hospedá-lo, publique `index.html` e a pasta `assets/`, preservando seus caminhos relativos. Também é possível publicar apenas o `dist/index.html` gerado. Não há backend nem configuração de banco de dados.

### Vercel

Importe o repositório mantendo a raiz do projeto na pasta que contém `package.json` e `vercel.json`. A configuração versionada define:

- **Framework Preset:** Other (`framework: null`).
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.
- **Node.js:** 24.x, definido em `package.json`.

O build gera `dist/index.html` durante o deploy; não é necessário enviar a pasta `dist/` ao Git. A propriedade `outputDirectory` de `vercel.json` substitui o diretório definido no painel, evitando o erro de pasta `public` ausente. Consulte a [documentação da configuração da Vercel](https://vercel.com/docs/project-configuration/vercel-json#outputdirectory).

Se houver um deploy anterior com erro, execute um novo deploy a partir do commit que contém `vercel.json`. Com a integração Git ativa, o push na branch de produção dispara um novo deploy.

### GitHub Pages

O arquivo `.nojekyll` está incluído para hospedagem estática pelo GitHub Pages. A criação do repositório, o envio dos commits e a ativação da hospedagem devem ser feitos na conta escolhida; este projeto não executa publicação automática.

Antes de publicar, revise [as pendências de conteúdo](docs/PENDENCIAS.md).

## Verificação visual

O layout foi conferido em larguras de 360, 390, 430, 768 e 1280 px, com testes de rolagem reversa, toque simulado, modo de movimento reduzido e falha de CDN. Após a organização, a versão modular foi revisada em 390 e 1440 px e a exportação única em 390 px: fotos carregadas, duas cenas de montagem ativas, reversão funcionando e ausência de overflow horizontal ou erros de JavaScript. Depois de editar, confira especialmente:

- a montagem de 0% a 100% e sua reversão, no hero e no projeto;
- os botões de etapas, o menu mobile e os links de contato;
- o enquadramento das fotos e a ausência de overflow horizontal.

`npm run check` valida a estrutura dos arquivos e a sintaxe; não substitui a revisão no navegador nem uma auditoria de Lighthouse.
