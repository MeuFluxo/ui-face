# Ultra Inteligência

Página estática de Dr. Marcelo Roxo, em HTML, CSS e JavaScript. Arquivo principal: `index.html`. Não requer build, framework ou banco de dados.

## Abrir e publicar

Abra `index.html` para visualizar o layout. Para testar o vídeo, sirva esta pasta por HTTP, por exemplo com `python3 -m http.server 4174 --bind 127.0.0.1`.

Para hospedagem, publique o conteúdo desta pasta, incluindo `assets/`, `config.js`, `player.html` e `player.js`. HTTPS é recomendado. GitHub é o repositório do código; o envio por si só não ativa uma hospedagem.

## Edição

- `index.html`: headline, autor e comentários; todo o conteúdo está disponível sem renderização por JavaScript.
- `style.css`: coluna de 550 px, player visual 322 px em 9:16 e ajustes mobile reais.
- `config.js`: embed, checkout e tempos de liberação da oferta por variante. Não misturar os IDs de outros funis.
- `script.js`: data local do dia anterior, horário sorteado por sessão/dia, carregamento do player e interações locais.
- `player.html` e `player.js`: integração isolada com VTurb A/B, sem cortar a imagem. A altura responde à proporção da variante ativa.
- `assets/`: foto do especialista e avatares locais.

## Player e checkout

Página original: https://ultrainteligencia.com/marcelo-roxo-vsl7-h4/

Embed: `ab-6a053d1b5ecd720a09cfd574`.

Checkout informado pelo proprietário: https://checkout.payt.com.br/3a27459800c64556fb068cb82eee1d27

O vídeo só carrega após o clique no quadro azul. “Começar do início” solicita seek(0); “Continuar” preserva a retomada do VTurb. Se o navegador bloquear áudio automático, aparece “Toque para assistir”. Falha de carregamento permite nova tentativa e oferece a página original.

O botão de compra abaixo da VSL só aparece no tempo correspondente à variante, conforme a página original. Links Payt dentro do player são direcionados ao checkout deste projeto pela API pública do VTurb. Não foi copiado o contador aleatório de espectadores, a falsa expiração diária, nem scripts GTM/Meta/analytics do site original. O embed externo mantém os recursos e a telemetria controlados pelo fornecedor; não é um player offline.

## Conteúdo

Headline e conversas foram adaptadas do roteiro fornecido, sem acrescentar promessas de cura ou resultados clínicos. As conversas criadas têm identificação editorial; não são comentários enviados por clientes. Curtir altera só o estado local, não contabiliza reações de terceiros. Não há backend de comentários, login ou coleta de dados. A data dinâmica é identificada como simulação, não registro de publicação real.

Os destaques públicos do Instagram pediram login nesta inspeção; seus relatos não foram transcritos nem atribuídos a autores inventados. As fontes e imagens constam em `assets/ORIGEM.md`.

## Verificação

Requer Node.js apenas para testes: `npm run check`. Os testes verificam datas (incluindo viradas de mês e ano), arquivos, comentários, configuração, player, retomada, checkout e liberação da oferta. Nenhuma dependência npm é necessária.
