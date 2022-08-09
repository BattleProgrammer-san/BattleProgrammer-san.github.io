const cConverter = new function(){

    var currencies = {};
    var locale = {};
    var showCurrencySymbol = true;
    
    this.init = function(injectionID, options={}){
        const injectionPlace = document.getElementById(injectionID);
        if(injectionPlace == null){
            console.log("Object with ID to inject cConverter not found.");
            return;
        }

        var exchangeRatePath = "cConverter/baseData/exchangeRates.json";
        if(options.overrideCurrencies != null){
            exchangeRatePath = options.overrideCurrencies;
        }
    
        
        var localePath = "cConverter/baseData/localisation/en-US.json"
        if(options.localePath != null){
            localePath = options.localePath;
        }

        if(options.showCurrencySymbol != null){
            showCurrencySymbol = options.showCurrencySymbol;
        }
        
        fetch("cConverter/cConverter.html")
        .then(response => response.text())
        .then(html => {
            injectionPlace.innerHTML = html;
        }).catch(error => {
            console.log(error);
            return;
        }).then(() => {
            loadCurrencies(exchangeRatePath);
            loadLocale(localePath);
            initEvents();
        })
    }

    const loadCurrencies = function(exchangeRatePath){
        fetch(exchangeRatePath)
        .then(response => response.json())
        .then(json => {
            currencies = json;
            fillBaseDropdown(currencies);
        }).catch(error => {
            console.log(error);
            return;
        })
    }

    const loadLocale = function(localePath){
        fetch(localePath)
        .then(response => response.json())
        .then(json => {
            locale = json;
        }).catch(error => {
            console.log(error);
            return;
        });
    }

    const fillBaseDropdown = function(currencies){
        const baseDropdown = document.getElementById("cConverter__baseCurrencyDropdown");
        const filteredCurrencies = Object.entries(currencies).filter(([k,v]) => v.base_currency == true);
        filteredCurrencies.forEach(([k,v]) => {
            const option = document.createElement("option");
            option.value = v.currency;
            option.innerHTML = `${v.currency} (${v.currency_symbol})`;
            baseDropdown.appendChild(option);
        });

        fillTargetDropdown(currencies, baseDropdown.value);
    }

    const fillTargetDropdown = function(currencies, baseCurrency){
        const targetDropdown = document.getElementById("cConverter__targetCurrencyDropdown");
        targetDropdown.innerHTML = "";

        const availableCurrencies = Object.keys(currencies[baseCurrency].exchange_rates);

        const filteredCurrencies = Object.entries(currencies).filter(([k,v]) => availableCurrencies.includes(v.currency));
        filteredCurrencies.forEach(([k,v]) => {
            const option = document.createElement("option");
            option.value = v.currency;
            option.innerHTML = `${v.currency} (${v.currency_symbol})`;
            targetDropdown.appendChild(option);
        });
    }

    const exchangeCurrency = function(baseCurrency, targetCurrency, amount){
        const exchangeRate = currencies[baseCurrency].exchange_rates[targetCurrency];
        return amount * exchangeRate;
    }

    const anyFormChange = function(){
        const baseCurrency = document.getElementById("cConverter__baseCurrencyDropdown").value;
        const targetCurrency = document.getElementById("cConverter__targetCurrencyDropdown").value;
        const amount = document.getElementById("cConverter__inputBaseCurrency").value;

        if(baseCurrency != null && targetCurrency != null && amount != null){

            const result = exchangeCurrency(baseCurrency, targetCurrency, amount);

            document.getElementById("cConverter__inputTargetCurrency").value = result;

            presentResult(result.toFixed(2));
        }
        if (amount == ""){
            resetResult();
        }
    }

    const presentResult = function(result){
        const baseCurrencyValue = document.getElementById("cConverter__inputBaseCurrency").value;
        const baseCurrency = document.getElementById("cConverter__baseCurrencyDropdown").value;
        const targetCurrency = document.getElementById("cConverter__targetCurrencyDropdown").value;

        const baseCurrencyName = locale[baseCurrency];
        const targetCurrencyName = locale[targetCurrency];
        const conversion_label = locale["conversion_label"];

        const formattedResult = result.toLocaleString(locale.locale, {style: "currency", currency: targetCurrency});
        const formattedBaseCurrencyValue = baseCurrencyValue.toLocaleString(locale.locale, {style: "currency", currency: baseCurrency});

        document.getElementById("cConverter__baseCurrency_label").innerHTML = placeCurrencyResult(baseCurrency, formattedBaseCurrencyValue, baseCurrencyName);
        document.getElementById("cConverter__label").innerHTML = conversion_label;
        document.getElementById("cConverter__result").innerHTML = placeCurrencyResult(targetCurrency, formattedResult, targetCurrencyName);
    }

    const resetResult = function(){
        document.getElementById("cConverter__baseCurrency_label").innerHTML = "";
        document.getElementById("cConverter__label").innerHTML = "";
        document.getElementById("cConverter__result").innerHTML = "";
    }

    const placeCurrencyResult = function(currencyShort, value, currencyName){
        const currency = currencies[currencyShort];
        const symbol = currency.currency_symbol;
        if (showCurrencySymbol) {
            if (currency.currency_symbol_position == "before") {
                return `${symbol}${value} (${currencyName})`;
            } else {
                return `${value} ${symbol} (${currencyName})`;
            }
        } else {
            return `${value} ${currencyName}`;
        }
    }

    const initEvents = function(){
        const baseDropdown = document.getElementById("cConverter__baseCurrencyDropdown");
        baseDropdown.addEventListener("change", () => {
            fillTargetDropdown(currencies, baseDropdown.value);
            anyFormChange();
        } );

        const targetDropdown = document.getElementById("cConverter__targetCurrencyDropdown");
        targetDropdown.addEventListener("change", () => {
            anyFormChange();
        });

        const inputBaseCurrency = document.getElementById("cConverter__inputBaseCurrency");
        inputBaseCurrency.addEventListener("keyup", () => {
            anyFormChange();
        });
    }
}