export function print(screen, grid = false) {
    let res = []
    printElement(res, screen, '', grid)
    if (screen.fixedChildren && screen.fixedChildren.length > 0) {
        res.push('--------------')
        screen.fixedChildren.forEach(c => {
            printElement(res, c, '*  ', grid)
        })
    }
    return res.join('\n')
}

function printElement(res, e, space='', grid) {
    let actions ='' // e.lines ? ' -> ' + e.lines.map(l => l.event + ':' + l.screen.name) : ''
    let row = e.row ? e.row : ''
    let parent = e.parent ? e.parent.name + ' '  + e.parent._id :  "null"
    let pos = grid ? ` > col: ${e.gridColumnStart} - ${e.gridColumnEnd} > row: ${e.gridRowStart} - ${e.gridRowEnd}` : ''
    res.push(`${space}${e.name} - (${parent})  ${pos}  ${row}  ${actions} `)
    if (e.children) {
        e.children.forEach(c => {
            printElement(res, c, space + '  ', grid)
        });
    }
}

export function findElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result
}

export function findOneElementsByName (e, name, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c.name === name) {
                result.push(c)
            }
            findElementsByName(c, name, result)
        })
    }
    return result[0]
}

export function findOneElementsByProp(e, value, prop, result = []) {
    if (e.children) {
        e.children.forEach(c => {
            if (c[prop] === value) {
                result.push(c)
            }
            findOneElementsByProp(c, value, prop, result)
        })
    }
    return result[0]
}