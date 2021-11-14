const csv2js = require('csvtojson');
const jsonMapper = require('json-mapper-json');
const format = require('date-format');
const fse = require('fs-extra');
const _csvInputFilePath = __dirname + '/data/in/csv';
const _csvProcessedFilePath = __dirname + '/data/processed/csv';
const _csvOutputFilePath = __dirname + '/data/out';
const outputTemplate =
  {
      'mrn' : {
          path: 'mrn',
          required: true,
          formatting: (value) => value.toString(),
          type:String,
        },
      'firstName' : {
       path: 'first_name',
       formatting: (value) => value.toString(),
       type:String,
     },
      'lastName' : {
        path: 'last_name',
        formatting: (value) => value.toString(),
        type:String,

      },
      'middleName' : {
        path: 'middle_name',
        formatting: (value) => { if (value != null) return value.toString(); else return null; },
        required: false,
        type:String,

      },
      'demographics' : {
        path:'$empty',
        nested: {
          'dateOfBirth': {
            path: 'date_of_birth',
            formatting: (value) => {
              return format.asString('yyyy-MM-dd', new Date(value));
            },
          },
          'sex': {
            path: 'sex',
            formatting: (value) => value.toString(),
          },
        },
      },
      'conditions': {
            path: '$empty',
            nested: {
            'code': {
              path : 'conditions',
              formatting: (value) => value.split("|"),
             },

            'name' : {
              path: '_',
              required:false,
              formatting: (value) => { if (value != null) return value.toString(); else return null;},
            },

          },
      },
  };


fse.readdir(_csvInputFilePath, function(err, files){
  if (err) throw new Error(err);

   files.forEach(function(file) {
    csv2js({
      noheader:false,
      delimiter:[",","|"],
      quote: 'on',
    }).fromFile(_csvInputFilePath + '/' + file).then(function(jsonArray){
      console.log(jsonArray);
      jsonArray.forEach(function (jsonObj){
        jsonMapper(jsonObj, outputTemplate).then(function(result) {
          console.log(result);
          fse.outputFile(_csvOutputFilePath + '/' + + new Date().getTime() + '/patient_' +result.mrn+ '.json', JSON.stringify(result), (err) => {
            if (err)  console.error(err);
            return;
          });
        }).catch(function(err){
          console.error(err);
        });

      });

    });
    /*
    fse.readFile(__dirname + '/data/in/csv/' + file, function(err, data) {
       if (err) console.error(err);

        parser.parseStringPromise(data)
        .then(function(res){
          jsonMapper(res, outputTemplate).then(function(result) {
            console.log('%o',result);
            fse.outputFile(__dirname + '/data/out/' + new Date().getTime() + '/patient_' +result.mrn+ '.json', JSON.stringify(result), (err) => {
              if (err)  console.error(err);
              return;
            });
          });
        })
    .catch(function(err){
      console.error(err);
    })
  });
*/
  fse.move(_csvInputFilePath + '/' + file, _csvProcessedFilePath + '/' + file, function(err) {
    if (err) return console.error(err);
    console.log("successfully processed " + file);
  });

 });
});
