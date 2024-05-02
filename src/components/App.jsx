import { CohereClient } from 'cohere-ai';
import { useEffect, useState } from 'react';
import chats from '../chats.json';

export const App = () => {
  const [answer, setAnswer] = useState([]);
  const [allText, setAllText] = useState([]);

  useEffect(() => {
    console.log(allText);
  }, [allText]);

  const cohere = new CohereClient({
    token: 'lUSmb4tt1Kc8AycKKCL5fOzqLaUQSxbJx9VPDjmU',
  });

  const upload = chats => {
    const newTexts = chats.map(chat => {
      const textArray = chat.thread.events
        .filter(event => event.type !== 'filled_form') // Фильтруем события с типом 'message'
        .map(message => message.created_at + ' ' + message.text + '\n');
      return textArray.join(' ');
    });

    setAllText(prevTexts => [...prevTexts, ...newTexts]);
  };

  const analis = async all => {
    for (let i = 0; i < 99; i++) {
      setTimeout(async () => {
        const text = all[i];
        const stream = await cohere.chatStream({
          model: 'command-r-plus',
          message: text,
          temperature: 0.2,
          promptTruncation: 'AUTO',
          preamble:
            'Ответь на все вопросы относительно диалога который тебе придет, в формате: 1)Да 2)Нет. Отвечай без комментариев. Если операторов больше одного оценивай каждого отдельно по его репликам. Учитывай только реплики участников диалога. 1. Употреблял ли оператор некорректные выражения в чате с клиентом? 2. Ставил ли оператор клиента на удержание больше 4 минут 3. Извинялся ли клиент за некорректно даную информацию?',
          connectors: [
            {
              id: 'web-search',
              options: {
                site: 'https://docs.google.com/spreadsheets/d/1cUXwlol9ankmKn7t8LHeufDx_hX7Nscl8Ki_ia7hioc/edit#gid=1248252443',
              },
            },
          ],
        });

        for await (const chat of stream) {
          if (chat.eventType === 'stream-end') {
            console.log(chat);
            setAnswer(prevAnswer => [
              ...prevAnswer,
              { analis: chat.response.text, mainText: text },
            ]);
          }
        }
      }, i * 5000); // Интервал между запросами - 1000 миллисекунд (1 секунда)
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: 40,
        color: '#010101',
      }}
    >
      <button
        onClick={() => {
          upload(chats);
        }}
      >
        Upload
      </button>
      <button
        onClick={() => {
          console.log(allText);
          analis(allText);
        }}
      >
        Analis
      </button>
      {answer.map((ans, id) => {
        return (
          <div
            style={{
              marginTop: '5px',
            }}
          >
            <p
              style={{
                fontSize: 10,
                margin: 0,
                whiteSpace: 'pre-line',
              }}
            >
              {id + 1} : {ans.mainText}
            </p>
            <p
              style={{
                fontSize: 10,
                margin: 0,
              }}
            >
              {id + 1} : {ans.analis}
            </p>
          </div>
        );
      })}
    </div>
  );
};
