
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'

test('Test compress() > All equal', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "borderTopRightRadius" : 100,
        "borderTopLeftRadius" : 100,
        "borderBottomRightRadius" : 100,
        "borderBottomLeftRadius" : 100,
        "borderTopWidth" : 2,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 2,
        "borderLeftWidth" : 2,
        "borderTopColor" : "#333",
        "borderRightColor" : "#333",
        "borderBottomColor" : "#333",
        "borderLeftColor" : "#333"
    })

   // console.debug(result)

    expect(result.color).toBe('#121212')

    expect(result.borderBottomLeftRadius).toBe(undefined)
    expect(result.borderBottomRightRadius).toBe(undefined)
    expect(result.borderTopRightRadius).toBe(undefined)
    expect(result.borderTopLeftRadius).toBe(undefined)

    expect(result.borderTopColor).toBe(undefined)
    expect(result.borderRightColor).toBe(undefined)
    expect(result.borderBottomColor).toBe(undefined)
    expect(result.borderLeftColor).toBe(undefined)
    expect(result.borderColor).toBe(undefined)

    expect(result.borderTopWidth).toBe(undefined)
    expect(result.borderRightWidth).toBe(undefined)
    expect(result.borderBottomWidth).toBe(undefined)
    expect(result.borderLeftWidth).toBe(undefined)
    expect(result.borderWidth).toBe(undefined)

    expect(result.borderTopStyle).toBe(undefined)
    expect(result.borderRightStyle).toBe(undefined)
    expect(result.borderBottomStyle).toBe(undefined)
    expect(result.borderLeftStyle).toBe(undefined)
    expect(result.borderStyle).toBe(undefined)

    expect(result.border).toBe('2px solid #333')

});


test('Test compress() > Remove', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "borderTopRightRadius" : 100,
        "borderTopLeftRadius" : 100,
        "borderBottomRightRadius" : 100,
        "borderBottomLeftRadius" : 100,
        "borderTopWidth" : 0,
        "borderRightWidth" : 0,
        "borderBottomWidth" : 0,
        "borderLeftWidth" : 0,
        "borderTopColor" : "transparent",
        "borderRightColor" : "transparent",
        "borderBottomColor" : "transparent",
        "borderLeftColor" : "transparent"
    })

   // console.debug(result)

    expect(result.color).toBe('#121212')

    expect(result.borderTopColor).toBe(undefined)
    expect(result.borderRightColor).toBe(undefined)
    expect(result.borderBottomColor).toBe(undefined)
    expect(result.borderLeftColor).toBe(undefined)
    expect(result.borderColor).toBe(undefined)

    expect(result.borderTopWidth).toBe(undefined)
    expect(result.borderRightWidth).toBe(undefined)
    expect(result.borderBottomWidth).toBe(undefined)
    expect(result.borderLeftWidth).toBe(undefined)
    expect(result.borderWidth).toBe(undefined)

    expect(result.borderTopStyle).toBe(undefined)
    expect(result.borderRightStyle).toBe(undefined)
    expect(result.borderBottomStyle).toBe(undefined)
    expect(result.borderLeftStyle).toBe(undefined)
    expect(result.borderStyle).toBe(undefined)

    expect(result.border).toBe('0px solid transparent')

});