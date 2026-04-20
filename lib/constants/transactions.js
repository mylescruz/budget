// Types of potential transactions
export const TRANSACTION_TYPES = {
  EXPENSE: "Expense",
  TRANSFER: "Transfer",
  INCOME: "Income",
};

export const TRANSACTION_TYPES_LIST = Object.values(TRANSACTION_TYPES);

// Different accounts a user can transfer between
export const TRANSFER_ACCOUNTS = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  LOAN: "Loan",
};

export const TRANSFER_ACCOUNTS_LIST = Object.values(TRANSFER_ACCOUNTS);
