import { Meteor } from 'meteor/meteor'
// const Nightmare = require('nightmare')

Meteor.startup(() => {
  // code to run on server at startup

//
})

// Meteor.methods({
//   nightmare:function(){
//     var nightmare = Nightmare({ show: false });
//
//     nightmare
//       .on('console', function (type, msg) {
//           console.log(msg);
//       })
//       .goto('http://localhost:3000')
//       // .on('console', function(type, errorMessage, errorStack ){
//       //   console.log('console out', type );
//       // })
//       .evaluate(function () {
//         return document
//       })
//       .end()
//       .then(function (result) {
//         console.log(result);
//         process.send('in child process ' + result)
//       })
//       .catch(function (error) {
//         console.error('Search failed:', error);
//       });
//
//       // nightmare.on('console', function(type, errorMessage, errorStack ){
//       //   console.log('console out', type );
//       // })
//   }
// });
