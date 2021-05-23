import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaRichText from './data/figmaRichText.json'
import * as TestUtil from './TestUtil'

import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test RichText', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaRichText.id, figmaRichText)

  /**
   * Check if transform works correctly
   */
  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[0]

  let boldStartEnd = TestUtil.findOneElementsByName(screen, 'BoldStartEnd')
  expect(boldStartEnd.type).toBe('RichText')
  expect(boldStartEnd.props.richTextLabel.length).toBe(3)

  let richTextLabel = boldStartEnd.props.richTextLabel
  expect(richTextLabel[0].label).toBe('BOLD')
  expect(richTextLabel[1].label).toBe(' was ')
  expect(richTextLabel[2].label).toBe('BOLD')


  let boldMiddleRed = TestUtil.findOneElementsByName(screen, 'BoldMiddleRed')
  expect(boldMiddleRed.type).toBe('RichText')
  expect(boldMiddleRed.props.richTextLabel.length).toBe(3)

  richTextLabel = boldMiddleRed.props.richTextLabel
  expect(richTextLabel[0].label).toBe('Klaus ')
  expect(richTextLabel[1].label).toBe('BOLD')
  expect(richTextLabel[1].style.color).toBe('rgba(255, 7, 7, 1)')
  expect(richTextLabel[1].style.fontWeight).toBe(700)
  expect(richTextLabel[2].label).toBe(' here')


  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  let boldCenterRightCSS = TestUtil.findCSSBySelector(classes, '.BoldCenterRight')[0]
  expect(boldCenterRightCSS.code.indexOf('justify-content:flex-end;')).toBeGreaterThan(0)

  let boldCenterCenter = TestUtil.findCSSBySelector(classes, '.BoldCenterCenter')[0]
  expect(boldCenterCenter.code.indexOf('justify-content:center;')).toBeGreaterThan(0)

});

test('Test getRichTest', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)


  let richText = figmaService.getRichText({
      "characterStyleOverrides": [
        0,
        0,
        0,
        0,
        0,
        1
      ],
      "styleOverrideTable": {
        "1": {
          "fontFamily": "Roboto",
          "fontPostScriptName": "Roboto-Bold",
          "fontWeight": 700,
          "fills": [
            {
              "blendMode": "NORMAL",
              "type": "SOLID",
              "color": {
                "r": 1.0,
                "g": 0.029166638851165771,
                "b": 0.029166638851165771,
                "a": 1.0
              }
            }
          ]
        }
      }
    }, '123456789'
  )
  expect(richText.length).toBe(3)
  expect(richText[0].label).toBe('12345')
  expect(richText[1].label).toBe('6')
  expect(richText[2].label).toBe('789')

  expect(richText[0].style).toBe(undefined)
  expect(richText[1].style).not.toBe(undefined)
  expect(richText[0].style).toBe(undefined)

  expect(richText[1].style.color).toBe('rgba(255, 7, 7, 1)')
  expect(richText[1].style.fontWeight).toBe(700)
});
