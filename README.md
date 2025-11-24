# S3 Presigned Upload Flow

Esta aplicação demonstra a implementação de um sistema de upload de arquivos utilizando urls pré-assinadas do S3. O projeto é separado pelo frontend React com Vite e um backend serverless com AWS Lambda, S3, DynamoDB e API Gateway, fornecendo uma experiência de upload de arquivos com rastreamento de progresso em tempo real.

Este repositório contém dois projetos relacionados para demonstrar um fluxo de upload:

- `serverless-api/` — API serverless (Serverless Framework + AWS) que gera urls pré-assinadas e expõe endpoints usados pelo frontend;
- `frontend/` — Aplicação React + Vite que permite selecionar arquivos e enviar para S3 usando as urls pré-assinadas.

## Funcionalidades
  - **Interface de upload**: Drag and drop para seleção de múltiplos arquivos;
  - **Upload via urls pré-assinadas**: Geração de urls pré-assinadas temporárias(1min) para upload direto para o S3;
  - **Processamento automático**: Triggers S3 para iniciar processamento após upload;
  - **Rastreamento de progresso**: Barra de progresso circular para cada arquivo;
  - **Rastreamente de status**: Sistema de controle de status no processamento do dynamodb;
  - **TTL automático**: Limpeza automática de registros pendentes após 1 minuto.


## Arquitetura
![Diagrama da Arquitetura](/serverless-api/assets/diagrama-arquitetura.png)


## Pré-requisitos

- [Node.js 20 ou superior](https://nodejs.org/en/)
- Yarn ou outro package manager
- [Serverless](https://www.serverless.com)
- [Credenciais AWS configuradas](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)

## Configuração do Serverless
1. Instale o Serverless via NPM:

   ```bash
   npm i serverless -g
   ```

   Para mais informações: [Installation](https://www.serverless.com/framework/docs/getting-started#installation).

2. Faça login no Serverless:

   Crie uma conta no Serverless e faça login com o comando abaixo:

   ```bash
   sls login
   ```

   Para mais informações: [Signing In](https://www.serverless.com/framework/docs/getting-started#signing-in).

#### Configuração das Credenciais AWS

Para mais informações: [AWS Credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)

##### **Opção 1: AWS CLI (Recomendado)**

1. Faça o download e instalação: [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions).

2. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

3. Configure AWS CLI:

   ```bash
   aws configure
   ```

   Preencha com:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`
   - Default output format: `json`

   Para mais informações: [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-configure.title)
****

##### **Opção 2: Variáveis de Ambiente**

1. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

2. Renomeie o arquivo `.env.example` para `.env` e preencha com os valores de `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`.

## Passo a passo

### Backend

1. Clone o repositório:
    ```bash
    git clone https://github.com/nivaldoandrade/s3-presigned-upload-flow

    cd s3-presigned-upload-flow/serverless-api
    ```

2. Instale as dependências:
	```bash
	# No diretório serverless-api
	yarn
	# ou
	npm install
	```

3. Realize o deploy na AWS:
	```bash
	sls deploy
   ```

	Se tudo ocorrer bem, o output esperado será:
	```plaintext
	endpoints:
		POST - https://xxx.execute-api.sa-east-1.amazonaws.com/create-image
	functions:
		createImage: serverless-api-dev-createImage
		newUploadFileTrigger: serverless-api-dev-newUploadFileTrigger
	```

	O endpoint base da API será: `https://xxx.execute-api.sa-east-1.amazonaws.com`

### Frontend

4. Configure a variável de ambiente do frontend:
	```bash
		cd ../frontend

		#Copie o arquivo de exemplo
		cp .env.example .env

		#Edite o arquivo .env e adicionei a URL da API
		#VITE_API_URL=https://xxx.execute-api.sa-east-1.amazonaws.com
	```
5. Instale as dependências do frontend:
   ```bash
	# No diretório frontend
	yarn
	# ou
	npm install
	 ```

6. Inicie o servidor de desenvolvimento:
   ```bash
	 yarn dev
	 # ou
	 npm run dev
	 ```

	O frontend estará disponível em: http://localhost:5173


   
## Endpoints
| Método | Url           | Descrição                         | Exemplo do request body válido       |
| ------ | ------------- | --------------------------------- | ------------------------------------ |
| POST   | /create-image | Gera url pré-assinada para upload | [JSON](#create-image---create-image) |


### Exemplos de Uso

#### Create Image -> /create-image

  - Gera uma url pré-assinada válida por 1 minuto para upload do arquivo:
    ``` bash
      curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/create-image \
        -H "Content-Type: application/json" \
        -d '{"filename": "meu-arquivo.pdf"}'
    ```
  - Request body:
    ``` JSON
      {
        "filename": "meu-arquivo.pdf"
      }
    ```
  - Resposta esperada:
    ``` JSON
      {
        "message": "https://serverless-api-dev-file-bucket.s3.sa-east-1.amazonaws.com/1699999999999_meu-arquivo.pdf?X-Amz-Algorithm=..."
      }
    ```
  - Fazendo o upload:
    ```bash
      # Use a URL retornada para fazer o upload da imagem
      curl -X PUT "https://serverless-api-dev-file-bucket.s3..." \
        --upload-file meu-arquivo.pdf \
        -H "Content-Type: application/pdf"
    ```

    #### Fluxo de processamento

    Desde do frontend até o backend:
		
    * 1\. O usuário seleciona ou arrasta os arquivos para a área de upload;
    * 2\. Clica no botão "Enviar";
    * 3\. Frontend solicita url pré assinada para cada arquivo via `/create-image`;
    * 4\. Um registro é criado no dynamodb com o status `PENDING` e TTL;
    * 5\. Frontend recebe a url e faz o upload direto para o S3;
    * 6\. Barra de progresso circular é atualizada em tempo real;
    * 7\. Ao completar o upload, o trigger S3 é acionado;
    * 8\. Lambda trigger atualiza o status para `COMPLETED` e remove o TTL;
    * 9\. Interface exibe checkmark de sucesso.

    #### Status do arquivo

    O status de cada arquivo no dynamoDB:
    - **PENDING**: Arquivo registrado, aguardando upload(TTL de 1 minuto);
    - **COMPLETED**: Upload concluído com sucesso;

## Frontend - Tecnologias Utilizadas
- React;
- Vite;
- Typescript;
- Tailwind css;
- Shadcn;
- React Dropzone;
- Axios;
- Lucide Icons.

## Backend - Tecnologias Utilizadas
- Serverless Framework v4;
- AWS (Lambda, API Gateway, DynamoDB e S3);
- TypeScript;
- Zod.

## Recursos criados AWS
- DynamoDB Table: `serverless-api-{stage}-MainTable`
  - Chave primária: `id`;
  - TTL habilitado: `expireAt`.
- S3 Bucket: `serverless-api-{stage}-file-bucket`;
  - CORS configurado para `a http://localhost:5173`;
  - Trigger configurado para ObjectCreated:Put
- Lambda Functions:
  - `serverless-api-{stage}-createImage`;
  - `serverless-api-{stage}-newUploadFileTrigger`;
- API Gateway: `{stage}-serverless-api`:
  - CORS habilitado.


## Políticas de Retenção
  - **URLs pré-assinadas**: 1 minuto;
  - **TTL dynamodb**: Registros `PENDING` expiram em 1 minuto;
  - **CORS**: Configurado para localhost.

## Comandos Úteis

### Backend
```bash
cd serverless-api

# Deploy completo
sls deploy

# Deploy de função específica
sls deploy function -f createImage

# Visualizar logs
sls logs -f newUploadFileTrigger --t

# Remover stack
sls remove
```
### Frontend
``` bash
cd frontend

# Desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview do build
yarn preview

# Lint
yarn lint
```
## Troubleshooting

### Frontend não conecta com o backend
  - Verifique se a variável `VITE_API_URL` está configurada corretamente no `.env`;
  - Certifique-se que o backend foi deployado com sucesso;
  - Verifique se o CORS está configurado corretamente no `serverless.yml`.

### Erro 400 ao criar a url pré-assinada
  - Verifique se o `filename` está sendo enviado;
  - Confirme que o campo não está vazio ou contém espaços vazio.

### Upload falha no S3
  - Verique se a url pré-assinada não expirou(1 minuto);
  - Confirme que o `Content-Type` do arquivo está correto;
  - Verifique os logs do CloudWatch.

### Status não atualiza para `COMPLETED`
  - Verifique os logs da função `newUploadFileTrigger` no CloudWatch;
  - Confirme que o trigger S3 está configurado corretamente;
  - Verifique se há erros de permissão no IAM.

### Erro de CORS
  - Verifique se o frontend está rodando em `http://localhost:5173`;
  - Para outros domínios, atualize o `AllowedOrigins`no `serverless.yml`;
  - Após mudanças, faça novo deploy: `sls deploy`.