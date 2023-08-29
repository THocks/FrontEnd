export default async function fetchZipcode(value: string) {
    const zipcode = value.replace(/[^0-9]+/, '');
    let fetchCEP;
  
    if (zipcode.length === 8) {
      fetchCEP = await fetch(`https://viacep.com.br/ws/${zipcode}/json`)
        .then((response) => response.json())
        .then((response) => ({
          zipcode: response?.cep,
          street: response?.logradouro,
          city: response?.localidade,
          state: response?.uf,
          district: response?.bairro,
        }))
        .catch((err) => err);
    } else {
      return Promise.reject();
    }
  
    return Promise.resolve(fetchCEP);
  }