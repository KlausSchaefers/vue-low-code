export function getAllChildren(fElement, result =[]) {
    if (fElement.children) {
        fElement.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
    return result
}
