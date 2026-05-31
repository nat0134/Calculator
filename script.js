    /**
     * Takes in user input and transforms the raw string input into a tokens 
     * array of distinct mathematical units (tokens).
     * 
     * @param {String} expression - user raw input string.
     * @returns {Array} - tokens array of string items that include numbers,
     * operators, prefix and postfix unary, parenthesis and exponential. Else
     * throws an error for invalid inputs.
     */
    function tokenize(expression) {
        const tokens = [];
        let current = "";

        for (let i = 0; i < expression.length; i++) {
            if (expression.slice(i, i + 4) === "sqrt") {
                // Flush numbers if it exists before prefix unary "sqrt".
                if (current.length > 0) {
                    tokens.push(current);
                    current = "";
                }
                tokens.push("sqrt");
                i += 3;
            } else if (/\d/.test(expression[i]) || /\./.test(expression[i])) {
                current += expression[i];
            } else if (/[-+*/^()%]/.test(expression[i])) {
                if (current.length > 0) {
                    tokens.push(current);
                    current = "";
                }

                const prev = tokens[tokens.length - 1];
                // "-" is an unary minus if it's at the start or if it comes 
                // after another operator.
                if (expression[i] === "-" && (prev === undefined ||
                    ["-", "+", "*", "/", "(", "^"].includes(prev))) {
                    tokens.push("neg");
                } else {
                    tokens.push(expression[i]);
                }
            } else if (/\s/.test(expression[i])) {
                continue;
            } else {
                throw new Error( "invalid!");
            }
        }

        // Flush last number if it exists.
        if (current.length > 0) {
            tokens.push(current);
        }

        return tokens;
    }

    /**
     * Defines operator order of precedence.
     * 
     * @param {String} token - an operator token.
     * @returns {Number} - returns numeric representation of heirarchy, 
     * operators of higher return value are calculated before the lower value.
     */
    function precedence(token) {
        if (token === "+" || token === "-") return 1;
        if (token === "*" || token === "/") return 2;
        if (token === "^") return 3;
        return 0;
    }

    /**
     * Calculates operations between two numbers and returns the result.
     * 
     * @param {Number} numA - user input a number.
     * @param {Number} numB - user input another number.
     * @param {String} operator - user input an operator between the numbers.
     * @returns {Number} returns calculated result or throw an error if invalid
     * operator has been given.
     */
    function calculation(numA, numB, operator) {
        numA = Number(numA);
        numB = Number(numB);

        switch (operator) {
            case "+": return numA + numB;
            case "-": return numA - numB;
            case "*": return numA * numB;
            case "/": return numA / numB;
            case "^": return numA ** numB;
            default:
                throw new Error("Unknown operator");
        }
    }

    /**
     * Calculates prefix and postfix unary operators, percentage, negative and
     * square root. IMPORTANT note that % does not represent modulo on this 
     * calculator. 
     * 
     * @param {Number} num - user input a number.
     * @param {String} unary - user input a postfix or prefix unary.
     * @returns {Number} returns calculated result or throws an error if an 
     * invalid unary operator has been given.
     */
    function unaryCalculation(num, unary) {
        num = Number(num);

        switch (unary) {
            case "neg": return -1 * num;
            case "%": return num / 100;
            case "sqrt": return Math.sqrt(num);
            default:
                throw new Error("Unknown unary");
        }
    }

    /**
     * The function uses Shunting-Yard Algorithm to process the array of 
     * mathematical tokens, moving operands directly to the numbers array while 
     * operators stack is managed based on their unary and binary precedence.
     * 
     * @param {String} expression - user raw input string.
     * @returns {Number} once the entire tokens array has been processed, the 
     * final calculated result is the only remaining element in the numbers 
     * array, the function returns numbers[0] that contains the final result.
     */
    function evaluation(expression) {
        const tokens = tokenize(expression);
        const numbers = [];
        const operators = [];

        tokens.forEach(token => {
            if (token === "neg" || token === "sqrt") {
                operators.push(token);
            } else if (!isNaN(token)) {
                numbers.push(Number(token));
                // Calculate prefix unary imediately if it's followed by a 
                // number.
                while (operators.length > 0 && 
                    (operators[operators.length - 1] === "neg" ||
                    operators[operators.length - 1] === "sqrt")) {   
                    const un = operators.pop();
                    const n = numbers.pop();
                    numbers.push(unaryCalculation(n, un));
                }
            } else if (token === "%") {
                if (numbers.length === 0) throw new Error("Missing operand");
                const n = numbers.pop();
                numbers.push(unaryCalculation(n, token));
            } else if (token === "(") {
                operators.push(token);
            } else if (token === ")") {
                // Tokens inside parenthesis takes higher priority for 
                // calculation.
                while (operators.length > 0 && 
                       operators[operators.length - 1] !== "(") {   
                    const op = operators.pop();
                    const b = numbers.pop();
                    const a = numbers.pop();
                    numbers.push(calculation(a, b, op));
                }
                operators.pop();
                // Apply prefix unary to the result of the parenthesized 
                // expression.
                while (operators[operators.length - 1] === "sqrt" ||
                       operators[operators.length - 1] === "neg") {   
                    const un = operators.pop();
                    const n = numbers.pop();
                    numbers.push(unaryCalculation(n, un));
                } 
            } else {
                // Calculates remaining operations based on their precedence.
                while (operators.length > 0 && 
                       precedence(operators[operators.length - 1]) >= 
                       precedence(token)) {
                    const op = operators.pop();
                    const b = numbers.pop();
                    const a = numbers.pop();
                    numbers.push(calculation(a, b, op));
                }
                operators.push(token);
            }
        });

        // Flush the last number and operator if they exist.
        while (operators.length > 0) {   
            const op = operators.pop();
            
            if (op === "sqrt" || op === "neg" || op === "%") {
                const n = numbers.pop();
                numbers.push(unaryCalculation(n, op));
            } else {
                const b = numbers.pop();
                const a = numbers.pop();
                numbers.push(calculation(a, b, op));
            }
        }

        let result = numbers[0];
        let roundedResult = Math.round(result * 100000000) / 100000000;
        return roundedResult;
    }

    /**
     * Formats expression to mathematic symbol in display field.
     * 
     * @param {String} expression - user's raw string input
     * @returns {String} replaces operators to mathematics symbols when 
     * displayed.
     */
    function formatDisplay(expression) {
        return expression
            .replaceAll("neg", "-")
            .replaceAll("sqrt", "√")
            .replaceAll("*", "x")
            .replaceAll("/", "÷");
    }
    
    const numBtn = document.querySelectorAll(".calc-num");
    const opBtn = document.querySelectorAll(".calc-op");
    const inputDisplay = document.querySelector("#input-display");
    const equalBtn = document.querySelector('.calc-equal[name="equal"]');
    const clearBtn = document.querySelector('.calc-func[name="clear"]');
    const eraseBtn = document.querySelector('.calc-func[name="erase"]');

    let expression = "";
    let result = 0;
  
    numBtn.forEach(btn => { 
        btn.addEventListener("click", () => {
            expression += btn.value;
            inputDisplay.value = formatDisplay(expression);
        });
    });
    
    opBtn.forEach(btn => { 
        btn.addEventListener("click", () => {
            expression += btn.value;
            inputDisplay.value = formatDisplay(expression);
        });
    });

    equalBtn.addEventListener("click", () => {
        result = evaluation(expression);
        inputDisplay.value = result;
        expression = String(result);
    });

    clearBtn.addEventListener("click", () => {
        inputDisplay.value = 0;
        expression = "";
    });

    eraseBtn.addEventListener("click", () => {
        let current = expression.slice(0, -1);
        inputDisplay.value = formatDisplay(current);
        expression = current;
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") return equalBtn.click();
        if (e.key === "Escape") return clearBtn.click();
        if (e.key === "Backspace") return eraseBtn.click();

        const btn = document.querySelector(`.calc-btn[value="${e.key}"]`);
        if (btn) return btn.click();
    });
