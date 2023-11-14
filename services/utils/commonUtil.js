const crypto = require("crypto"); //NO I18N

const config = require("../../config/appKeys"); //NO I18N

const CommonUtil = (function () {
  const _isValidCliqSignature = (req) => {
    let isValidSignature = false;
    const signature = req.headers["x-cliq-signature"]; //NO I18N
    if (typeof signature !== "undefined") {
      const verifier = crypto.createVerify("sha256"); //NO I18N
      verifier.update(JSON.stringify(req.body));
      let publicKey = "-----BEGIN PUBLIC KEY-----\n"; //NO I18N
      publicKey += config.CLIQ_APP_PUBLIC_KEY;
      publicKey += "\n-----END PUBLIC KEY-----"; //NO I18N
      isValidSignature = verifier.verify(publicKey, signature, "base64"); //NO I18N
    }
    return isValidSignature;
  };

  const _isEmptyString = (value) => {
    return (
      (typeof value == "string" && !value.trim()) || //NO I18N
      typeof value == "undefined" || //NO I18N
      value === null
    );
  };

  const _getBannerResponse = (text, isFailure) => {
    let response = { type: "banner", text, status: "success" }; //NO I18N
    if (isFailure) {
      response.status = "failure"; //NO I18N
    }
    return response;
  };

  const _getSettingsResponse = (defaultCurrency) => ({
    name: "settingsform", //NO I18N
    type: "form", //NO I18N
    title: "Expense Manager - Settings", //NO I18N
    button_label: "Save", //NO I18N
    inputs: [
      {
        type: "select", //NO I18N
        name: "currency", //NO I18N
        label: "Currency", //NO I18N
        hint: "Choose your currency.", //NO I18N
        placeholder: "INR", //NO I18N
        options: [
          { label: "Australian Dollar - AUD", value: "AUD" }, //NO I18N
          { label: "Chinese Renminbi - RMB", value: "RMB" }, //NO I18N
          { label: "Euro - EUR", value: "EUR" }, //NO I18N
          { label: "Indian Rupee - INR", value: "INR" }, //NO I18N
          { label: "Japanese Yen - JPY", value: "JPY" }, //NO I18N
          { label: "United States Dollar - USD", value: "USD" }, //NO I18N
        ],
        mandatory: true,
        value: defaultCurrency || "",
      },
    ],
    action: {
      type: "invoke.function", //NO I18N
      name: "expensemanagerform", //NO I18N
    },
  });

  const _getExpenseResponse = (expenses, frequency, data) => {
    let title;
    let rows = [];
    let totalExpense = 0;
    const amountColumn = "Amount (" + data.currency + ")"; //NO I18N
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
      title = "Expense for this week till " + _formatDateWOTime(data.toDate); //NO I18N
    } else {
      title =
        "Expenses for the month - " +
        data.month +
        " " +
        data.toDate.getFullYear(); //NO I18N
    }

    let response = {
      text: "Total Expense: " + totalExpense + " " + data.currency, //NO I18N
      card: {
        title: title,
        theme: "modern-inline", //NO I18N
      },
      bot: {
        name: "Expense Manager", //NO I18N
        image: "https://i.ibb.co/6YQcdpr/exp-mang.png", //NO I18N
      },
      slides: [
        {
          type: "table", //NO I18N
          data: {
            headers: ["Date", "Category", "Note", amountColumn], //NO I18N
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
      "January", //NO I18N
      "February", //NO I18N
      "March", //NO I18N
      "April", //NO I18N
      "May", //NO I18N
      "June", //NO I18N
      "July", //NO I18N
      "August", //NO I18N
      "September", //NO I18N
      "October", //NO I18N
      "November", //NO I18N
      "December", //NO I18N
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
