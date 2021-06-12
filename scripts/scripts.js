const Modal = {
  // Modal
  open() {
    document.querySelector('.modal-overlay').classList.add('active');
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active');
  },
};

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem('invest:transactions')) || []
  },
  set(transactions){
    localStorage.setItem("invest:transactions", JSON.stringify(transactions))
  },
}

/*
[
    // transaction
    // objetos registrados vindo do html
    {
      description: 'Lucas',
      amount: -50000,
      date: '23/01/2021',
    },
    {
      description: 'Anselmo',
      amount: -30000,
      date: '24/01/2021',
    },
    {
      description: 'Silva',
      amount: 200000,
      date: '25/01/2021',
    },
  ],
*/

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  //Transactions
  // Receber o investimento inicial
  // receber e somar o investimento recebidos
  // somar o investimento inicial + (investimentos recebidos * 12)
  // dai terei o total

  incomes() {
    let income = 0;

    // pegar a transação inicial
    // para cada transação
    Transaction.all.forEach((transaction) => {
      // se for maior que zero
      if (transaction.amount > 0) {
        // registrar
        income = transaction.amount;
      }
    });
    return income;
  },
  investment() {
    let investment = 0;

    // pegar os investimentos
    // de cada campo
    Transaction.all.forEach((transaction) => {
      // tem que ser forçado a menor que zero
      if (transaction.amount < 0) {
        // somar a uma variavel e retorna
        investment += transaction.amount * -1;
      }
    });
    return investment;
  },
  total() {
    let investment_Months_twelve = Transaction.investment() * 12;
    return Transaction.incomes() + investment_Months_twelve;
  },
};

const DOM = {
  // Substituir os dados do HTML com os dados do js

  transactionsContainer: document.querySelector('#data_table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
    `;

    return html;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById('investmentDisplay').innerHTML =
      Utils.formatCurrency(Transaction.investment());
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = '';
  },
};

const Utils = {
  formatAmount(value){
    value = Number(value) * 100
    return value
  },

  formatDate(date){
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '*' : '';

    value = String(value).replace(/\D/g, '');

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + value;
  },

};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateField() {
    const { description, amount, date } = Form.getValues();

    if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
      throw new Error("Por Favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return{
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction){
    Transaction.add(transaction)
  },

  clearFields(){
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault();

    try {
      // verificar se todas as informações foram preenchidas
      Form.validateField();

      // formatar os dados para salvar
      const transaction = Form.formatValues()

      // salvar
      Form.saveTransaction(transaction)

      // apagar os dados do formualrio
      Form.clearFields()

      // modal feche
      Modal.close()

      // atualizar a aplicação
      //App.reload() -> não será necessario aqui pq já tem reload no add()

    } catch (error) {
      alert("Por Favor, preencha todos os campos")
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      // Listando a quantidades dos tr
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();