//this may be used for like 2 commands, rest is just playing around with some stuff and a mini start of a new project. 

const pool = require('./database/pool')
exports.runQuery = function(sql, values, callback) {
    pool.getConnection(function(err, conn) {
        conn.query(sql, values, function (err, results) {
            conn.release()
            callback(results)
        })
      })

}

exports.getRandomNum = function(min, max, callback) {
let random = Math.floor(Math.random() * (+max - +min)) + +min; 
callback(random)

}

exports.getHumanDate = function(date, callback) {
  date = Number(date);
  let today = Math.round(new Date().getTime() / 1000)
  date = date - today
  var h = Math.floor(date / 3600);
  var m = Math.floor(date % 3600 / 60);
  var s = Math.floor(date % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  var humanDate = hDisplay + mDisplay + sDisplay
  callback(humanDate); 
}
//func.getPirate(message.member.id, userInfo[0].credits)
exports.getPirate = function(userInfo, callback) {
  let credits = userInfo[0].credits;
  let vehicle = userInfo[0].vehicle;
  let storage = userInfo[0].storage;
  let title;
  let ship;
  let chest;
  //get users title
  if(credits < 1000) {
    title = 'Poweder Monkey'
  } else if(credits < 2500) {
    title = 'Striker'
  } else if(credits < 3500) {
    title = 'Sea Artist'
  } else {
    title = 'Pirate'
  }
  //Privateersman / Buccaneer / Deckhand / Quartermaster / Boatswain / Navigator / Master Gunner / Cooper

  //get user vehicle
  if(vehicle = 1) {
    ship = 'A raft'
  } else if(vehicle = 2) {
    ship = 'Sailboat'
  } else if (vehicle = 3) {
    ship = 'boat'
  } else {
    ship = 'None'
  }

  //get user storage
  if(storage == 1) {
    chest = 'Treasure Pouch (5)'
  } else if(storage == 2) {
    chest = 'Small Treasure Chest (8)'
  } else if(storage == 3) {
    chest = 'Large Treasure chest (12)'
  } else {
    chest = 'Chest'
  }

  let pirateInfo;
  
  pirateInfo = {pirateTitle: `${title}`, ship: `${ship}`, storage: `${chest}`}

  //console.log(pirateInfo)
callback(pirateInfo)
}

exports.getPercent = function(number, percent, callback) {

  let final;
  let fee = percent / 100;
  let subtracted = number * fee;
  let sub = number - subtracted;

  final = {minus: `${subtracted}`, total: `${sub}`}
  callback(final)

}

