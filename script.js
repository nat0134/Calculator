    function tokenize(expression) {
        const tokens = [];
        let current = "";
        let prev = null;
        for (let i = 0; i < expression.length; i++) {
            if (expression.slice(i, i + 4) === "sqrt") {
                tokens.push("sqrt");
                i += 3;
            } else if (/\d/.test(expression[i]) || /\./.test(expression[i])) {
                current += expression[i];
            } else if (/[-+*/^()%]/.test(expression[i])) {
                if (current.length > 0) {
                    tokens.push(current);
                    current = "";
                }

                prev = tokens[tokens.length - 1];
                if (expression[i] === "-" && (prev === null ||
                       ["+", "-", "*", "/", "(", "^"].includes(prev))) {
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

        if (current.length > 0) {
            tokens.push(current);
        }

        return tokens;
    }

    function precedence(token) {
        if (token === "+" || token === "-") return 1;
        if (token === "*" || token === "/") return 2;
        if (token === "^") return 3;
        return 0;
    }

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

    function evaluation(expression) {
        const tokens = tokenize(expression);
        const numbers = [];
        const operators = [];

        tokens.forEach(token => {
            if (!isNaN(token)) {
                numbers.push(Number(token));
                if (operators.length > 0 && 
                    (operators[operators.length - 1] === "neg" ||
                    operators[operators.length - 1] === "sqrt")) {   
                    const un = operators.pop();
                    const n = numbers.pop();
                    numbers.push(unaryCalculation(n, un));
                }
            } else if (token === "neg") {
                operators.push(token);
            } else if (token === "%") {
                if (numbers.length === 0) throw new Error("Missing operand");
                const n = numbers.pop();
                numbers.push(unaryCalculation(n, token));
            } else if (token === "(") {
                operators.push(token);
            } else if (token === ")") {
                while (operators[operators.length - 1] !== "(" &&
                       operators.length > 0) {   
                    const op = operators.pop();
                    const b = numbers.pop();
                    const a = numbers.pop();
                    numbers.push(calculation(a, b, op));
                }
                operators.pop();
                if (operators[operators.length - 1] === "sqrt") {   
                    const un = operators.pop();
                    const n = numbers.pop();
                    numbers.push(unaryCalculation(n, un));
                } 
            } else {
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
            inputDisplay.value = expression;
        });
    });
    
    opBtn.forEach(btn => { 
        btn.addEventListener("click", () => {
            expression += btn.value;
            inputDisplay.value = expression;
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
        inputDisplay.value = current;
        expression = current;
    });
