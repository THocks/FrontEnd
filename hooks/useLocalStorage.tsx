import { useEffect, useState } from 'react';

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  // Estado para armazenar o nosso valor
  // Passe uma função de estado inicial para useState para que a lógica seja executada apenas uma vez
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Obter do armazenamento local pelo chave
      if (typeof window !== 'undefined') {
        // código do navegador
        const item = window.localStorage.getItem(key);
        // Analisar o JSON armazenado ou, se não houver, retornar o initialValue
        return item ? JSON.parse(item) : initialValue;
      }
    } catch (error) {
      // Se ocorrer um erro, também retorne o initialValue
      console.log(error);
      return initialValue;
    }
  });

  // useEffect para atualizar o armazenamento local quando o estado muda
  useEffect(() => {
    try {
      // Permitir que o valor seja uma função para termos a mesma API do useState
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      // Salvar o estado
      if (typeof window !== 'undefined') {
        // código do navegador
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Uma implementação mais avançada lidaria com o caso de erro
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
