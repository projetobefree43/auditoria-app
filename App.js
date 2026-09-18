// App.js
// Projeto: Auditoria com trava de segurança (acelerômetro) + salvamento local
// Nível: Pleno
// Feito de um jeito bem simples, com comentários explicando cada parte :)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// nome que vamos usar pra guardar os dados salvos no celular
const CHAVE_STORAGE = '@auditorias_salvas';

export default function App() {
  // guarda se a auditoria está "rodando" (monitorando o movimento)
  const [auditoriaAtiva, setAuditoriaAtiva] = useState(false);

  // guarda a MAIOR força de movimento que o celular sentiu durante a auditoria
  // isso é usado pra saber se o celular caiu ou balançou muito
  const [maiorForcaDetectada, setMaiorForcaDetectada] = useState(0);

  // lista de auditorias que já foram salvas antes (histórico)
  const [historico, setHistorico] = useState([]);

  // referência pro "assinante" do sensor, pra poder desligar ele depois
  const assinaturaSensor = useRef(null);

  // quando o app abre, já carrega o histórico salvo
  useEffect(() => {
    carregarHistorico();
  }, []);

  // função que pega os dados salvos no celular e coloca na tela
  async function carregarHistorico() {
    try {
      const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE);
      if (dadosSalvos !== null) {
        setHistorico(JSON.parse(dadosSalvos));
      }
    } catch (erro) {
      // se der erro pra ler, só avisa e não quebra o app
      console.log('Erro ao carregar histórico:', erro);
    }
  }

  // começa a "escutar" o acelerômetro do celular
  function iniciarAuditoria() {
    setMaiorForcaDetectada(0);
    setAuditoriaAtiva(true);

    // o acelerômetro vai mandar novos valores várias vezes por segundo
    Accelerometer.setUpdateInterval(200); // atualiza a cada 200ms

    assinaturaSensor.current = Accelerometer.addListener((dados) => {
      const { x, y, z } = dados;

      // fórmula pra calcular a força total do movimento (tipo um "vetor")
      // é a mesma ideia do teorema de Pitágoras, só que em 3 direções
      const forcaTotal = Math.sqrt(x * x + y * y + z * z);

      // se essa força for a maior que já vimos até agora, guarda ela
      setMaiorForcaDetectada((forcaAnterior) =>
        forcaTotal > forcaAnterior ? forcaTotal : forcaAnterior
      );
    });
  }

  // para de escutar o sensor
  function pararSensor() {
    if (assinaturaSensor.current) {
      assinaturaSensor.current.remove();
      assinaturaSensor.current = null;
    }
  }

  // função chamada quando o usuário quer finalizar e enviar a auditoria
  async function finalizarEEnviar() {
    pararSensor();
    setAuditoriaAtiva(false);

    // AQUI é a trava de segurança do nível Pleno:
    // se o celular balançou/caiu muito forte (mais de 2.0g), bloqueia o envio
    if (maiorForcaDetectada > 2.0) {
      Alert.alert(
        'Instabilidade Física Detectada',
        'O celular sofreu um movimento muito brusco durante a auditoria. O envio foi bloqueado por segurança.'
      );
      return; // para a função aqui, não salva nada
    }

    // se passou pela trava, então pode salvar a auditoria como concluída
    const novaAuditoria = {
      id: Date.now().toString(), // um id simples usando a data/hora atual
      data: new Date().toLocaleString(), // data e hora legível
      maiorForca: maiorForcaDetectada.toFixed(2), // guarda a força só de curiosidade
    };

    // pega o histórico atual, adiciona a nova auditoria na frente
    const novoHistorico = [novaAuditoria, ...historico];

    try {
      // salva no armazenamento local do celular (funciona até sem internet)
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(novoHistorico));
      setHistorico(novoHistorico);
      Alert.alert('Sucesso', 'Auditoria salva localmente!');
    } catch (erro) {
      console.log('Erro ao salvar:', erro);
      Alert.alert('Ops', 'Não foi possível salvar a auditoria.');
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Auditoria com Sensor</Text>

      {/* mostra se está monitorando ou não */}
      <Text style={estilos.status}>
        Status: {auditoriaAtiva ? 'Monitorando movimento...' : 'Parado'}
      </Text>

      {/* mostra a maior força detectada em tempo real, só pra debug/aprender */}
      {auditoriaAtiva && (
        <Text style={estilos.forca}>
          Maior força até agora: {maiorForcaDetectada.toFixed(2)}g
        </Text>
      )}

      {/* botão muda de função dependendo se a auditoria está ativa ou não */}
      {!auditoriaAtiva ? (
        <TouchableOpacity style={estilos.botao} onPress={iniciarAuditoria}>
          <Text style={estilos.textoBotao}>Iniciar Auditoria</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[estilos.botao, estilos.botaoFinalizar]}
          onPress={finalizarEEnviar}
        >
          <Text style={estilos.textoBotao}>Finalizar e Enviar</Text>
        </TouchableOpacity>
      )}

      <Text style={estilos.subtitulo}>Histórico salvo:</Text>

      {/* lista as auditorias já salvas */}
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.itemHistorico}>
            <Text>Data: {item.data}</Text>
            <Text>Força máxima: {item.maiorForca}g</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>Nenhuma auditoria salva ainda.</Text>
        }
      />
    </View>
  );
}

// aqui fica só a parte de estilo (cores, tamanhos, espaçamento)
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 5,
  },
  forca: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  botao: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  botaoFinalizar: {
    backgroundColor: '#4CAF50',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  itemHistorico: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  vazio: {
    color: 'gray',
    fontStyle: 'italic',
  },
});