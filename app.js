const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const {format} = require('date-fns');
const DB = new sqlite3.Database('database.db');
const PORT = 3100;

// middleware для авторизации
//const basicAuth = require('express-basic-auth')
//app.use(basicAuth({
//    users: { 'username': 'username' }
//}))

// Middleware для парсинга JSON
app.use(express.json());


// Создание таблицы
DB.serialize(() => {
    DB.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, \
        formateDate DATE,\
        formateTime DATE,\
        token TEXT,\
        order_guid TEXT, \
        order_doc_number INTEGER,\
        order_status TEXT,\
        order_date_created TEXT,\
        order_date_closed TEXT,\
        order_date_finishplanned TEXT,\
        order_sum INTEGER,\
        order_car_number INTEGER,\
        order_car_make TEXT, \
        order_master TEXT, \
        order_car_km TEXT, \
        order_link1 TEXT, \
        order_link2 TEXT)");
});


const tokenList = ['LKJHSDFlsdhfgfghfghsdh', '90dsjfoisdjoif']
// Добавление новой записи
app.post('/api/1c', (req, res) => {
    const { token, 
        order_doc_number, 
        order_guid,
        order_status,
        order_date_created,
        order_date_closed,
        order_date_finishplanned,
        order_sum,
        order_car_number,
        order_car_make,
        order_master } = req.body;
    const today = new Date();
    const formateDate = format(today, 'dd.MM.yyyy');
    const formateTime = format(today, 'HH:mm:ss');

    if (tokenList.find(item => item === token) !== undefined){
        console.log('token is correct');
        const stmt = DB.prepare("INSERT INTO messages (token, formateDate, formateTime, order_doc_number, order_guid, order_status, \
            order_date_created, order_date_closed, \
            order_date_finishplanned, order_sum, order_car_number,\
            order_car_make, order_master) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.run(token, formateDate, formateTime, order_doc_number, order_guid, order_status, order_date_created, order_date_closed,
            order_date_finishplanned, order_sum, order_car_number,
            order_car_make, order_master, function(err) {
            if (err) {
                res.status(500).json({ error: err.message});
                return;
            }
            res.status(201).json({ id: this.lastID, formateDate, formateTime, order_doc_number, order_guid, order_status, order_date_created, order_date_closed,
                order_date_finishplanned, order_sum, order_car_number,
                order_car_make, order_master});
        });
        stmt.finalize();
    }
    else{
        res.status(201).json('Error');
        // stmt.finalize();
        }    
});

// Эндпоин на проверку и замену
app.post('/api/add', (req, res) => {
    const order_guid_search = req.body;
    const result = Object.values(order_guid_search)[2];
    const { token, 
        order_doc_number, 
        order_guid,
        order_status,
        order_date_created,
        order_date_closed,
        order_date_finishplanned,
        order_sum,
        order_car_number,
        order_car_make,
        order_master,
        order_car_km,
        order_link1,
        order_link2} = req.body;
        
    const today = new Date();
    const formateDate = format(today, 'dd.MM.yyyy');
    const formateTime = format(today, 'HH:mm:ss');
    if (tokenList.find(item => item === token) !== undefined){
    // Функция для проверки наличия значения
        function checkValueExists(value) {
            const sql = 'SELECT EXISTS(SELECT order_guid FROM messages WHERE order_guid = ?)';
            
            DB.get(sql, [value], (err, row) => {
                if (err) {
                    console.error('Ошибка при выполнении запроса:', err.message);
                    return;
                }
                
                if (row['EXISTS(SELECT order_guid FROM messages WHERE order_guid = ?)']) {
                    if (tokenList.find(item => item === token) !== undefined){
                        const stmt = `UPDATE messages SET token = ?, 
                            order_doc_number = ?, 
                            order_status = ?,
                            order_date_created = ?,
                            order_date_closed = ?,
                            order_date_finishplanned = ?,
                            order_sum = ?,
                            order_car_number = ?,
                            order_car_make = ?,
                            order_master = ?,
                            order_car_km = ?,
                            order_link1 = ?,
                            order_link2 = ?
                        WHERE order_guid = (${'"'+value+'"'})`;
                        DB.run(stmt, [ token, 
                            order_doc_number, 
                            order_status,
                            order_date_created,
                            order_date_closed,
                            order_date_finishplanned,
                            order_sum,
                            order_car_number,
                            order_car_make,
                            order_master,
                            order_car_km,
                            order_link1,
                            order_link2], function (err) {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            if (this.changes === 0) {
                                return res.status(404).send(err);
                            }
                            res.send('Значение обновлено');
                            })
                    }

                    console.log(`Значение "${value}" существует в базе данных.`);
                } else {
                    const stmt = DB.prepare("INSERT INTO messages (token, formateDate, formateTime, order_doc_number, order_guid, order_status, \
                        order_date_created, order_date_closed, \
                        order_date_finishplanned, order_sum, order_car_number,\
                        order_car_make, order_master, order_car_km, order_link1, order_link2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    stmt.run(token, formateDate, formateTime, order_doc_number, order_guid, order_status, order_date_created, order_date_closed,
                        order_date_finishplanned, order_sum, order_car_number,
                        order_car_make, order_master, order_car_km, order_link1, order_link2, function(err) {
                        if (err) {
                            res.status(500).json({ error: err.message});
                            return;
                        }
                        res.status(201).json({ id: this.lastID, formateDate, formateTime, order_doc_number, order_guid, order_status, order_date_created, order_date_closed,
                            order_date_finishplanned, order_sum, order_car_number,
                            order_car_make, order_master, order_car_km, order_link1, order_link2});
                    });
                    stmt.finalize();

                    console.log(`Значение "${value}" не найдено в базе данных.`);
                }
            });
        }
    }
    else{
        res.status(201).json('Error');
        // stmt.finalize();
        } 

        // использование
    checkValueExists(result);


});    

// GET-эндпоинт для получения всех элементов
app.get('/api/list', (req, res) => {
    DB.all("SELECT * FROM messages", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });


});

// не используется
app.get('/1cMesaga1', (req, res) => {
    DB.all("SELECT * FROM messages \
        WHERE send NOT NULL", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

