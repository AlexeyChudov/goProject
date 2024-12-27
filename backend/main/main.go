package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type Income struct {
	Id     int     `json:"Id"`
	Income string  `json:"Income"`
	Type   string  `json:"Type"`
	Value  float64 `json:"Value"`
	Date   string  `json:"Date"`
}

type Expense struct {
	Id      int     `json:"Id"`
	Expense string  `json:"Expense"`
	Type    string  `json:"Type"`
	Value   float64 `json:"Value"`
	Date    string  `json:"Date"`
}

func parseMoney(money string) (float64, error) {
	clean := strings.ReplaceAll(strings.ReplaceAll(money, "$", ""), ",", "")
	return strconv.ParseFloat(clean, 64)
}

func main() {
	connStr := "user=postgres password=postgres host=localhost port=5432 dbname=budget_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Не удалось подключиться к базе данных:", err)
	}

	http.Handle("/incomes/add", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		addIncome(db, w, r)
	})))
	http.Handle("/expenses/add", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		addExpense(db, w, r)
	})))
	http.Handle("/incomes/delete", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		deleteRecord(db, w, r, "incomes")
	})))
	http.Handle("/expenses/delete", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		deleteRecord(db, w, r, "expenses")
	})))
	http.Handle("/incomes", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responseData(db, w, r, "incomes")
	})))
	http.Handle("/expenses", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responseData(db, w, r, "expenses")
	})))
	http.Handle("/", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responseData(db, w, r, "all")
	})))

	log.Println("Сервер запущен на :8000")
	log.Fatal(http.ListenAndServe(":8000", nil))

}

func addIncome(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("Метод запроса не поддерживается: %s", r.Method)
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	var income Income
	if err := json.NewDecoder(r.Body).Decode(&income); err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		http.Error(w, "Некорректный формат данных", http.StatusBadRequest)
		return
	}

	log.Printf("Добавление дохода: %+v", income)

	_, err := db.Exec("INSERT INTO incomes (income, type, value, date) VALUES ($1, $2, $3, $4)",
		income.Income, income.Type, income.Value, income.Date)
	if err != nil {
		log.Printf("Ошибка SQL: %v", err)
		http.Error(w, "Ошибка при добавлении записи", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Запись добавлена"))
}
func addExpense(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("Метод запроса не поддерживается: %s", r.Method)
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		http.Error(w, "Некорректный формат данных", http.StatusBadRequest)
		return
	}

	log.Printf("Добавление расхода: %+v", expense)

	_, err := db.Exec("INSERT INTO expenses (expense, type, value, date) VALUES ($1, $2, $3, $4)",
		expense.Expense, expense.Type, expense.Value, expense.Date)
	if err != nil {
		log.Printf("Ошибка SQL: %v", err)
		http.Error(w, "Ошибка при добавлении записи", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Запись добавлена"))
}
func deleteRecord(db *sql.DB, w http.ResponseWriter, r *http.Request, table string) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		log.Println("Ошибка: не указан id")
		http.Error(w, "Не указан id", http.StatusBadRequest)
		return
	}

	log.Printf("Удаление записи с ID: %s из таблицы: %s\n", id, table)

	query := fmt.Sprintf("DELETE FROM %s WHERE id = $1", table)
	result, err := db.Exec(query, id)
	if err != nil {
		log.Println("Ошибка SQL:", err)
		http.Error(w, "Ошибка при удалении записи", http.StatusInternalServerError)
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		http.Error(w, "Запись не найдена", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Запись удалена"))
}
func responseData(db *sql.DB, w http.ResponseWriter, r *http.Request, dataType string) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
		return
	}
	var response interface{}
	if dataType == "expenses" {
		response = selectExpenses(db)
	}
	if dataType == "incomes" {
		response = selectIncomes(db)
	}

	if dataType == "all" {
		dataMap := make(map[string]interface{})
		dataMap["incomes"] = selectIncomes(db)
		dataMap["expenses"] = selectExpenses(db)
		response = dataMap
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func selectIncomes(db *sql.DB) []Income {
	var incomes []Income
	data, err := db.Query("SELECT id, income, type, value, date FROM incomes;")
	if err != nil {
		log.Fatal(err)
	}
	defer data.Close()

	for data.Next() {
		var income Income
		var amount string
		var date sql.NullTime
		err := data.Scan(&income.Id, &income.Income, &income.Type, &amount, &date)
		if err != nil {
			log.Println("Ошибка при чтении строки:", err)
			continue
		}

		// Обработка MONEY
		value, err := parseMoney(amount)
		if err != nil {
			log.Println("Ошибка обработки MONEY:", err)
			continue
		}
		income.Value = value

		if date.Valid {
			income.Date = date.Time.Format("2006-01-02")
		}

		incomes = append(incomes, income)
	}
	return incomes
}

func selectExpenses(db *sql.DB) []Expense {
	var expenses []Expense
	data, err := db.Query("SELECT id, expense, type, value, date FROM expenses;")
	if err != nil {
		log.Fatal(err)
	}
	defer data.Close()

	for data.Next() {
		var expense Expense
		var amount string
		var date sql.NullTime
		err := data.Scan(&expense.Id, &expense.Expense, &expense.Type, &amount, &date)
		if err != nil {
			log.Println("Ошибка при чтении строки:", err)
			continue
		}

		// Обработка MONEY
		value, err := parseMoney(amount)
		if err != nil {
			log.Println("Ошибка обработки MONEY:", err)
			continue
		}
		expense.Value = value

		if date.Valid {
			expense.Date = date.Time.Format("2006-01-02")
		}
		// fmt.Printf("%s %s %.2f %s\n", income.Income, income.Type, income.Value, income.Date)

		expenses = append(expenses, expense)
	}
	return expenses
}

// Функция для вставки дохода
func insertIncome(db *sql.DB, income string, incomeType string, value int32, date time.Time) error {
	var query string = "INSERT INTO public.incomes" +
		" (income, type,  value, date)" +
		" VALUES ($1, $2,  $3, $4 );"
	_, err := db.Exec(query, income, incomeType, value, date)

	return err

}

func insertExpense(db *sql.DB, expense string, expenseType string, value int32, date time.Time) error {
	var query string = "INSERT INTO public.expenses" +
		" (expense, type,  value, date)" +
		" VALUES ($1, $2,  $3, $4 );"
	_, err := db.Exec(query, expense, expenseType, value, date)

	return err

}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Обработка preflight-запроса
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
