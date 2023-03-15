export function validateText(validation, value) {
    /**
     * If required, the value must be set
     */
    if (validation.required === true && !value) {
        return false
    }

    /**
     * If not required, no valu is ok
     */
    if (!value) {
        return true
    }

    const type = validation.type
    const subtype = validation.subtype

    if (type == "int"  || subtype == "int") {
       return validateInt(validation, value)
    }

    if (type == "email") {
        return validateEmail(value)
    }

    if (type == "phone") {
        return validatePhone(value)
    }

    if (type == "date") {
       return validateDate(value)
    }
    if (type == "time") {
        return validateTime(value)
    }

    if (type == "double" || subtype == "double") {
        return validaeDouble(validation, value)
    }

    if (type == "string" || subtype == 'string') {
       return validateString(validation, value)
    }


    return true
}


export function validateString(validation, value){
    const operator = validation.operator;
    console.debug(value, validation)
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
    console.debug('validatePhone')
    const re = /^[\+]?([0-9]|[-\/\s\.])*$/;
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