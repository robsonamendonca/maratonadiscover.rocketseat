const Modal = {
    open() {
        //Abri modal
        //adicionar a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active');
    },
    close() {
        //fechar modal
        //remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active');
    },

    SweetAlert2Sucess(message) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        Toast.fire({
            icon: 'success',
            title: message
        })
    },

    SweetAlert2ConfirmRemove(index) {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#49aa26',
            cancelButtonColor: '#e92929',
            confirmButtonText: 'Sim, exclua!'
        }).then((result) => {
            if (result.isConfirmed) {

                Transaction.all.splice(index, 1);
                App.reload();

                Swal.fire({
                    title: 'Excluída!',
                    text: "Sua transação foi excluída.",
                    icon: 'success',
                    confirmButtonColor: '#49aa26',
                    confirmButtonText: 'Ok'
                })
            }
        })
    },

    SweetAlert2Error(message) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: message,
            footer: 'Verifique e tente novamente!'
        })
    }
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
            JSON.stringify(transactions))
    }
}

const transations = [
    {
        description: 'Luz',
        amount: -50001,
        date: '23/01/2021',
        signal: "-"
    },
    {
        description: 'Website',
        amount: 500000,
        date: '23/01/2021',
        signal: "+"
    },
    {
        description: 'Internet',
        amount: -20012,
        date: '23/01/2021',
        signal: "-"
    },
    {
        description: 'App',
        amount: 200000,
        date: '23/01/2021',
        signal: "+"
    }
]

// - precisa somar as entradas
// - somar as saidas
// - remover das entradas o valor das saidas
// - guardar o total

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    }
    ,
    remove(index) {
        Modal.SweetAlert2ConfirmRemove(index);
    }
    ,

    incomes() {

        let incomes = 0;
        Transaction.all.forEach((transation) => {
            if (transation.amount > 0) {
                incomes += transation.amount;
            }
        })

        return (incomes);

    },
    expenses() {

        let expenses = 0;
        Transaction.all.forEach((transation) => {
            if (transation.amount < 0) {
                expenses += transation.amount;
            }
        })
        return (expenses);
    },
    total() {
        let total = Transaction.incomes() + Transaction.expenses();
        return (total);
    }

}

// - Pegar as minhas transacoes do meu obj no js
// - coloca no html do front-end
// subistituir os dasdos do HTML com os dados do JS

const DOM = {

    transationContainer: document.querySelector('#data-table tbody'),

    addTransaction(transation, index) {

        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transation, index);
        tr.dataset.index = index;

        DOM.transationContainer.appendChild(tr);
    },

    innerHTMLTransaction(transation, index) {

        const CSSclass = transation.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transation.amount);

        const html = `
            <td class="description date">
            ${transation.date} - ${transation.description}
            </td>
            <td class="${CSSclass}">${amount}</td>
            <td class="del"><span><img class="remove" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação"></span>&nbsp;</td>
            
        `;
        return html;
    },

    updateBalance() {

        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total());

        if (Transaction.total() < 0) {
            document
                .querySelector('.total')
                .classList.add('less');
        } else {
            document
                .querySelector('.total')
                .classList.remove('less');
        }
    },

    clearTransactions() {
        DOM.transationContainer.innerHTML = "";
    }
}

const Utils = {

    formatAmount(value, signal) {
        if (signal === "-") {
            value = value * 100 * -1;
        } else {
            value = value * 100;
        }
        console.log('Utils.formatAmount: ' + value);
        return Math.round(value);
    },

    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        let signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    signal: document.querySelector('select#signal'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            signal: Form.signal.value
        }
    },

    formatValues() {
        let { description, amount, date, signal } = Form.getValues();
        amount = Utils.formatAmount(amount, signal);
        console.log('Form.formatValues: ' + signal);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const { description, amount, date, signal } = Form.getValues();
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "" || signal.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
        console.log(`tipo: ${signal}`);
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
        Form.signal.value = "";
    },

    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatValues();

            Form.saveTransaction(transaction);

            Form.clearFields();
            Modal.close();
            Modal.SweetAlert2Sucess('Transação adicionada com sucesso!')

        } catch (error) {
            console.log(error);
            Modal.SweetAlert2Error(error.message);
        }


    }
}


const App = {
    init() {
        Transaction.all.forEach(
            function (transaction, index) {
                DOM.addTransaction(transaction, index);
            }
        )

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions()
        App.init();
    }
}

App.init();

