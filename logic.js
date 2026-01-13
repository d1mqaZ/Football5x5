// ФАЙЛ: logic.js
// ЛОГИКА ПРОГРАММЫ - ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ПРИЛОЖЕНИЯ
let allPlayers = [];
let legioners = [];
let teamSettings = {
    count: 0,
    colors: []
};
let currentStep = 1;
let showOnlyPresent = false;
let stopOptimization = false;

// DOM ЭЛЕМЕНТЫ (будут найдены при инициализации)
let legionerNameInput, legionerRatingInput, playersTableBody, teamsContainer;
let totalPlayersCount, presentPlayersCount, legionersCount, possibleTeamsCount;
let warningContainer, statsGrid, teamColorsSection, selectedColorsInfo;
let teamsCountSpan, teamSelectionSection, playerListSection, legionerSection;
let requiredPlayersCount, playersRequiredInfo, balanceResult, splitButtonText;
let splitButtonLoading, progressContainer, progressBar, progressText;

// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
function initApp() {
    console.log("🚀 Инициализация приложения...");
    
    // Находим все DOM элементы
    findDomElements();
    
    // Загружаем данные игроков (СТРОГИЙ РЕЖИМ - только из players.js)
    if (!loadPlayersData()) {
        // Если не удалось загрузить players.js, останавливаем программу
        showCriticalError();
        return;
    }
    
    // Загружаем сохраненные данные
    loadFromStorage();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Обновляем интерфейс
    updateStepIndicator();
    
    console.log("✅ Приложение инициализировано");
}

// ПОИСК DOM ЭЛЕМЕНТОВ
function findDomElements() {
    legionerNameInput = document.getElementById('legionerName');
    legionerRatingInput = document.getElementById('legionerRating');
    playersTableBody = document.getElementById('playersTableBody');
    teamsContainer = document.getElementById('teamsContainer');
    totalPlayersCount = document.getElementById('totalPlayersCount');
    presentPlayersCount = document.getElementById('presentPlayersCount');
    legionersCount = document.getElementById('legionersCount');
    possibleTeamsCount = document.getElementById('possibleTeamsCount');
    warningContainer = document.getElementById('warningContainer');
    statsGrid = document.getElementById('statsGrid');
    teamColorsSection = document.getElementById('teamColorsSection');
    selectedColorsInfo = document.getElementById('selectedColorsInfo');
    teamsCountSpan = document.getElementById('teamsCount');
    teamSelectionSection = document.getElementById('teamSelectionSection');
    playerListSection = document.getElementById('playerListSection');
    legionerSection = document.getElementById('legionerSection');
    requiredPlayersCount = document.getElementById('requiredPlayersCount');
    playersRequiredInfo = document.getElementById('playersRequiredInfo');
    balanceResult = document.getElementById('balanceResult');
    splitButtonText = document.getElementById('splitButtonText');
    splitButtonLoading = document.getElementById('splitButtonLoading');
    progressContainer = document.getElementById('progressContainer');
    progressBar = document.getElementById('progressBar');
    progressText = document.getElementById('progressText');
}

// ЗАГРУЗКА ДАННЫХ ИГРОКОВ (СТРОГИЙ РЕЖИМ)
function loadPlayersData() {
    if (!window.playersData || !window.playersData.players) {
        console.error('❌ Файл players.js не загружен или содержит ошибки');
        return false;
    }
    
    console.log(`📥 Загружаем данные игроков (версия ${window.playersData.version})`);
    
    // Проверяем версию данных
    const savedVersion = localStorage.getItem('playersDataVersion');
    const currentVersion = window.playersData.version;
    
    // Копируем игроков из конфига
    const playersFromConfig = window.playersData.players;
    
    // Если это первый запуск или версия обновилась
    if (!savedVersion || parseInt(savedVersion) < currentVersion) {
        console.log(`🔄 Обновление данных с версии ${savedVersion || 'неизвестно'} до ${currentVersion}`);
        
        // Сохраняем статусы текущих игроков
        const playerStatusMap = {};
        allPlayers.forEach(player => {
            playerStatusMap[player.name] = {
                present: player.present,
                status: player.status
            };
        });
        
        // Создаем новый список с сохранением статусов
        allPlayers = playersFromConfig.map(player => ({
            ...player,
            present: playerStatusMap[player.name] ? playerStatusMap[player.name].present : false,
            // Если у старого игрока был статус, сохраняем его, иначе используем из конфига
            status: playerStatusMap[player.name] ? playerStatusMap[player.name].status : player.status
        }));
        
        // Сохраняем новую версию
        localStorage.setItem('playersDataVersion', currentVersion);
        saveToStorage();
        
        showInfo(`Список игроков обновлен до версии ${currentVersion}`);
    } else if (allPlayers.length === 0) {
        // Первый запуск - просто копируем данные
        allPlayers = playersFromConfig.map(player => ({
            ...player,
            present: false
        }));
    }
    
    console.log(`✅ Загружено ${allPlayers.length} игроков`);
    return true;
}

// КРИТИЧЕСКАЯ ОШИБКА - players.js не загружен
function showCriticalError() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #e74c3c;">❌ Ошибка загрузки</h1>
            <div class="error" style="margin: 30px 0; text-align: left;">
                <h3>Файл players.js не найден или содержит ошибки</h3>
                <p><strong>Причина:</strong> Программа не может загрузить список игроков.</p>
                <p><strong>Решение:</strong></p>
                <ol>
                    <li>Убедитесь, что файл <strong>players.js</strong> находится в той же папке, что и index.html</li>
                    <li>Проверьте, что файл players.js содержит правильную структуру данных</li>
                    <li>Если файл был изменен, восстановите оригинальную версию</li>
                </ol>
                <p><strong>Текущая папка должна содержать три файла:</strong></p>
                <ul>
                    <li>index.html</li>
                    <li>players.js</li>
                    <li>logic.js</li>
                </ul>
            </div>
            <button onclick="location.reload()" class="secondary" style="margin-top: 20px;">
                Обновить страницу
            </button>
        </div>
    `;
    
    // Блокируем все кнопки
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
    });
}

// НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
function setupEventListeners() {
    // Кнопки выбора количества команд
    document.getElementById('twoTeamsBtn').addEventListener('click', () => selectTeamCount(2));
    document.getElementById('threeTeamsBtn').addEventListener('click', () => selectTeamCount(3));
    
    // Кнопка подтверждения выбора команд
    document.getElementById('confirmTeamSelectionBtn').addEventListener('click', confirmTeamSelection);
    
    // Кнопки управления игроками
    document.getElementById('markAllBtn').addEventListener('click', () => markAllPlayers(true));
    document.getElementById('unmarkAllBtn').addEventListener('click', () => markAllPlayers(false));
    document.getElementById('showOnlyPresentBtn').addEventListener('click', () => toggleFilter(true));
    document.getElementById('showAllBtn').addEventListener('click', () => toggleFilter(false));
    document.getElementById('confirmPlayersBtn').addEventListener('click', confirmPlayersList);
    
    // Кнопки легионеров
    document.getElementById('addLegionerBtn').addEventListener('click', addLegioner);
    document.getElementById('clearLegionersBtn').addEventListener('click', clearAllLegioners);
    
    // Кнопки управления командами
    document.getElementById('splitTeamsBtn').addEventListener('click', splitIntoTeams);
    document.getElementById('restartBtn').addEventListener('click', restartApp);
    
    // Обработчики для выбора цветов
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            toggleColorSelection(this.dataset.color);
        });
    });
    
    // Добавление легионера по Enter
    legionerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addLegioner();
    });
    
    legionerRatingInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addLegioner();
    });
    
    // Обработка касаний для мобильных устройств
    document.addEventListener('touchstart', function() {}, {passive: true});
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ====================

// ВЫБОР КОЛИЧЕСТВА КОМАНД
function selectTeamCount(count) {
    teamSettings.count = count;
    
    // Обновляем кнопки
    document.getElementById('twoTeamsBtn').classList.remove('selected');
    document.getElementById('threeTeamsBtn').classList.remove('selected');
    
    if (count === 2) {
        document.getElementById('twoTeamsBtn').classList.add('selected');
    } else {
        document.getElementById('threeTeamsBtn').classList.add('selected');
    }
    
    // Показываем выбор цветов
    teamColorsSection.classList.remove('hidden');
    teamsCountSpan.textContent = count;
    selectedColorsInfo.classList.remove('hidden');
    
    // Сбрасываем выбор цветов
    teamSettings.colors = [];
    updateColorSelection();
    
    // Обновляем информацию
    requiredPlayersCount.textContent = count * 5;
    
    showInfo(`Выбрано ${count} команды. Теперь выберите цвета манишек.`);
}

// ПОДТВЕРЖДЕНИЕ ВЫБОРА КОМАНД
function confirmTeamSelection() {
    if (teamSettings.colors.length !== teamSettings.count) {
        showWarning(`Необходимо выбрать ${teamSettings.count} цвета для команд`);
        return;
    }
    
    currentStep = 2;
    updateStepIndicator();
    
    playerListSection.classList.remove('hidden');
    updatePlayersList();
    updateCounters();
    
    setTimeout(() => {
        playerListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ПОДТВЕРЖДЕНИЕ СПИСКА ИГРОКОВ
function confirmPlayersList() {
    const presentPlayers = getAllPresentPlayers();
    
    if (presentPlayers.length === 0) {
        showWarning('Не отмечено ни одного игрока. Отметьте пришедших игроков.');
        return;
    }
    
    currentStep = 3;
    updateStepIndicator();
    
    legionerSection.classList.remove('hidden');
    updateSplitButtonState();
    
    setTimeout(() => {
        legionerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ДОБАВЛЕНИЕ ЛЕГИОНЕРА
function addLegioner() {
    const name = legionerNameInput.value.trim();
    const rating = parseFloat(legionerRatingInput.value);
    
    if (!name) {
        showWarning('Введите имя легионера');
        return;
    }
    
    if (isNaN(rating) || rating < 1 || rating > 10) {
        showWarning('Рейтинг должен быть числом от 1 до 10');
        return;
    }
    
    const newLegioner = {
        id: Date.now(),
        name: name,
        rating: rating,
        present: true,
        status: "legioner",
        isLegioner: true
    };
    
    legioners.push(newLegioner);
    updatePlayersList();
    updateCounters();
    
    legionerNameInput.value = '';
    legionerRatingInput.value = '5';
    legionerNameInput.focus();
    
    updateSplitButtonState();
}

// УДАЛЕНИЕ ЛЕГИОНЕРА (вызывается из HTML)
function removeLegioner(id) {
    legioners = legioners.filter(player => player.id !== id);
    updatePlayersList();
    updateCounters();
    updateSplitButtonState();
}

// УДАЛЕНИЕ ВСЕХ ЛЕГИОНЕРОВ
function clearAllLegioners() {
    if (legioners.length === 0) {
        showInfo('Нет легионеров для удаления');
        return;
    }
    
    if (confirm(`Удалить всех легионеров (${legioners.length} человек)?`)) {
        legioners = [];
        updatePlayersList();
        updateCounters();
        updateSplitButtonState();
        showInfo('Все легионеры удалены');
    }
}

// ПОЛУЧЕНИЕ ВСЕХ ПРИШЕДШИХ ИГРОКОВ
function getAllPresentPlayers() {
    const allPlayersCombined = [...allPlayers, ...legioners];
    return allPlayersCombined.filter(player => player.present);
}

// ОБНОВЛЕНИЕ СПИСКА ИГРОКОВ В ТАБЛИЦЕ (С КОЛОНКОЙ СТАТУС)
function updatePlayersList() {
    playersTableBody.innerHTML = '';
    
    const allPlayersCombined = [...allPlayers, ...legioners];
    
    if (allPlayersCombined.length === 0) {
        playersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
                    Нет игроков.
                </td>
            </tr>
        `;
        return;
    }
    
    let playersToShow = allPlayersCombined;
    if (showOnlyPresent) {
        playersToShow = allPlayersCombined.filter(player => player.present);
        
        if (playersToShow.length === 0) {
            playersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
                        Нет игроков, отмеченных как "пришедшие на игру".
                    </td>
                </tr>
            `;
            return;
        }
    }
    
    const sortedPlayers = [...playersToShow].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedPlayers.forEach(player => {
        const row = document.createElement('tr');
        if (player.present) {
            row.classList.add('present');
        }
        
        // Определяем отображаемый статус
        let statusDisplay = "";
        let statusClass = "";
        
        if (window.playersData && window.playersData.getStatusDisplayName) {
            statusDisplay = window.playersData.getStatusDisplayName(player.status);
            statusClass = window.playersData.getStatusClass(player.status);
        } else {
            // Резервный вариант если playersData не загружен
            const statusMap = {
                "regular": "Абонемент",
                "guest": "Гость",
                "legioner": "Легионер"
            };
            statusDisplay = statusMap[player.status] || player.status;
            statusClass = `status-${player.status}`;
        }
        
        // Определяем тип игрока
        const playerType = player.status === "legioner" ? "Легионер" : "Основной";
        
        row.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" ${player.present ? 'checked' : ''} 
                       onchange="togglePlayerPresence(${player.id}, ${player.status === 'legioner'})">
            </td>
            <td>${player.name} ${player.status === 'legioner' ? '<span class="legioner-badge">Легионер</span>' : ''}</td>
            <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
            <td>${playerType}</td>
            <td>
                ${player.status === 'legioner' ? 
                    `<button onclick="removeLegioner(${player.id})" class="danger" style="padding: 8px 12px; font-size: 14px;">Удалить</button>` : 
                    ''
                }
            </td>
        `;
        playersTableBody.appendChild(row);
    });
}

// ПЕРЕКЛЮЧЕНИЕ СОСТОЯНИЯ "ПРИШЕЛ"
function togglePlayerPresence(id, isLegioner) {
    if (isLegioner) {
        const player = legioners.find(p => p.id === id);
        if (player) {
            player.present = !player.present;
        }
    } else {
        const player = allPlayers.find(p => p.id === id);
        if (player) {
            player.present = !player.present;
            saveToStorage();
        }
    }
    
    updatePlayersList();
    updateCounters();
    updateSplitButtonState();
}

// ОТМЕТКА ВСЕХ ИГРОКОВ
function markAllPlayers(markAsPresent) {
    allPlayers.forEach(player => {
        player.present = markAsPresent;
    });
    
    legioners.forEach(player => {
        player.present = markAsPresent;
    });
    
    saveToStorage();
    updatePlayersList();
    updateCounters();
    updateSplitButtonState();
}

// ПЕРЕКЛЮЧЕНИЕ ФИЛЬТРА
function toggleFilter(onlyPresent) {
    showOnlyPresent = onlyPresent;
    updatePlayersList();
}

// ОБНОВЛЕНИЕ СЧЕТЧИКОВ
function updateCounters() {
    const allPlayersCombined = [...allPlayers, ...legioners];
    const presentPlayers = getAllPresentPlayers();
    const presentCount = presentPlayers.length;
    const legionersCountValue = legioners.length;
    
    totalPlayersCount.textContent = allPlayersCombined.length;
    presentPlayersCount.textContent = presentCount;
    legionersCount.textContent = legionersCountValue;
    
    const possibleTeams = Math.floor(presentCount / 5);
    possibleTeamsCount.textContent = possibleTeams;
}

// ОБНОВЛЕНИЕ СОСТОЯНИЯ КНОПКИ "РАЗДЕЛИТЬ НА КОМАНДЫ"
function updateSplitButtonState() {
    const presentPlayers = getAllPresentPlayers();
    const presentCount = presentPlayers.length;
    const splitBtn = document.getElementById('splitTeamsBtn');
    const requiredCount = teamSettings.count * 5;
    
    if (teamSettings.count > 0 && presentCount >= requiredCount) {
        splitBtn.disabled = false;
        splitBtn.style.opacity = '1';
        playersRequiredInfo.innerHTML = `<span style="color: #2ecc71; font-weight: 600;">✓ Достаточно игроков для разделения</span>`;
    } else {
        splitBtn.disabled = true;
        splitBtn.style.opacity = '0.6';
        const needed = requiredCount - presentCount;
        if (needed > 0) {
            playersRequiredInfo.innerHTML = `Для разделения на команды нужно еще <span style="color: #e74c3c; font-weight: 600;">${needed}</span> игроков`;
        } else {
            playersRequiredInfo.innerHTML = `Для разделения на команды нужно <span id="requiredPlayersCount">${requiredCount}</span> игроков`;
        }
    }
}

// ПЕРЕКЛЮЧЕНИЕ ВЫБОРА ЦВЕТА
function toggleColorSelection(color) {
    const index = teamSettings.colors.indexOf(color);
    
    if (index !== -1) {
        teamSettings.colors.splice(index, 1);
    } else {
        if (teamSettings.colors.length < teamSettings.count) {
            teamSettings.colors.push(color);
        } else {
            showWarning(`Можно выбрать только ${teamSettings.count} цвета`);
            return;
        }
    }
    
    updateColorSelection();
}

// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВЫБРАННЫХ ЦВЕТОВ
function updateColorSelection() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    teamSettings.colors.forEach(color => {
        const option = document.querySelector(`.color-option[data-color="${color}"]`);
        if (option) {
            option.classList.add('selected');
        }
    });
    
    selectedColorsInfo.innerHTML = `Выбрано <strong>${teamSettings.colors.length}</strong> из <strong>${teamSettings.count}</strong> цветов`;
}

// ==================== АЛГОРИТМ БАЛАНСИРОВКИ КОМАНД ====================

// УЛУЧШЕННЫЙ АЛГОРИТМ БАЛАНСИРОВКИ
function advancedTeamBalancing(initialTeams, players, targetPrecision = 0.01) {
    const startTime = Date.now();
    const playersPerTeam = 5;
    const numTeams = initialTeams.length;
    
    let teams = JSON.parse(JSON.stringify(initialTeams));
    
    teams.forEach(team => {
        team.totalRating = team.players.reduce((sum, player) => sum + player.rating, 0);
        team.averageRating = team.totalRating / playersPerTeam;
    });
    
    let bestTeams = JSON.parse(JSON.stringify(teams));
    let bestDifference = calculateRatingDifference(bestTeams);
    
    if (bestDifference <= targetPrecision) {
        return {
            teams: bestTeams,
            difference: bestDifference,
            optimized: true,
            iterations: 0,
            timeSpent: Date.now() - startTime
        };
    }
    
    const maxIterations = 100000;
    const maxNoImprovementIterations = 20000;
    let noImprovementCount = 0;
    let iteration = 0;
    
    for (iteration = 0; iteration < maxIterations; iteration++) {
        if (stopOptimization) break;
        
        const teamsWithSums = teams.map((team, index) => ({
            team: team,
            totalRating: team.totalRating,
            index: index
        }));
        
        const maxTeamData = teamsWithSums.reduce((max, curr) => 
            curr.totalRating > max.totalRating ? curr : max
        );
        const minTeamData = teamsWithSums.reduce((min, curr) => 
            curr.totalRating < min.totalRating ? curr : min
        );
        
        const maxTeam = maxTeamData.team;
        const minTeam = minTeamData.team;
        const maxRating = maxTeamData.totalRating;
        const minRating = minTeamData.totalRating;
        
        let currentDifference = (maxRating - minRating) / playersPerTeam;
        
        if (currentDifference <= targetPrecision) {
            bestTeams = JSON.parse(JSON.stringify(teams));
            bestDifference = currentDifference;
            break;
        }
        
        let allowedDifference = currentDifference * playersPerTeam;
        allowedDifference += allowedDifference / 2;
        
        let bestSwap = null;
        let bestSwapDifference = Infinity;
        
        for (const maxPlayer of maxTeam.players) {
            for (const minPlayer of minTeam.players) {
                const playerDifference = maxPlayer.rating - minPlayer.rating;
                
                if (playerDifference <= allowedDifference && 
                    playerDifference > 0 && 
                    playerDifference < bestSwapDifference) {
                    
                    bestSwapDifference = playerDifference;
                    bestSwap = {
                        maxPlayer: maxPlayer,
                        minPlayer: minPlayer,
                        maxTeamIndex: maxTeamData.index,
                        minTeamIndex: minTeamData.index
                    };
                }
            }
        }
        
        if (bestSwap) {
            const maxTeamIndex = bestSwap.maxTeamIndex;
            const minTeamIndex = bestSwap.minTeamIndex;
            
            teams[maxTeamIndex].players = teams[maxTeamIndex].players.filter(p => p !== bestSwap.maxPlayer);
            teams[minTeamIndex].players = teams[minTeamIndex].players.filter(p => p !== bestSwap.minPlayer);
            
            teams[maxTeamIndex].players.push(bestSwap.minPlayer);
            teams[minTeamIndex].players.push(bestSwap.maxPlayer);
            
            teams[maxTeamIndex].totalRating = teams[maxTeamIndex].players.reduce((sum, player) => sum + player.rating, 0);
            teams[minTeamIndex].totalRating = teams[minTeamIndex].players.reduce((sum, player) => sum + player.rating, 0);
            
            teams[maxTeamIndex].averageRating = teams[maxTeamIndex].totalRating / playersPerTeam;
            teams[minTeamIndex].averageRating = teams[minTeamIndex].totalRating / playersPerTeam;
            
            const newDifference = calculateRatingDifference(teams);
            
            if (newDifference < bestDifference) {
                bestTeams = JSON.parse(JSON.stringify(teams));
                bestDifference = newDifference;
                noImprovementCount = 0;
                
                if (bestDifference <= targetPrecision) {
                    break;
                }
            } else {
                noImprovementCount++;
                
                if (noImprovementCount > 500) {
                    const team1Index = Math.floor(Math.random() * numTeams);
                    let team2Index = Math.floor(Math.random() * numTeams);
                    while (team2Index === team1Index) {
                        team2Index = Math.floor(Math.random() * numTeams);
                    }
                    
                    const team1 = teams[team1Index];
                    const team2 = teams[team2Index];
                    
                    if (team1.players.length > 0 && team2.players.length > 0) {
                        const player1Index = Math.floor(Math.random() * team1.players.length);
                        const player2Index = Math.floor(Math.random() * team2.players.length);
                        
                        const player1 = team1.players[player1Index];
                        const player2 = team2.players[player2Index];
                        
                        team1.players[player1Index] = player2;
                        team2.players[player2Index] = player1;
                        
                        team1.totalRating = team1.players.reduce((sum, player) => sum + player.rating, 0);
                        team2.totalRating = team2.players.reduce((sum, player) => sum + player.rating, 0);
                        
                        team1.averageRating = team1.totalRating / playersPerTeam;
                        team2.averageRating = team2.totalRating / playersPerTeam;
                        
                        noImprovementCount = 0;
                    }
                }
                
                if (noImprovementCount > maxNoImprovementIterations) {
                    break;
                }
            }
        } else {
            noImprovementCount++;
            
            if (noImprovementCount > maxNoImprovementIterations) {
                break;
            }
        }
        
        if (iteration % 1000 === 0) {
            const progress = Math.min(100, Math.floor((iteration / maxIterations) * 100));
            updateProgress(progress, bestDifference);
            awaitSleep(0);
        }
    }
    
    const timeSpent = Date.now() - startTime;
    
    return {
        teams: bestTeams,
        difference: bestDifference,
        optimized: bestDifference <= targetPrecision,
        iterations: iteration,
        timeSpent: timeSpent
    };
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АЛГОРИТМА
function calculateRatingDifference(teams) {
    const ratings = teams.map(team => team.averageRating);
    const maxRating = Math.max(...ratings);
    const minRating = Math.min(...ratings);
    return maxRating - minRating;
}

function awaitSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateProgress(progress, currentDifference) {
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Оптимизация: ${progress}% (разница: ${currentDifference.toFixed(3)})`;
}

// РАЗДЕЛЕНИЕ НА КОМАНДЫ
async function splitIntoTeams() {
    stopOptimization = false;
    
    splitButtonText.textContent = 'Балансировка команд...';
    splitButtonLoading.classList.remove('hidden');
    progressContainer.classList.remove('hidden');
    document.getElementById('splitTeamsBtn').disabled = true;
    
    try {
        const presentPlayers = getAllPresentPlayers();
        
        if (presentPlayers.length < teamSettings.count * 5) {
            showWarning(`Недостаточно игроков для ${teamSettings.count} команд. Нужно минимум ${teamSettings.count * 5} игроков, а пришло ${presentPlayers.length}.`);
            resetSplitButton();
            return;
        }
        
        const sortedPlayers = [...presentPlayers].sort((a, b) => b.rating - a.rating);
        
        const initialTeams = [];
        for (let i = 0; i < teamSettings.count; i++) {
            const colorName = getColorName(teamSettings.colors[i]);
            initialTeams.push({
                players: [],
                totalRating: 0,
                averageRating: 0,
                color: teamSettings.colors[i],
                colorName: colorName
            });
        }
        
        for (let i = 0; i < teamSettings.count * 5; i++) {
            const teamIndex = i % teamSettings.count;
            const actualTeamIndex = Math.floor(i / teamSettings.count) % 2 === 0 
                ? teamIndex 
                : teamSettings.count - 1 - teamIndex;
            
            initialTeams[actualTeamIndex].players.push(sortedPlayers[i]);
            initialTeams[actualTeamIndex].totalRating += sortedPlayers[i].rating;
        }
        
        initialTeams.forEach(team => {
            team.averageRating = team.totalRating / 5;
        });
        
        const optimizationResult = advancedTeamBalancing(initialTeams, sortedPlayers, 0.01);
        
        optimizationResult.teams.sort((a, b) => b.averageRating - a.averageRating);
        
        currentStep = 4;
        updateStepIndicator();
        
        displayBalanceResult(optimizationResult);
        displayTeams(optimizationResult.teams);
        displayStats(optimizationResult.teams);
        
        teamsSection.classList.remove('hidden');
        legionerSection.classList.add('hidden');
        
        setTimeout(() => {
            teamsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
    } catch (error) {
        console.error('Ошибка при разделении команд:', error);
        showWarning('Произошла ошибка при распределении игроков. Попробуйте еще раз.');
    } finally {
        resetSplitButton();
    }
}

// СБРОС КНОПКИ РАЗДЕЛЕНИЯ
function resetSplitButton() {
    splitButtonText.textContent = 'Разделить на команды';
    splitButtonLoading.classList.add('hidden');
    progressContainer.classList.add('hidden');
    document.getElementById('splitTeamsBtn').disabled = false;
}

// ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА БАЛАНСИРОВКИ
function displayBalanceResult(optimizationResult) {
    let resultHTML = '';
    
    if (optimizationResult.optimized) {
        resultHTML = `
            <strong>✓ Идеальная балансировка!</strong> Разница в среднем рейтинге: 
            <strong>${optimizationResult.difference.toFixed(3)}</strong> (цель: ≤ 0.010)
        `;
        balanceResult.className = 'success';
    } else {
        resultHTML = `
            <strong>✓ Хорошая балансировка</strong> Разница в среднем рейтинге: 
            <strong>${optimizationResult.difference.toFixed(3)}</strong> (цель: ≤ 0.010)<br>
            <small>Алгоритм не смог достичь идеальной балансировки, но нашел лучший возможный вариант.</small>
        `;
        balanceResult.className = 'info';
    }
    
    resultHTML += `<br><small>Итераций: ${optimizationResult.iterations}, Время: ${optimizationResult.timeSpent} мс</small>`;
    
    balanceResult.innerHTML = resultHTML;
}

// ПОЛУЧЕНИЕ НАЗВАНИЯ ЦВЕТА
function getColorName(colorCode) {
    if (window.playersData && window.playersData.getColorName) {
        return window.playersData.getColorName(colorCode);
    }
    
    const colorNames = {
        'blue': 'Синие',
        'green': 'Зеленые',
        'orange': 'Оранжевые',
        'red': 'Красные',
        'white': 'Белые'
    };
    return colorNames[colorCode] || colorCode;
}

// ОТОБРАЖЕНИЕ КОМАНД
function displayTeams(teams) {
    teamsContainer.innerHTML = '';
    
    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = `team team-${index + 1}`;
        
        let indicatorColor;
        if (window.playersData && window.playersData.getColorValue) {
            indicatorColor = window.playersData.getColorValue(team.color);
        } else {
            switch(team.color) {
                case 'blue': indicatorColor = '#3498db'; break;
                case 'green': indicatorColor = '#2ecc71'; break;
                case 'orange': indicatorColor = '#e67e22'; break;
                case 'red': indicatorColor = '#e74c3c'; break;
                case 'white': indicatorColor = '#ecf0f1'; break;
                default: indicatorColor = '#95a5a6';
            }
        }
        
        const sortedTeamPlayers = [...team.players].sort((a, b) => a.name.localeCompare(b.name));
        
        let playersHTML = '';
        sortedTeamPlayers.forEach(player => {
            // Определяем статус для отображения
            let statusText = "";
            if (player.status === "regular") {
                statusText = " (Абонемент)";
            } else if (player.status === "guest") {
                statusText = " (Гость)";
            } else if (player.status === "legioner") {
                statusText = " (Легионер)";
            }
            
            playersHTML += `
                <div class="player-item">
                    <div class="player-name">
                        ${player.name}${statusText}
                        ${player.status === 'legioner' ? '<span class="legioner-badge">Легионер</span>' : ''}
                    </div>
                </div>
            `;
        });
        
        teamDiv.innerHTML = `
            <div class="team-header">
                <h3>${team.colorName}</h3>
                <div class="team-color-indicator" style="background-color: ${indicatorColor};"></div>
            </div>
            <div class="team-rating">Средний рейтинг: ${team.averageRating.toFixed(3)}</div>
            ${playersHTML}
        `;
        
        teamsContainer.appendChild(teamDiv);
    });
}

// ОТОБРАЖЕНИЕ СТАТИСТИКИ
function displayStats(teams) {
    statsGrid.innerHTML = '';
    
    teams.forEach((team, index) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <div class="stat-value">${team.averageRating.toFixed(3)}</div>
            <div class="stat-label">${team.colorName}</div>
        `;
        statsGrid.appendChild(statItem);
    });
}

// ОБНОВЛЕНИЕ ИНДИКАТОРА ШАГОВ
function updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else if (index + 1 < currentStep) {
            step.classList.add('completed');
        }
    });
}

// ПЕРЕЗАПУСК ПРИЛОЖЕНИЯ
function restartApp() {
    stopOptimization = true;
    
    teamSettings.count = 0;
    teamSettings.colors = [];
    allPlayers.forEach(player => player.present = false);
    legioners = [];
    
    document.getElementById('twoTeamsBtn').classList.remove('selected');
    document.getElementById('threeTeamsBtn').classList.remove('selected');
    teamColorsSection.classList.add('hidden');
    playerListSection.classList.add('hidden');
    legionerSection.classList.add('hidden');
    teamsSection.classList.add('hidden');
    progressContainer.classList.add('hidden');
    
    currentStep = 1;
    updateStepIndicator();
    
    saveToStorage();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showInfo('Приложение сброшено. Начните заново.');
}

// ==================== РАБОТА С LOCALSTORAGE ====================

// СОХРАНЕНИЕ ДАННЫХ
function saveToStorage() {
    const data = {
        allPlayers: allPlayers,
        teamSettings: teamSettings,
        legioners: legioners,
        currentStep: currentStep
    };
    localStorage.setItem('futsalAppData', JSON.stringify(data));
}

// ЗАГРУЗКА ДАННЫХ
function loadFromStorage() {
    const savedData = localStorage.getItem('futsalAppData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            allPlayers = data.allPlayers || allPlayers;
            teamSettings = data.teamSettings || teamSettings;
            legioners = data.legioners || legioners;
            currentStep = data.currentStep || 1;
            
            // Конвертация старых данных (если нет поля status)
            allPlayers.forEach(player => {
                if (!player.status) {
                    player.status = "regular"; // По умолчанию абонемент для старых игроков
                }
            });
            
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

// ПОКАЗ ПРЕДУПРЕЖДЕНИЙ
function showWarning(message, isError = true) {
    warningContainer.innerHTML = `
        <div class="${isError ? 'warning' : 'info'}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        warningContainer.innerHTML = '';
    }, 5000);
}

// ПОКАЗ ИНФОРМАЦИОННЫХ СООБЩЕНИЙ
function showInfo(message) {
    showWarning(message, false);
}

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================

// Запускаем приложение когда DOM загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Экспортируем функции для доступа из HTML
window.togglePlayerPresence = togglePlayerPresence;
window.removeLegioner = removeLegioner;

console.log("✅ logic.js загружен и готов к работе");
