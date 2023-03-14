export function validateText(validation, value) {
    if (validation.required === true && !value) {
        return false
    }

    const type = validation.type
    if (type == "int") {
       return validateInt(validation, value)
    }

    if (type == "email") {
        return this.validateEmail(value)
    }

    if (type == "phone") {
        return this.validatePhone(value)
    }

    if (type == "date") {
       return this.validateDate(value)
    }
    if (type == "time") {
        return this.validateTime(value)
    }

    if (type == "double") {
        return this.validaeDouble(validation, value)
    }

    if (type == "string") {
       return this.validateString(validation, value)
    }


    return true
}


export function validateString(validation, value){
    const operator = validation.operator;

    /**
     * if the value is undefined that is fine for me
     */
    if (value) {
        if (operator == "contains" && validation.text) {
            return value.indexOf(validation.text) >= 0;
        }

        if (operator == "equals" && validation.text) {
            return value == validation.text;
        }

        if (operator == "pattern" && validation.pattern) {
            // eslint-disable-next-line no-undef
            const reg = new Regex(validation.pattern);
            return reg.test(value);
        }

        if (operator == "length") {
            let validString = true;
            if (validation.min != null && validation.min != undefined) {
                validString = validString && value.length >= validation.min;
            }
            if (validation.max != null && validation.max != undefined) {
                validString = validString && value.length <= validation.max;
            }
            return validString;
        }
    }
}

export function validaeDouble(validation, value){
    const re = /^-?[0-9]+((\.|,)[0-9]+)?$/;
    if (re.test(value)) {
        let inRange = true;
        if (validation.min != null && validation.min != undefined) {
            inRange = inRange && value >= validation.min;
        }

        if (validation.max != null && validation.max != undefined) {
            inRange = inRange && value <= validation.max;
        }

        return inRange;
    } else {
        return false;
    }
}

export function validateTime(value){
    const re = /^[0-9]{2}(\/|-|\.|\:)[0-9]{1,2}$/;
    return re.test(value);
}

export function validateDate(value) {
    const re = /^[0-9]{1,2}(\/|-|\.)[0-9]{1,2}(\/|-|\.)[0-9]{2,4}$/;
    return re.test(value);
}

export function validatePhone(value){
    const re = /^[\+]?([0-9]|[-\s\.])*$/;
    return re.test(value);
}

export function validateEmail(value) {
    const re = /\S+@\S+\.\S+/;
    return re.test(value);
}

export function validateInt (validation, value) {
    const re = /^-?[0-9]+$/;
    if (re.test(value)) {
        let inRange = true;
        if (validation.min != null && validation.min != undefined) {
            inRange = inRange && value >= validation.min;
        }

        if (validation.max != null && validation.max != undefined) {
            inRange = inRange && value <= validation.max;
        }

        return inRange;
    } else {
        return false;
    }
}

export function validateRequired() {

}