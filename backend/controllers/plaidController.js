
require('dotenv').config();
const util = require('util');

const {plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES, PLAID_REDIRECT_URI } = require('../Api/plaidClient.js')
const { Products } = require('plaid')

let ACCESS_TOKEN = null;

const prettyPrintResponse = (response) => {
  console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

const generateLinkToken = (request, response, next) => {
    Promise.resolve()
        .then(async () => {          
            const configs = {
                user: {
                  client_user_id: 'user-id',
                },
                client_name: 'Plaid Quickstart',
                products: PLAID_PRODUCTS.split(','),
                country_codes: PLAID_COUNTRY_CODES.split(','),
                language: 'en',
              };
              if (PLAID_REDIRECT_URI !== '') {
                configs.redirect_uri = PLAID_REDIRECT_URI;
              }
              try {
                const createTokenResponse = await plaidClient.linkTokenCreate(configs);
                response.json(createTokenResponse.data);
              } catch (error) {
                console.error('Error creating link token:', error);
                response.status(500).json({ error: 'Internal server error' });
              }
              
        })
        .catch(next);
}

const setAccessToken = (request, response, next) => {
  PUBLIC_TOKEN = request.body.public_token;
  Promise.resolve()
    .then(async function() {
      try {
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
          public_token: PUBLIC_TOKEN,
        })
        prettyPrintResponse(tokenResponse)
        ACCESS_TOKEN = tokenResponse.data.access_token;
        ITEM_ID = tokenResponse.data.item_id;
        if (PLAID_PRODUCTS.includes(Products.Transfer)) {
          TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN);
        }
        response.json({
          // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
          error: null,
        });
      } catch(error) {
        console.error('Error creating link token:', error);
        response.status(500).json({ error: 'Internal server error' });
      }
    })
    .catch(next);
}

const getAccount = (request, response, next) => {
  Promise.resolve()
    .then(async function() {
      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: ACCESS_TOKEN
        });
        prettyPrintResponse(accountsResponse);
        response.json(accountsResponse.data);
      } catch (error) {
        console.error('Error creating link token:', error);
        response.status(500).json({ error: 'Internal server error' });
      }
      

    })
    .catch(next);
}


module.exports = {
    generateLinkToken,
    setAccessToken,
    getAccount
}