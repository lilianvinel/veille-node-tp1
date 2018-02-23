"use strict";
const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const util = require("util");
const peupler = require("./mes_modules/peupler");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // générateur de template

app.get('/accueil', (req, res) => {
 res.render('accueil.ejs');
})

app.get('/rechercher', (req, res) => {
	let cursor = db.collection('adresse').find({nom:"rien"}).toArray((err, resultat) => {

		res.render('rechercher.ejs', {adresses: resultat})
	})
})

app.get('/adresses', (req, res) => {
 
console.log(req.body)
 var cursor = db.collection('adresse')
                .find().toArray((err, resultat) => {
 if (err) return console.log(err)
 // transfert du contenu vers la vue adresses.ejs (renders)
 res.render('membres.ejs', {adresses: resultat});
 }) 
})

app.post('/accueil',  (req, res) => {
 // Preparer l'output en format JSON
// on utilise l'objet req.body pour récupérer les données POST
db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 res.redirect('/adresses')
 })

})

app.get('/rechercher/:attribut/:valeur',  (req, res) => {
	let attribut = '"'+ req.params.attribut +'"'

	let valeur = '"'+ req.params.valeur +'"'
	console.log(valeur);

	let recherche =JSON.parse('{'+ attribut+':'+valeur+'}')
// on utilise l'objet req.body pour récupérer les données POST
let cursor = db.collection('adresse').find(recherche
).toArray((err, resultat) => {

		res.render('rechercher.ejs', {adresses: resultat, attribut, valeur})
	})
})

app.get('/peupler', (req, res) => {
	db.collection('adresse').save(JSON.parse(peupler()), (err, result) => {
 		if (err) return console.log(err)
 		res.redirect('/adresses')
 })
})

app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle

	let ordre = (req.params.ordre == 'asc' ? 1 : -1)

	let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){

		ordre = (req.params.ordre == "asc" ? "desc" : "asc")

		console.log(ordre);

		res.render('membres.ejs', {adresses: resultat, cle, ordre})
	})
})	

app.post('/modifier', (req, res) => {
req.body._id = ObjectID(req.body._id)

	console.log('util = ' + util.inspect(req.body));

	 db.collection('adresse').save(req.body, (err, result) => 
	 {
	 if (err) return console.log(err)

		 console.log('sauvegarder dans la BD')
		 res.redirect('/adresses')
	 })
})



app.get('/detruire/', (req, res) => {
 db.collection('adresse').deleteMany({}, (err, resultat) => {

if (err) return console.log(err)
 res.redirect('/adresses')  // redirige vers la route qui affiche la collection
 })
})

app.get('/detruire/:id', (req, res) => {
 var id = req.params.id
 console.log(id)
 db.collection('adresse').findOneAndDelete({"_id": ObjectID(id)}, (err, resultat) => {

if (err) return console.log(err)
 res.redirect('/adresses')  // redirige vers la route qui affiche la collection
 })
})	

let db; // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresse')
// lancement du serveur Express sur le port 8081
 app.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})