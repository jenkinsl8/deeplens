const xml2js = require('xml2js');
const jsonMapper = require('json-mapper-json');
const format = require('date-format');
const fse = require('fs-extra');
const _xmlInputFilePath = __dirname + '/data/in/xml';
const _xmlInputFilePathProcessedFilePath = __dirname + '/data/processed/xml';
const _xmlOutputFilePath = __dirname + '/data/out';

const outputTemplate =
  {
      'mrn' : {
        required: true,
          path: 'patient.medicalRecordNum',
          formatting: (value) => value.toString(),
          type:String,
        },
      'firstName' : {
       path: 'patient.firstName',
       formatting: (value) => value.toString(),
       type:String,
     },
      'lastName' : {
        path: 'patient.lastName',
        formatting: (value) => value.toString(),
        type:String,

      },
      'middleName' : {
        path: 'patient.middleName',
        formatting: (value) => { if (value != null) return value.toString(); else return null; },
        required: false,
        type:String,

      },
      'demographics' : {
        path:'patient.demographics.$item',
        nested: {
          'dateOfBirth': {
            path: 'dateOfBirth',
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
            path: 'patient.diagnoses.$item.diagnosis',
            nested: {
            'code': {
              path : '$.code',
              formatting: (value) => value.toString(),
             },

            'name' : {
              path: '_',
              formatting: (value) => value.toString(),
            },

          },
      },
  };

fse.readdir(_xmlInputFilePath, function(err, files){
  if (err) throw new Error(err);

   files.forEach(function(file) {
    fse.readFile(_xmlInputFilePath + '/' + file, function(err, data) {
       if (err) console.error(err);
        const parser = new xml2js.Parser();
        parser.parseStringPromise(data)
        .then(function(res){
          jsonMapper(res, outputTemplate).then(function(result) {
            console.log('%o',result);
            fse.outputFile(_xmlOutputFilePath + '/' + new Date().getTime() + '/patient_' +result.mrn+ '.json', JSON.stringify(result), (err) => {
              if (err) console.error(err);
              return;
            });
          });
        })
    .catch(function(err){
      console.error(err);
    })
  });
  fse.move(__xmlInputFilePath + '/' + file, _xmlInputFilePathProcessedFilePath + '/' + file, function(err) {
    if (err) return console.error(err);
    console.log("successfully processed " + file);
  });
 });
});
