export function getAllChildren(fElement, result =[]) {
    if (fElement.children) {
        fElement.children.forEach(child => {
            result.push(child)
            getAllChildren(child, result)
        });
    }
    return result
}

export function parseStrokeGeometry(path) {
    console.debug('parseStrokeGeometry', path)
    let parts = path.split('Z')
    
}