### 開発環境
- Windows 11
- vscode
- node.js v24.12.0

### 開発環境構築手順
1. Node.jsをインストール
https://nodejs.org/ja/download

2. mkcert をインストール
    ```
    Set-ExecutionPolicy Bypass -Scope Process -Force;
    [System.Net.ServicePointManager]::SecurityProtocol = 3072;
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```
    ```
    choco install mkcert
    ```

3. ローカルCAを登録
    ```
    mkcert -install
    ```

4. 証明書を作成
    ```
    mkcert localhost
    ```

5. http-server をインストール
    ```
    npm install -g http-server
    ```

6. HTTPSサーバーを起動
    ```
    http-server . -S -C localhost.pem -K localhost-key.pem -p 8080
    ```