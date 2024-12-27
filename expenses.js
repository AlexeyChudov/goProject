import {Course, Currency, Income, Expense, Budget, fillTable, getStringDate, compareDates, parseDate} from './main.js';

const budget = new Budget();

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Страница расходов загружена");
    fetchExpenses().then((expenses)=>{
        console.log("Данные от /expenses:", expenses);
        expenses.forEach(expense => {
            budget.addExpense(expense.Expense, expense.Type, expense.Value, parseDate(expense.Date), expense.Id)
        }
        )
        console.log("budget.expenses после считывания данных: ",budget.expenses)
        fillTable(budget.expenses, 'expenses-table');
    });

    setupDeleteExpenseHandler(); // Настройка удаления записей
    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);
            if (isNaN(startDate) || isNaN(endDate)) {
                console.error("Некорректные даты");
                return;
            }
            const {expenses} = budget.filterTransactions(startDate, endDate);
            fillTable(expenses, "expenses-table")
    })
});


function fetchExpenses() {
    return fetch('http://localhost:8000/expenses')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .catch(error => console.error('Ошибка:', error));
}
function setupDeleteExpenseHandler() {
    const expensesTable = document.getElementById('expenses-table');
    if (!expensesTable) {
        console.error('Таблица #expenses-table не найдена!');
        return;
    }

    expensesTable.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button && button.classList.contains('delete-expense-button')) {
            const row = button.closest('tr');
            if (row) {
                const id = row.getAttribute('data-id');
                if (id) {
                    deleteExpense(id);
                } else {
                    console.error('ID записи не найден в data-id строки');
                }
            }
        }
    });
}
function deleteExpense(id) {
    if (!id) {
        console.error("ID не указан!");
        return;
    }

    fetch(`http://localhost:8000/expenses/delete?id=${id}`, {
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

function addExpense() {
    console.log("Функция addexpense() вызвана");

    const form = document.getElementById('add-expense-form');
    if (!form) {
        console.error("Форма #add-expense-form не найдена!");
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        console.log("Обработчик submit вызван");
        
        const expense = {
            expense: document.getElementById('add-expense').value,
            Type: document.getElementById('add-type').value,
            Value: parseFloat(document.getElementById('add-value').value),
            Date: document.getElementById('add-date').value
        };

        console.log("Отправляемый доход:", expense);

        fetch('http://localhost:8000/expenses/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
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
                fetchExpenses(); // Обновляем таблицу после добавления
            })
            .catch(error => console.error('Ошибка:', error));
    });
}


// window.onload = function () {
//     console.log("Скрипт загружен");
//     setupDeleteExpenseHandler();
//     addExpense(); // Привязываем обработчик формы
//     fetchExpenses(); // Загружаем данные в таблицу
// };
// setInterval(fetchExpenses, 5000);