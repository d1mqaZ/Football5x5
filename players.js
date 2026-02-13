// ФАЙЛ: players.js
// ДАННЫЕ ИГРОКОВ - РЕДАКТИРУЙТЕ ЭТОТ ФАЙЛ ДЛЯ ОБНОВЛЕНИЯ СПИСКА

// ВЕРСИЯ ДАННЫХ - УВЕЛИЧИВАЙТЕ ПРИ ОБНОВЛЕНИИ СПИСКА
const PLAYERS_DATA_VERSION = 3;

// КОНСТАНТЫ СТАТУСОВ
const PLAYER_STATUS = {
    REGULAR: "regular",   // Абонемент
    GUEST: "guest",       // Гость
    LEGIONER: "legioner"  // Легионер (добавляется через интерфейс)
};

// ОСНОВНОЙ СПИСОК ИГРОКОВ С СТАТУСАМИ
// Редактируйте этот массив для добавления/удаления игроков
const DEFAULT_PLAYERS_LIST = [
    {id: 1, name: "Алексей Беть", rating: 7.5, status: PLAYER_STATUS.REGULAR},
    {id: 2, name: "Стас Калистратов", rating: 6.7, status: PLAYER_STATUS.GUEST},
    {id: 3, name: "Леха АБ", rating: 8.1, status: PLAYER_STATUS.GUEST},
    {id: 4, name: "Саня кэп", rating: 6.4, status: PLAYER_STATUS.GUEST},
    {id: 5, name: "Кирилл Калистратов", rating: 7.0, status: PLAYER_STATUS.GUEST},
    {id: 6, name: "Алексей Большой", rating: 6.2, status: PLAYER_STATUS.GUEST},
    {id: 7, name: "Андрей Розина", rating: 5.8, status: PLAYER_STATUS.REGULAR},
    {id: 8, name: "Денис Жуков", rating: 7.8, status: PLAYER_STATUS.REGULAR},
    {id: 9, name: "Дима Седов", rating: 8.6, status: PLAYER_STATUS.REGULAR},
    {id: 10, name: "Евгений Шушары", rating: 6.6, status: PLAYER_STATUS.GUEST},
    {id: 11, name: "Иван Деменев", rating: 7.0, status: PLAYER_STATUS.REGULAR},
    {id: 12, name: "Игорь Калистратов", rating: 8.7, status: PLAYER_STATUS.REGULAR},
    {id: 13, name: "Никитос", rating: 6.4, status: PLAYER_STATUS.GUEST},
    {id: 14, name: "Павел", rating: 5.6, status: PLAYER_STATUS.REGULAR},
    {id: 15, name: "Соколов Максим", rating: 5.3, status: PLAYER_STATUS.GUEST},
    {id: 16, name: "Дима Занько", rating: 8.1, status: PLAYER_STATUS.REGULAR},
    {id: 17, name: "Иван Аскаров", rating: 6.7, status: PLAYER_STATUS.GUEST},
    {id: 18, name: "Валентин", rating: 8.0, status: PLAYER_STATUS.GUEST},
    {id: 19, name: "Влад Меленевский", rating: 5.9, status: PLAYER_STATUS.REGULAR},
    {id: 20, name: "Алексей Паук", rating: 9.2, status: PLAYER_STATUS.GUEST},
    {id: 21, name: "Андрей Буштак", rating: 4.5, status: PLAYER_STATUS.REGULAR},
    {id: 22, name: "Андрей Здравков", rating: 7.3, status: PLAYER_STATUS.REGULAR},
    {id: 23, name: "Леша iSerenity", rating: 6.2, status: PLAYER_STATUS.REGULAR},
    {id: 24, name: "Александр Кунтыш", rating: 5.9, status: PLAYER_STATUS.REGULAR},
    {id: 25, name: "Игорь Иванов", rating: 8.3, status: PLAYER_STATUS.REGULAR},
    {id: 26, name: "Сергей Кальчук", rating: 8.2, status: PLAYER_STATUS.REGULAR}
];

// НАСТРОЙКИ ПРОГРАММЫ
const APP_SETTINGS = {
    maxPlayersPerTeam: 5,
    minRating: 1,
    maxRating: 10,
    defaultLegionerRating: 5.0,
    availableColors: ['blue', 'green', 'orange', 'red', 'white']
};

// ЭКСПОРТ ДАННЫХ ДЛЯ ОСНОВНОЙ ПРОГРАММЫ
window.playersData = {
    // Основные данные
    version: PLAYERS_DATA_VERSION,
    players: DEFAULT_PLAYERS_LIST,
    settings: APP_SETTINGS,
    statuses: PLAYER_STATUS,
    
    // Методы для работы с данными
    getPlayerById: function(id) {
        return this.players.find(p => p.id === id);
    },
    
    getPlayerByName: function(name) {
        return this.players.find(p => p.name === name);
    },
    
    getStatusDisplayName: function(status) {
        const statusNames = {
            [PLAYER_STATUS.REGULAR]: "Абонемент",
            [PLAYER_STATUS.GUEST]: "Гость",
            [PLAYER_STATUS.LEGIONER]: "Легионер"
        };
        return statusNames[status] || status;
    },
    
    getStatusClass: function(status) {
        const statusClasses = {
            [PLAYER_STATUS.REGULAR]: "status-regular",
            [PLAYER_STATUS.GUEST]: "status-guest",
            [PLAYER_STATUS.LEGIONER]: "status-legioner"
        };
        return statusClasses[status] || "";
    },
    
    addPlayer: function(name, rating, status = PLAYER_STATUS.GUEST) {
        const newId = Math.max(...this.players.map(p => p.id), 0) + 1;
        const newPlayer = {
            id: newId,
            name: name,
            rating: rating,
            status: status,
            present: false
        };
        this.players.push(newPlayer);
        this.version++;
        console.log(`Добавлен новый игрок: ${name} (ID: ${newId}, рейтинг: ${rating}, статус: ${status})`);
        return newPlayer;
    },
    
    removePlayer: function(id) {
        const index = this.players.findIndex(p => p.id === id);
        if (index !== -1) {
            const removedPlayer = this.players.splice(index, 1)[0];
            this.version++;
            console.log(`Удален игрок: ${removedPlayer.name}`);
            return removedPlayer;
        }
        return null;
    },
    
    updatePlayerRating: function(id, newRating) {
        const player = this.getPlayerById(id);
        if (player) {
            player.rating = newRating;
            this.version++;
            console.log(`Обновлен рейтинг игрока ${player.name}: ${newRating}`);
            return true;
        }
        return false;
    },
    
    updatePlayerStatus: function(id, newStatus) {
        const player = this.getPlayerById(id);
        if (player) {
            player.status = newStatus;
            this.version++;
            console.log(`Обновлен статус игрока ${player.name}: ${newStatus}`);
            return true;
        }
        return false;
    },
    
    // Получить список имен всех игроков
    getAllPlayerNames: function() {
        return this.players.map(p => p.name);
    },
    
    // Получить отсортированный список по рейтингу
    getPlayersSortedByRating: function(descending = true) {
        return [...this.players].sort((a, b) => 
            descending ? b.rating - a.rating : a.rating - b.rating
        );
    },
    
    // Получить цвет по названию
    getColorName: function(colorCode) {
        const colorNames = {
            'blue': 'Синие',
            'green': 'Зеленые',
            'orange': 'Оранжевые',
            'red': 'Красные',
            'white': 'Белые'
        };
        return colorNames[colorCode] || colorCode;
    },
    
    // Получить цвет в формате CSS
    getColorValue: function(colorCode) {
        const colorValues = {
            'blue': '#3498db',
            'green': '#2ecc71',
            'orange': '#e67e22',
            'red': '#e74c3c',
            'white': '#ecf0f1'
        };
        return colorValues[colorCode] || '#95a5a6';
    }
};

// Сообщение в консоль при загрузке
console.log(`✅ players.js загружен (версия ${PLAYERS_DATA_VERSION})`);
console.log(`📊 Игроков в списке: ${DEFAULT_PLAYERS_LIST.length}`);
