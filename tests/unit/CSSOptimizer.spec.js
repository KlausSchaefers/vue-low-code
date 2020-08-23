
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'


test('Test compress() > All different', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "paddingTop" : 1,
        "paddingRight" : 2,
        "paddingBottom" : 3,
        "paddingLeft" : 4,
        "borderTopLeftRadius" : 100,
        "borderTopRightRadius" : 200,
        "borderBottomLeftRadius" : 300,
        "borderBottomRightRadius" : 400,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#222",
        "borderBottomColor" : "#333",
        "borderLeftColor" : "#444",
        "borderLeftStyle": "dashed",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    console.debug(result)

    expect(result.color).toBe('#121212')

    expect(result.border).toBe(undefined)

    expect(result.borderBottomLeftRadius).toBe(undefined)
    expect(result.borderBottomRightRadius).toBe(undefined)
    expect(result.borderTopRightRadius).toBe(undefined)
    expect(result.borderTopLeftRadius).toBe(undefined)
    expect(result.borderRadius).toBe('100px 200px 400px 300px')

    expect(result.borderTopColor).toBe(undefined)
    expect(result.borderRightColor).toBe(undefined)
    expect(result.borderBottomColor).toBe(undefined)
    expect(result.borderLeftColor).toBe(undefined)
    expect(result.borderColor).toBe('#111 #222 #333 #444')


    expect(result.borderTopWidth).toBe(undefined)
    expect(result.borderRightWidth).toBe(undefined)
    expect(result.borderBottomWidth).toBe(undefined)
    expect(result.borderLeftWidth).toBe(undefined)
    expect(result.borderWidth).toBe('1px 2px 3px 4px')

    expect(result.borderTopStyle).toBe(undefined)
    expect(result.borderRightStyle).toBe(undefined)
    expect(result.borderBottomStyle).toBe(undefined)
    expect(result.borderLeftStyle).toBe(undefined)
    expect(result.borderStyle).toBe('solid solid solid dashed')


});


test('Test compress() > Collapse Radius', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        // Order: top-left corner, top-right,  bottom-left corners, bottom-right
        "borderTopLeftRadius" : 1,
        "borderTopRightRadius" : 1,
        "borderBottomLeftRadius" : 1,
        "borderBottomRightRadius" : 1,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#222",
        "borderBottomColor" : "#333",
        "borderLeftColor" : "#444",
        "borderLeftStyle": "dashed",
        "paddingTop" : 1,
        "paddingLeft" : 2,
        "paddingBottom" : 3,
        "paddingRight" : 4,
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    expect(result.borderBottomLeftRadius).toBe(undefined)
    expect(result.borderBottomRightRadius).toBe(undefined)
    expect(result.borderTopRightRadius).toBe(undefined)
    expect(result.borderTopLeftRadius).toBe(undefined)
    expect(result.borderRadius).toBe('1px')
});


test('Test compress() > Collapse Width', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "borderTopRightRadius" : 100,
        "borderTopLeftRadius" : 100,
        "borderBottomRightRadius" : 100,
        "borderBottomLeftRadius" : 100,
        "borderTopWidth" : 1,
        "borderRightWidth" : 1,
        "borderBottomWidth" : 1,
        "borderLeftWidth" : 1,
        "borderTopColor" : "#111",
        "borderRightColor" : "#222",
        "borderBottomColor" : "#333",
        "borderLeftColor" : "#444",
        "borderLeftStyle": "dashed",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    expect(result.borderTopWidth).toBe(undefined)
    expect(result.borderRightWidth).toBe(undefined)
    expect(result.borderBottomWidth).toBe(undefined)
    expect(result.borderLeftWidth).toBe(undefined)
    expect(result.borderWidth).toBe('1px')
});


test('Test compress() > Collapse Color', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "borderTopRightRadius" : 100,
        "borderTopLeftRadius" : 100,
        "borderBottomRightRadius" : 100,
        "borderBottomLeftRadius" : 100,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#111",
        "borderBottomColor" : "#111",
        "borderLeftColor" : "#111",
        "borderLeftStyle": "solid",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    expect(result.borderTopColor).toBe(undefined)
    expect(result.borderRightColor).toBe(undefined)
    expect(result.borderBottomColor).toBe(undefined)
    expect(result.borderLeftColor).toBe(undefined)
    expect(result.borderColor).toBe('#111')
});


test('Test compress() > Collapse Padding', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "paddingTop" : 100,
        "paddingLeft" : 100,
        "paddingRight" : 100,
        "paddingBottom" : 100,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#111",
        "borderBottomColor" : "#111",
        "borderLeftColor" : "#111",
        "borderLeftStyle": "solid",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    expect(result.paddingTop).toBe(undefined)
    expect(result.paddingLeft).toBe(undefined)
    expect(result.paddingRight).toBe(undefined)
    expect(result.paddingTop).toBe(undefined)
    // ensure that the values are saved as backups
    expect(result._paddingTop).toBe(100)
    expect(result._paddingLeft).toBe(100)
    expect(result._paddingRight).toBe(100)
    expect(result._paddingTop).toBe(100)
    expect(result.padding).toBe('100px')

});


test('Test compress() > Remove Padding', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "paddingTop" : 0,
        "paddingLeft" : 0,
        "paddingRight" : 0,
        "paddingBottom" : 0,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#111",
        "borderBottomColor" : "#111",
        "borderLeftColor" : "#111",
        "borderLeftStyle": "solid",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    // expect(result.paddingTop).toBe(undefined)
    // expect(result.paddingLeft).toBe(undefined)
    // expect(result.paddingRight).toBe(undefined)
    // expect(result.paddingTop).toBe(undefined)
    // expect(result.padding).toBe(undefined)

});

test('Test compress() > Remove solid x 4 Style', () => {

    let o = new CSSOptimizer()

    let result = o.compress({
        "color": "#121212",
        "borderTopRightRadius" : 100,
        "borderTopLeftRadius" : 100,
        "borderBottomRightRadius" : 100,
        "borderBottomLeftRadius" : 100,
        "borderTopWidth" : 1,
        "borderRightWidth" : 2,
        "borderBottomWidth" : 3,
        "borderLeftWidth" : 4,
        "borderTopColor" : "#111",
        "borderRightColor" : "#222",
        "borderBottomColor" : "#333",
        "borderLeftColor" : "#444",
        "borderLeftStyle": "solid",
        "backgroundImage" : {
            "url" : "5cfbfcaae2fb53355b5e8e24/a2aa10aC3SBc00sYp3ezMi0HVLmaufhH35GLo72bwED2FL2eVy21k02tgeVW.jpg",
            "w" : 319,
            "h" : 325
        }
    })

    expect(result.border).toBe(undefined)

    expect(result.borderTopWidth).toBe(undefined)
    expect(result.borderRightWidth).toBe(undefined)
    expect(result.borderBottomWidth).toBe(undefined)
    expect(result.borderLeftWidth).toBe(undefined)
    expect(result.borderStyle).toBe(undefined)

});
