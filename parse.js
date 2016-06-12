// Dependencies
var fs = require('fs');
var sqlite3 = require('sqlite3');
var vcardparser = require('vcardparser');
var moment = require('moment');
var phone = require('phone');

// Files
var dbpath = 'db/';
var logpath = 'log/';
var messagesdb = 'messages.db';
var contactsdb = 'contacts.vcf';
var db = new sqlite3.Database(dbpath + messagesdb);

// Contact information
var self = process.argv[2];

// Chat and file storage
var chats = {};
var files = {};

// Log instructions (need to put in failsafes)
console.log('Reading own phone number from command line in format ' +
  '+###########');
console.log('Looking for db/messages.db and db/contacts.vcf');
console.log('Move ~/Library/ApplicationSupport/MobileSync/Backup/' +
  'RECENT_BACKUP_FOLDER/3d0d7e5fb2ce288813306e4d4636395e047a3d28 ' +
  'to db/messages.db');
console.log('Select and export all contacts from Contacts.app in vCard ' +
  'format to db/contacts.vcf');
console.log('Starting message extraction and parsing, this may take a ' +
  'while...');

// Parse messages from each conversation
getPhoneNumbers(function(phoneNumbers) {
  getChatIds(function(chatIds) {
    for (var i in chatIds) {
      var chatId = chatIds[i];
      chats[chatId] = {};
      getMessageIds(chatId, function(chatId, messageIds) {
        getMessages(chatId, messageIds, function(chatId, messages) {
          for (var j in messages) {
            var message = messages[j];
            parseMessage(chatId, message, phoneNumbers, function(chatId,
                message, messageLine) {
              chats[chatId][messageLine] = message;
              if (messages.indexOf(message) == messages.length - 1) {
                files[chatId] = fs.createWriteStream(logpath + chatId +
                  '.txt');
                for (var k in Object.keys(chats[chatId])) {
                  files[chatId].write(Object.keys(chats[chatId])[k] + '\n');
                }
              }
            });
          }
        });
      });
    }
  });
});

function getChatIds(callback) {
  var chatIds = [];
  db.each('select distinct chat_id from chat_message_join', function(err, row) {
    chatIds.push(row.chat_id);
  }, function(err, rowCount) {
    callback(chatIds);
  });
}

function getMessageIds(chatId, callback) {
  var messageIds = [];
  db.each('select message_id from chat_message_join where chat_id=:chatId', {
    ':chatId': chatId
  }, function(err, row) {
    messageIds.push(row.message_id);
  }, function(err, rowCount) {
    callback(chatId, messageIds);
  });
}

function getMessages(chatId, messageIds, callback) {
  var messages = [];
  db.each('select date, is_from_me, handle_id, text from message where ROWID ' +
      'in (' + messageIds.join(',') + ')', function(err, row) {
    messages.push(row);
  }, function (err, rowCount) {
    callback(chatId, messages);
  });
}

function parseMessage(chatId, message, phoneNumbers, callback) {
  var date = moment('2001-01-01T00:00:00').add(message.date, 's').format(
    'YYYY-MM-DD HH:mm:ss');
  var outbound = !!message.is_from_me;
  var text = message.text;
  db.get('select * from handle where ROWID=:handleId', {
    ':handleId': message.handle_id
  }, function(err, row) {
    callback(chatId, message, '[' + date + '] ' + (phoneNumbers[outbound ?
      self : row.id] || row.id) + ': ' + text.replace(/\n/g, ' '));
  });
}

function getPhoneNumbers(callback) {
  fs.readFile(dbpath + contactsdb, 'utf-8', function(err, data) {
    var beginKey = 'BEGIN:VCARD';
    vcards = data.split(beginKey);
    var phoneNumbers = {};
    for (var i in vcards) {
      vcards[i] = beginKey + vcards[i];
      var vcard = vcards[i];
      vcardparser.parseString(vcard, function(err, data) {
        var name = data.fn;
        for (var j in data.tel) {
          var phoneNumber = mapPhoneNumberLetters(data.tel[j].value);
          var phoneNumberEscapeIndex = phoneNumber.indexOf('\\');
          if (phoneNumberEscapeIndex > -1) {
            phoneNumber = phoneNumber.substring(0, phoneNumberEscapeIndex);
          }
          phoneNumber = phoneNumber.replace(/[  \-\+\(\)]/g, '');
          var parsedPhoneNumber = phone(phoneNumber)[0] || '+1' + phoneNumber;
          phoneNumbers[parsedPhoneNumber] = name;
          if (i == vcards.length - 1 && j == data.tel.length - 1) {
            callback(phoneNumbers);
          }
        }
      });
    }
  });
}

function mapPhoneNumberLetters(phoneNumber) {
  var map = {a:2,b:2,c:2,d:3,e:3,f:3,g:4,h:4,i:4,j:5,k:5,l:5,m:6,n:6,o:6,p:7,
    q:7,r:7,s:7,t:8,u:8,v:8,w:9,x:9,y:9,z:9};
  for (var i = 0; i < phoneNumber.length; i++) {
    if (phoneNumber[i].match(/[a-zA-Z]/)) {
      phoneNumber = phoneNumber.substring(0, i) +
        map[phoneNumber[i].toLowerCase()] + phoneNumber.substring(i + 1);
    }
  }
  return phoneNumber;
}
