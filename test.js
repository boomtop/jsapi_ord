const {format} = require('date-fns');
const today = new Date();
const formateDate = format(today, 'dd.MM.yyyy HH:mm:ss');
console.log(formateDate)