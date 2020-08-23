
import * as Grid from '../../src/qux/core/GridLayouter'


test('Test computeGrid', () => {

    let e = {
        name: "Parent",
        w: 600,
        h: 200,
        children: [
            {
                name: "Child2 Hor Fixed",
                x: 100,
                y: 0,
                w: 250,
                h: 200,
                props : {
                    resize : {
                      fixedHorizontal: true
                    }
                }
            },
            {
                name: "Child1 Vert Fixed",
                x: 0,
                y: 50,
                w: 200,
                h: 50,
                props : {
                    resize : {
                        fixedVertical: true
                    }
                }
            }
        ]
    }
    let grid = Grid.computeGrid(e)
    expect(grid).not.toBe(null)
    expect(grid.columns.length).toBe(4)
    expectGrid(grid.columns, 0, 100, false)
    expectGrid(grid.columns, 100, 100, true)
    expectGrid(grid.columns, 200, 150, true)
    expectGrid(grid.columns, 350, 250, false)

    expect(grid.rows.length).toBe(3)
    expectGrid(grid.rows, 0, 50, true)
    expectGrid(grid.rows, 50, 50, true)
    expectGrid(grid.rows, 100, 100, true)
});


test('Test computeGrid 2', () => {

    let e = {
        name: "Parent",
        w: 400,
        h: 600,
        children: [
            {
                name: "Centered Child",
                x: 50,
                y: 50,
                w: 300,
                h: 200,
                props : {
                    resize : {
                        right : true,
                        left : true,
                        up: true,
                        down:true
                      }
                }
            }
        ]
    }
    let grid = Grid.computeGrid(e)
    expect(grid).not.toBe(null)
    expect(grid.columns.length).toBe(3)
    expectGrid(grid.columns, 0, 50, true)
    expectGrid(grid.columns, 50, 300, false)
    expectGrid(grid.columns, 350, 50, true)

    expect(grid.rows.length).toBe(3)
    expectGrid(grid.rows, 0, 50, true)
    expectGrid(grid.rows, 50, 200, true)
    expectGrid(grid.rows, 250, 350, true)
});


test('Test computeGrid 3', () => {

    let e = {
        name: "Parent",
        w: 400,
        h: 600,
        children: [
            {
                name: "Centered Child",
                x: 50,
                y: 50,
                w: 300,
                h: 200,
                props : {
                    resize : {
                        fixedHorizontal: true,
                        left : true,
                        down:true,
                        fixedVertical: true
                      }
                }
            }
        ]
    }
    let grid = Grid.computeGrid(e)

    expect(grid).not.toBe(null)
    expect(grid.columns.length).toBe(3)
    expectGrid(grid.columns, 0, 50, true)
    expectGrid(grid.columns, 50, 300, true)
    expectGrid(grid.columns, 350, 50, false)


    expect(grid.rows.length).toBe(3)
    expectGrid(grid.rows, 0, 50, false)
    expectGrid(grid.rows, 50, 200, true)
    expectGrid(grid.rows, 250, 350, true)
});

function expectGrid(values, v, w, isFixed) {
    console.debug('expectGrid', v, w, isFixed)
    let e = values.find(value => value.v === v)
    expect(e).not.toBe(undefined)
    expect(e.l).toBe(w)
    expect(e.fixed).toBe(isFixed)
}

test('Test addGridToElements', () => {

    let e = {
        name: "Parent",
        w: 600,
        h: 200,
        children: [
            {
                name: "Child2 Hor Fixed",
                x: 100,
                y: 0,
                w: 250,
                h: 200,
                props : {
                    resize : {
                      fixedHorizontal: true
                    }
                }
            },
            {
                name: "Child1 Vert Fixed",
                x: 0,
                y: 50,
                w: 200,
                h: 50,
                props : {
                    resize : {
                        fixedVertical: true
                    }
                }
            }
        ]
    }
    let result = Grid.addGridToElements(e)

    expect(result).not.toBe(null)
    expect(result).not.toBe(undefined)
    expect(result.grid).not.toBe(null)
    expect(result.grid).not.toBe(undefined)

    let child1 = e.children.find(c => c.name === 'Child1 Vert Fixed')
    expect(child1.name).toBe('Child1 Vert Fixed')
    expect(child1.gridColumnStart).toBe(0)
    expect(child1.gridColumnEnd).toBe(2)
    expect(child1.gridRowStart).toBe(1)
    expect(child1.gridRowEnd).toBe(2)


    let child2 = e.children.find(c => c.name === 'Child2 Hor Fixed')
    expect(child2.name).toBe('Child2 Hor Fixed')
    expect(child2.gridColumnStart).toBe(1)
    expect(child2.gridColumnEnd).toBe(3)
    expect(child2.gridRowStart).toBe(0)
    expect(child2.gridRowEnd).toBe(3)

});


