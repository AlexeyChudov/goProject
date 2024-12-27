import {Budget, Income, Expense, getStringDate, compareDates, fillTable, parseDate} from './main.js';


const budget = new Budget();
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Страница доходов загружена");
    fetchIncomes().then((incomes)=>{
        console.log("Данные от /incomes:", incomes);
        incomes.forEach(income => {
            budget.addIncome(income.Income, income.Type, income.Value, parseDate(income.Date),income.Id)
        }
        )
        console.log("budget.incomes после считывания данных: ",budget.incomes)
        fillTable(budget.incomes, 'incomes-table');
    });

    setupDeleteIncomeHandler(); // Настройка удаления записей
    // addIncome();    // Настройка добавления доходов
    // fetchIncomes();             // Загрузка начальных данных
    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            if (isNaN(startDate) || isNaN(endDate)) {
                console.error("Некорректные даты");
                return;
            }
            const {incomes} = budget.filterTransactions(startDate, endDate);
            fillTable(incomes, "incomes-table")
    })
});

async function fetchIncomes() {
    console.log("Вызов fetchIncomes()");

    return fetch('http://localhost:8000/incomes')
        .then(response => {
            console.log("Ответ от /incomes:", response);
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .catch(error => console.error('Ошибка:', error));
    
}
function setupDeleteIncomeHandler() {
    const incomesTable = document.getElementById('incomes-table');
    if (!incomesTable) {
        console.error('Таблица #incomes-table не найдена!');
        return;
    }

    incomesTable.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button && button.classList.contains('delete-income-button')) {
            const row = button.closest('tr');
            if (row) {
                const id = row.getAttribute('data-id');
                if (id) {
                    console.log("Считанный id: ", id);
                    deleteIncome(id);
                } else {
                    console.error('ID записи не найден в data-id строки');
                }
            }
        }
    });
}

function deleteIncome(id) {
    if (!id) {
        console.error("ID не указан!");
        return;
    }

    fetch(`http://localhost:8000/incomes/delete?id=${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // Удалить строку из таблицы
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) row.remove();
        } else {
            console.error('Ошибка при удалении записи:', response.statusText);
        }
    })
    .catch(error => console.error('Ошибка:', error));
}



function addIncome() {
    console.log("Функция addIncome() вызвана");

    const form = document.getElementById('add-income-form');
    if (!form) {
        console.error("Форма #add-income-form не найдена!");
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        console.log("Обработчик submit вызван");
        
        const income = {
            Income: document.getElementById('add-income').value,
            Type: document.getElementById('add-type').value,
            Value: parseFloat(document.getElementById('add-value').value),
            Date: document.getElementById('add-date').value
        };

        console.log("Отправляемый доход:", income);

        fetch('http://localhost:8000/incomes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(income)
        })
            .then(response => {
                if (response.ok) {
                    console.log("Доход успешно добавлен.");
                    return response.text(); // Ожидаем простой текст
                } else {
                    throw new Error('Ошибка при добавлении записи');
                }
            })
            .then(result => {
                console.log("Результат:", result);
            })
            .catch(error => console.error('Ошибка:', error));
    });
}



setInterval(fetchIncomes, 5000);