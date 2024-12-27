
class Currency {
    #type;
    // #repr;
    #courses;

    constructor(type, repr) {
        this.#type = type; // Вызов сеттера
        // this.#repr = repr; // Вызов сеттера
        this.#courses = new Map();
    }

    // get type() {
    //     return this.#type;
    // }

    // set type(newType) {
    //     console.log(newType);
    //     // if (typeof newType !== 'string' || !newType.trim()) {
    //     //     throw new Error('Invalid currency type: must be a non-empty string.');
    //     // }
    //     this.#type = newType;
    // }

    // get repr() {
    //     return this.#repr;
    // }

    // set repr(newRepr) {
    //     // if (typeof newRepr !== 'string' || !newRepr.trim()) {
    //     //     throw new Error('Invalid currency repr: must be a non-empty string.');
    //     // }
    //     this.#repr = newRepr;
    // }
    getCourse(date) {
        return this.#courses.get(date);
    }

    addCourse(date, buy, sell) {
        if (!(date instanceof Date)) {
            throw new Error('Invalid date');
        }
        if (typeof buy !== 'number' || typeof sell !== 'number') {
            throw new Error('Buy and sell rates must be numbers');
        }
        this.#courses.set(date, { buy, sell });
    }

    deleteCourse(date) {
        this.#courses.delete(date);
    }
}

class Course {
    #buy;
    #sell;
    #date;

    constructor(buy, sell, date = new Date()) {
        this.buy = buy;
        this.sell = sell;
        this.date = date;
    }

    get buy() {
        return this.#buy;
    }

    set buy(value) {
        if (typeof value !== 'number' || value < 0) {
            throw new Error('Buy rate must be a positive number');
        }
        this.#buy = value;
    }

    get sell() {
        return this.#sell;
    }

    set sell(value) {
        if (typeof value !== 'number' || value < 0) {
            throw new Error('Sell rate must be a positive number');
        }
        this.#sell = value;
    }

    get date() {
        return this.#date;
    }

    set date(value) {
        if (!(value instanceof Date)) {
            throw new Error('Invalid date');
        }
        this.#date = value;
    }
}

class Expense {
    #type;//тип
    #name;//Наименование
    #value;//Значение расхода
    #date;//Дата
    // #currency;
    id;
    constructor(name, type, value, date, id) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.date = new Date(date);
        this.id = id;
        // this.currency = currency;
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('Expense type must be a non-empty string');
        }
        this.#type = value;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('Expense type must be a non-empty string');
        }
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    set value(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Expense value must be a positive number');
        }
        this.#value = amount;
    }

    get date() {
        return this.#date;
    }

    set date(value) {
        if (!(value instanceof Date)) {
            throw new Error('Invalid date');
        }
        this.#date = value;
    }


}


class Income {
    #type;
    #value;
    #name;
    #date;
    id;
    // #currency;

    constructor(name, type, value, date, id) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.date = new Date(date);
        this.id = id;
        // this.currency = currency;
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('Income type must be a non-empty string');
        }
        this.#type = value;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error('Income type must be a non-empty string');
        }
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    set value(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Income value must be a positive number');
        }
        this.#value = amount;
    }

    get date() {
        return this.#date;
    }

    set date(value) {
        if (!(value instanceof Date)) {
            throw new Error('Invalid date');
        }
        this.#date = value;
    }
}


class Budget {
    #currencies;
    #expenseTypes;
    #incomeTypes;
    #incomes;
    #expenses;
    #incomeIds;
    #expenseIds;

    constructor() {
        this.#currencies = [];
        this.#expenseTypes = [];
        this.#incomeTypes = [];
        this.#incomes = [];
        this.#expenses = [];
        this.#incomeIds = new Set();
        this.#expenseIds = new Set()
    }
    get expenses() {
        return this.#expenses;
    }
    get incomes() {
        return this.#incomes;
    }
    hasIncomeId(id) {
        return this.#incomeIds.has(id);
    }

    hasExpenseId(id) {
        return this.#expenseIds.has(id);
    }

    addCurrency(currency) {
        if (!(currency instanceof Currency)) {
            throw new Error('Invalid currency');
        }
        this.#currencies.push(currency);
    }

    removeCurrency(type) {
        this.#currencies = this.#currencies.filter(c => c.type !== type);
    }

    addExpenseType(type) {
        if (typeof type !== 'string' || !type.trim()) {
            throw new Error('Invalid expense type');
        }
        this.#expenseTypes.push(type);
    }

    addIncomeType(type) {
        if (typeof type !== 'string' || !type.trim()) {
            throw new Error('Invalid income type');
        }
        this.#incomeTypes.push(type);
    }
    addIncome(name, type, value, date, id) {
        if (this.hasIncomeId(id)) {
            return; // Уже добавлено
        }
        this.#incomeIds.add(id);
        this.#incomes.push(new Income(name, type, value, date, id));
    }

    addExpense(name, type, value, date, id) {
        if (this.hasExpenseId(id)) {
            return; // Уже добавлено
        }
        this.#expenseIds.add(id);
        this.#expenses.push(new Expense(name, type, value, date, id));
    }
   
    removeExpense(index) {
        if (index >= 0 && index < this.#expenses.length) {
            this.#expenses.splice(index, 1);
        }
    }

   

    removeIncome(index) {
        if (index >= 0 && index < this.#incomes.length) {
            this.#incomes.splice(index, 1);
        }
    }
    totalExpenses() {
        let sum = 0;
        this.expenses.forEach(el => {
            sum += el.value;
        });
        return sum;
    }
    totalIncomes() {
        let sum = 0;
        this.incomes.forEach(el => {
            sum += el.value;
        });
        return sum;
    }

    calculateBalance(startDate, endDate, incomeType = null, ExpenseType = null) {
        const incomes = this.#incomes
            .filter(d => [1, 0].includes(compareDates(d.date, startDate)) && [-1, 0].includes(compareDates(d.date, endDate)) &&
                (!incomeType || d.type == incomeType))
            .reduce((sum, d) => sum + d.value, 0);

        const expenses = this.#expenses
            .filter(d => [1, 0].includes(compareDates(d.date, startDate)) && [-1, 0].includes(compareDates(d.date, endDate)) &&
                (!ExpenseType || d.type === expenseType))
            .reduce((sum, d) => sum + d.value, 0);
        console.log("calculating: ", incomes, expenses);
        return incomes - expenses;
    }
    filterTransactions(startDate, endDate, incomeType = null, expenseType = null) {
        const incomes = this.#incomes.filter(d => [1, 0].includes(compareDates(d.date, startDate))
            && [-1, 0].includes(compareDates(d.date, endDate)) && (!incomeType || d.type === incomeType));
        const expenses = this.#expenses.filter(d => [1, 0].includes(compareDates(d.date, startDate)) &&
            [-1, 0].includes(compareDates(d.date, endDate)) && (!expenseType || d.type === expenseType));
        return { incomes, expenses };
    }
}

function compareDates(date1, date2) {
    // Проверка, что оба аргумента - объекты типа Date
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        throw new Error("Оба аргумента должны быть объектами Date");
    }

    // Сравнение года, месяца и дня
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const day1 = date1.getDate();

    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();

    if (year1 !== year2) {
        return year1 > year2 ? 1 : -1;
    }

    if (month1 !== month2) {
        return month1 > month2 ? 1 : -1;
    }

    if (day1 !== day2) {
        return day1 > day2 ? 1 : -1;
    }

    // Даты равны по году, месяцу и дню
    return 0;
}


let budget = new Budget();
let dollar = new Currency('dollar');
budget.addCurrency(dollar);
budget.addExpenseType("rent");
budget.addExpenseType("subscription");
budget.addExpenseType("food");
budget.addExpenseType("other");
budget.addIncomeType("common");
budget.addIncomeType("hustle");
budget.addIncomeType("gambling");



function getStringDate(date) {
    if (!(date instanceof Date)) {
        throw new Error('Invalid date');
    }
    return String(date.getMonth() + 1) + "." + String(date.getDate());
}

function parseDate(dateString) {
    // Проверяем, соответствует ли строка формату YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateString)) {
        throw new Error("Некорректный формат даты. Ожидается формат YYYY-MM-DD.");
    }

    // Разбиваем строку на части
    const [year, month, day] = dateString.split('-').map(Number);

    // Создаем объект Date (учитываем, что месяц в JavaScript начинается с 0)
    return new Date(year, month - 1, day);
}
function fetchData() {
    fetch('http://localhost:8000')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then((result) => {
            result.incomes.forEach(income => {
                const parsedDate = parseDate(income.Date);
                if (!budget.hasIncomeId(income.Id)) {
                    budget.addIncome(income.Income, income.Type, income.Value, parsedDate, income.Id);
                }
            });

            result.expenses.forEach(expense => {
                const parsedDate = parseDate(expense.Date);
                if (!budget.hasExpenseId(expense.Id)) {
                    budget.addExpense(expense.Expense, expense.Type, expense.Value, parsedDate, expense.Id);
                }
            });
            console.log(budget.incomes, budget.expenses);
        })
        .catch(error => console.error('Ошибка:', error));
}
console.log(budget.incomes[1], budget.expenses.length)



async function fillTable(array, id) { 
    if (typeof id !== 'string') { 
        throw new Error('Invalid id'); 
    } 
    
    const tableBody = document.querySelector(`#${id} tbody`); 
    if (!tableBody) { 
        console.error(`Table body with id "${id}" not found`); 
        return; 
    } 
    console.log("Вызов fillTable");
    
    tableBody.innerHTML = ''; // Очистка старых данных таблицы
    
    // Заполняем таблицу
    array.forEach((item) => { 
        console.log("Строка таблицы: ",item);
        const row = document.createElement('tr');                         
        row.setAttribute('data-id', item.id); // Устанавливаем ID записи
        let type = null;
        if(id==="incomes-table"){
            type = "income";
        }    
        else if (id === "expenses-table"){
            type = "expense";
        }
            row.innerHTML = ` 
            <td>${item.name}</td> 
            <td>${item.type}</td> 
            <td>${item.value}</td>
            <td>${getStringDate(item.date)}</td>                                 
            <td><button class="delete-${type}-button">Удалить</button></td>
        `; 
        
        tableBody.appendChild(row); 
    }); 
    
    const tableFooter = document.querySelector(`#${id} tfoot`); 
    if (!tableFooter) { 
        console.error(`Table footer with id "${id}" not found`); 
        return; 
    } 
    
    tableFooter.innerHTML = ''; // Очистка футера
    
    // Добавляем итоговую строку
    const total = array.reduce((sum, item) => sum + item.value, 0);
    const resultRow = document.createElement('tr'); 
    resultRow.innerHTML = `<td colspan="2">Итого</td><td>${total} $</td>`; 
    tableFooter.appendChild(resultRow); 
}





let balanceChart = null;
let previousDataHash = ''; // Хеш для отслеживания изменений данных

async function createChart(startDate, endDate) {
    // Ждем получения новых данных
    await fetchData();

    // Проверка изменений данных
    const currentDataHash = JSON.stringify(budget.incomes) + JSON.stringify(budget.expenses);
    if (currentDataHash === previousDataHash) {
        console.log("Данные не изменились. График не будет обновлен.");
        return;
    }
    previousDataHash = currentDataHash; // Обновляем хеш

    // Если график уже существует, уничтожаем его
    if (balanceChart) {
        balanceChart.destroy();
    }

    // Генерация данных для графика на основе выбранных дат
    const labels = [];
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        labels.push(getStringDate(currentDate)); // Добавляем метку
        data.push(budget.calculateBalance(startDate, currentDate)); // Рассчитываем баланс
        currentDate.setDate(currentDate.getDate() + 1); // Переход к следующему дню
    }

    // Создаем новый график
    const ctx = document.getElementById('balanceChart').getContext('2d');
    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Баланс',
                data: data,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
                tension: 0,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        
        setInterval(() => {
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            if (!isNaN(startDate) && !isNaN(endDate)) {
                createChart(startDate, endDate);
            }
        }, 5000);
    });
});



// window.onload = function () {
//     console.log("Скрипт загружен");
//     // fetchData(); // Загружаем данные в таблицу
//     createChart()
//     setInterval(createChart, 5000);

// };

export {Course, Currency, Income, Expense, Budget, fillTable, getStringDate, compareDates, parseDate}
