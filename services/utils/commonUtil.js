const crypto = require("crypto");

const config = require("../../config/appKeys");

const CommonUtil = (function () {
  const _isValidCliqSignature = (req) => {
    let isValidSignature = false;
    const signature = req.headers["x-cliq-signature"];
    if (typeof signature !== "undefined") {
      const verifier = crypto.createVerify("sha256");
      verifier.update(JSON.stringify(req.body));
      let publicKey = "-----BEGIN PUBLIC KEY-----\n";
      publicKey += config.CLIQ_APP_PUBLIC_KEY;
      publicKey += "\n-----END PUBLIC KEY-----";
      isValidSignature = verifier.verify(publicKey, signature, "base64");
    }
    return isValidSignature;
  };

  const _isEmptyString = (value) => {
    return (
      (typeof value == "string" && !value.trim()) ||
      typeof value == "undefined" ||
      value === null
    );
  };

  const _getBannerResponse = (text, isFailure) => {
    let response = { type: "banner", text, status: "success" };
    if (isFailure) {
      response.status = "failure";
    }
    return response;
  };

  const _getSettingsResponse = (defaultCurrency) => ({
    name: "settingsform",
    type: "form",
    title: "Expense Manager - Settings",
    button_label: "Save",
    inputs: [
      {
        type: "select",
        name: "currency",
        label: "Currency",
        hint: "Choose your currency.",
        placeholder: "INR",
        options: [
          { label: "Australian Dollar - AUD", value: "AUD" },
          { label: "Chinese Renminbi - RMB", value: "RMB" },
          { label: "Euro - EUR", value: "EUR" },
          { label: "Indian Rupee - INR", value: "INR" },
          { label: "Japanese Yen - JPY", value: "JPY" },
          { label: "United States Dollar - USD", value: "USD" },
        ],
        mandatory: true,
        value: defaultCurrency || "",
      },
    ],
    action: {
      type: "invoke.function",
      name: "expensemanagerform",
    },
  });

  const _getExpenseResponse = (expenses, frequency, data) => {
    let title;
    let rows = [];
    let totalExpense = 0;
    const amountColumn = "Amount (" + data.currency + ")";
    expenses.forEach((eachExpense) => {
      rows.push({
        Date: _formatDateWOTime(eachExpense.date),
        Category: eachExpense.category,
        Note: eachExpense.note,
        // img: "https://i.ibb.co/6YQcdpr/exp-mang.png",
        [amountColumn]: eachExpense.amount,
      });
      totalExpense += eachExpense.amount;
    });

    if (frequency === "Weekly") {
      title = "Expense for this week till " + _formatDateWOTime(data.toDate);
    } else {
      title =
        "Expenses for the month - " +
        data.month +
        " " +
        data.toDate.getFullYear();
    }

    let response = {
      text: "Total Expense: " + totalExpense + " " + data.currency,
      card: {
        title: title,
        theme: "modern-inline",
      },
      bot: {
        name: "Expense Manager",
        image: "https://i.ibb.co/6YQcdpr/exp-mang.png",
      },
      slides: [
        {
          type: "table",
          data: {
            headers: ["Date", "Category", "Note", amountColumn],
            rows: rows,
          },
        },
      ],
    };
    return response;
  };

  const _getYesterday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - 1);
    return today;
  };

  const _getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const _getLastMonday = (forNotification) => {
    let today = _getToday();
    if (forNotification) {
      today = _getYesterday();
    }
    const days = (today.getDay() + 7 - 1) % 7;
    return new Date(today.setDate(today.getDate() - days));
  };

  const _getFirstDayOfCurrentMonth = (forNotification) => {
    let today = _getToday();
    if (forNotification) {
      today = _getYesterday();
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const _getFirstDayOfYear = () => {
    return new Date("01-01-" + new Date().getFullYear());
  };

  const _getMonthName = (number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[number - 1];
  };

  const _formatDateWOTime = (date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    isValidCliqSignature: _isValidCliqSignature,
    isEmptyString: _isEmptyString,

    getBannerResponse: _getBannerResponse,
    getSettingsResponse: _getSettingsResponse,
    getExpenseResponse: _getExpenseResponse,

    getLastMonday: _getLastMonday,
    getYesterday: _getYesterday,
    getToday: _getToday,
    getFirstDayOfCurrentMonth: _getFirstDayOfCurrentMonth,
    getFirstDayOfYear: _getFirstDayOfYear,
    getMonthName: _getMonthName,
    formatDateWOTime: _formatDateWOTime,
  };
})();

module.exports = CommonUtil;
