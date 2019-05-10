'use strict';

const { dialogflow, BasicCard, Image, Button} = require('actions-on-google');
const functions = require('firebase-functions');
const Scry = require('scryfall-sdk');

const app = dialogflow({ debug: true });

function legal(result) {
  const formats = Object.keys(result.legalities);
  const legals = [];
  for (let i = 0; i < formats.length; i++) {
    if (result.legalities[formats[i]] === 'legal') {
      legals.push(` ${formats[i]}`);
    }
  }
  return legals;
}

function response(conv, result){
  const legalList = legal(result);
  if((legalList === undefined || legalList.length === 0)){
  	conv.ask(`${result.name} isn't legal in any format`);
  }else{
    conv.ask(`${result.name} is legal for${legalList}`);
  }
  conv.ask(new BasicCard({
  	text: `${result.name}`,
    image: new Image({
    	url: result.image_uris.normal,
      	alt: `
				MTG Card Image.
				Name: ${result.name}.
				Color: ${result.colors}.
				Cost: ${result.mana_cost}.
				Type: ${result.type_line}.
				Text (Oracle):${result.oracle_text}.
				Power: ${result.power}.
				toughness: ${result.toughness}.`
    }),
    buttons: new Button({
    	title: `See ${result.name} on Scryfall`,
    	url: result.scryfall_uri,
  	}),
    display: 'DEFAULT'
  }));
}

const callback = (conv, {any}) => {
  return Scry.Cards.byName(any).then(
    result => response(conv, result))
    .catch((err) => {
      conv.ask(`Sorry, could not find ${any}, can you try again?`);
      console.log(err);
    }
  );
};

app.intent('legal', callback);
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);