const axios = require('axios')

const getCountryInfo = (countryName) => {
  return axios.get(`https://restcountries.com/v3.1/name/${countryName}`)    
};

const getCountries = (countryName) => {
  return axios.get(`https://restcountries.com/v3.1/all`)    
};


module.exports = { getCountryInfo, getCountries }