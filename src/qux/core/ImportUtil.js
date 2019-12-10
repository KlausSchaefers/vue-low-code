class ImportUtil {

    get(current, from) {
        let back = []
        let forward = []
        let currentParts = current.split('/')
        let fromParts = from.split('/')     
        let notEqual = false
        for (let i=0; i< currentParts.length; i++) {
            let c = currentParts[i]
            let f = fromParts[i]
            if (c !== f) {
                notEqual = true
            }
            if (notEqual) {
                back.push('..')
                if (f) {
                    forward.push(f)
                }
            }
        }
        return back.join('/')  + '/' + forward.join('/')
    }

    print(screen, grid = false) {
        let res = []
        this.printElement(res, screen, '', grid)
        screen.fixedChildren.forEach(e => {
            let pos = grid ? ` > col: ${e.gridColumnStart} - ${e.gridColumnEnd} > row: ${e.gridRowStart} - ${e.gridRowEnd}` : ''
            let row = e.row ? e.row : ''
            let actions ='' // e.lines ? ' -> ' + e.lines.map(l => l.event + ':' + l.screen.name) : '' 
            res.push(`  ${e.name}*  ${pos}  ${row}  ${actions} `)
        })
        return res.join('\n')
    }
    
    printElement(res, e, space='', grid) {
        // let actions ='' // e.lines ? ' -> ' + e.lines.map(l => l.event + ':' + l.screen.name) : '' 
        // let row = e.row ? e.row : ''
        // let parent = e.parent ? e.parent.name + ' '  + e.parent._id :  "null"
        // let pos = grid ? ` > col: ${e.gridColumnStart} - ${e.gridColumnEnd} > row: ${e.gridRowStart} - ${e.gridRowEnd}` : ''
        res.push(`${space}${e.name} - (${e.type} `)
        if (e.children) {
            e.children.forEach(c => {
                this.printElement(res, c, space + '  ', grid)
            });
        }
    }
    

}
export default new ImportUtil()