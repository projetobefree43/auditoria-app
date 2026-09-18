# Auditoria com Sensor (Nível Pleno)

App simples feito em React Native (Expo) que:

1. Usa o **acelerômetro** do celular pra sentir se ele balançou ou caiu forte durante uma auditoria.
2. Se o movimento passar de **2.0g**, bloqueia o envio e mostra o alerta "Instabilidade Física Detectada".
3. Se estiver tudo certo, **salva a auditoria no celular** (armazenamento local), então dá pra ver o histórico depois mesmo sem internet.

## Como rodar

1. Crie um projeto Expo (se ainda não tiver um):
```
npx create-expo-app meu-app
cd meu-app
```

2. Instale as bibliotecas que o app usa:
```
npx expo install expo-sensors @react-native-async-storage/async-storage
```

3. Substitua o arquivo `App.js` do seu projeto pelo `App.js` que está aqui.

4. Rode o projeto:
```
npx expo start
```

5. Abra no celular com o app **Expo Go** (lendo o QR code) ou em um emulador.

## Como testar a trava de segurança

- Aperte "Iniciar Auditoria".
- Balance o celular com força (ou deixe ele cair em cima de uma cama, por exemplo 😅).
- Aperte "Finalizar e Enviar".
- Se o movimento foi forte o suficiente (mais de 2.0g), vai aparecer o alerta bloqueando o envio.
- Se não balançou muito, a auditoria é salva e aparece na lista de histórico.
