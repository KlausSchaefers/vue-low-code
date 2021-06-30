import ModelTransformer from '../../src/qux/core/ModelTransformer'
import FigmaService from '../../src/qux/figma/FigmaService'
import figmaAutoHorizontalAndVertical from './data/figmaAutoHorizontalAndVertical.json'
import * as TestUtil from './TestUtil'
import {Layout} from '../../src/qux/core/Const'
import * as Util from '../../src/qux/core/ExportUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('Test Horizontal', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoHorizontalAndVertical.id, figmaAutoHorizontalAndVertical)

  let t = new ModelTransformer(app)
  let model = t.transform()

  expect(model).not.toBeNull()
  let screen = model.screens[0]

  let spaceBetween = assertLayout(screen, 'AutoHorSpaceSpaceBetween', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(spaceBetween)).toBe(true)
  expect(spaceBetween.layout.itemSpacing).toBe(10)
  expect(spaceBetween.layout.justifyContent).toBe('space-between')
  expect(spaceBetween.layout.alignItems).toBe('flex-start')
  expect(spaceBetween.layout.paddingLeft).toBe(10.0)
  expect(spaceBetween.layout.paddingRight).toBe(10.0)
  expect(spaceBetween.layout.paddingTop).toBe(10.0)
  expect(spaceBetween.layout.paddingBottom).toBe(10.0)

  let packed = assertLayout(screen, 'AutoHorSpacePacked', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(packed)).toBe(true)
  expect(packed.layout.itemSpacing).toBe(10)
  expect(packed.layout.justifyContent).toBe('flex-start')
  expect(packed.layout.alignItems).toBe('flex-start')

  let packedHug = assertLayout(screen, 'AutoHorSpacePackedHug', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(packedHug)).toBe(true)
  expect(packedHug.layout.itemSpacing).toBe(10)
  expect(packedHug.layout.justifyContent).toBe('flex-start')
  expect(packedHug.layout.alignItems).toBe('flex-start')

  let fixedCenterCenter = assertLayout(screen, 'AutoHorFixedCenterCenter', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(fixedCenterCenter)).toBe(true)
  expect(fixedCenterCenter.layout.itemSpacing).toBe(10)
  expect(fixedCenterCenter.layout.justifyContent).toBe('center')
  expect(fixedCenterCenter.layout.alignItems).toBe('center')

  let fixedCenterBottom = assertLayout(screen, 'AutoHorPackedCenterBottom', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(fixedCenterBottom)).toBe(true)
  expect(fixedCenterBottom.layout.itemSpacing).toBe(10)
  expect(fixedCenterBottom.layout.justifyContent).toBe('center')
  expect(fixedCenterBottom.layout.alignItems).toBe('flex-end')


  let fixedBotomRightMixed = assertLayout(screen, 'AutoHorPackedCenterRightMixed', Layout.AutoHorizontal)
  expect(Util.isFixedHorizontal(fixedBotomRightMixed)).toBe(true)
  expect(fixedBotomRightMixed.layout.itemSpacing).toBe(10)
  expect(fixedBotomRightMixed.layout.justifyContent).toBe('flex-end')
  expect(fixedBotomRightMixed.layout.alignItems).toBe('flex-end')
  expect(fixedBotomRightMixed.layout.paddingLeft).toBe(10.0)
  expect(fixedBotomRightMixed.layout.paddingRight).toBe(5)
  expect(fixedBotomRightMixed.layout.paddingTop).toBe(10.0)
  expect(fixedBotomRightMixed.layout.paddingBottom).toBe(10.0)


  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)

  // test css a little
  let cssAutoSpaceBetween = TestUtil.findCSSBySelector(classes, '.AutoHorSpaceSpaceBetween')[0]
  assertCSS(cssAutoSpaceBetween, 'justify-content: space-between;')
  assertNotCSS(cssAutoSpaceBetween, 'gap: 10px;')
});



test('Test Vertical', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */
  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(figmaAutoHorizontalAndVertical.id, figmaAutoHorizontalAndVertical)

  let t = new ModelTransformer(app)
  let model = t.transform()

  expect(model).not.toBeNull()

  let screen = model.screens[1]

  //console.debug(TestUtil.print(screen))

  let packedHug = assertLayout(screen, 'AutoVerticalPackedHug', Layout.AutoVertical)
  expect(Util.isFixedHorizontal(packedHug)).toBe(true)
  expect(packedHug.layout.itemSpacing).toBe(10)
  expect(packedHug.layout.justifyContent).toBe('flex-start')
  expect(packedHug.layout.alignItems).toBe('flex-start')
  expect(packedHug.layout.paddingLeft).toBe(10.0)
  expect(packedHug.layout.paddingRight).toBe(10.0)
  expect(packedHug.layout.paddingTop).toBe(10.0)
  expect(packedHug.layout.paddingBottom).toBe(10.0)


  let spaceBetween = assertLayout(screen, 'AutoVerticalSpaceBetweenFixed', Layout.AutoVertical)
  expect(Util.isFixedHorizontal(spaceBetween)).toBe(true)
  expect(spaceBetween.layout.itemSpacing).toBe(10)
  expect(spaceBetween.layout.alignItems).toBe('flex-start')
  expect(spaceBetween.layout.justifyContent).toBe('space-between')
  expect(spaceBetween.layout.paddingLeft).toBe(10.0)
  expect(spaceBetween.layout.paddingRight).toBe(10.0)
  expect(spaceBetween.layout.paddingTop).toBe(10.0)
  expect(spaceBetween.layout.paddingBottom).toBe(10.0)

  let rightBottom = assertLayout(screen, 'AutoVerticalPackedRightBottom', Layout.AutoVertical)
  expect(Util.isFixedHorizontal(rightBottom)).toBe(true)
  expect(rightBottom.layout.itemSpacing).toBe(10)
  expect(rightBottom.layout.justifyContent).toBe('flex-end')
  expect(rightBottom.layout.alignItems).toBe('flex-end')
  expect(rightBottom.layout.paddingLeft).toBe(10.0)
  expect(rightBottom.layout.paddingRight).toBe(10.0)
  expect(rightBottom.layout.paddingTop).toBe(10.0)
  expect(rightBottom.layout.paddingBottom).toBe(10.0)


  let spaceBetweenCenter = assertLayout(screen, 'AutoVerticalSpaceBetweenCenter', Layout.AutoVertical)
  expect(Util.isFixedHorizontal(spaceBetweenCenter)).toBe(true)
  expect(spaceBetweenCenter.layout.itemSpacing).toBe(10)
  expect(spaceBetweenCenter.layout.justifyContent).toBe('space-between')
  expect(spaceBetweenCenter.layout.alignItems).toBe('center')
  expect(spaceBetweenCenter.layout.paddingLeft).toBe(10.0)
  expect(spaceBetweenCenter.layout.paddingRight).toBe(10.0)
  expect(spaceBetweenCenter.layout.paddingTop).toBe(10.0)
  expect(spaceBetweenCenter.layout.paddingBottom).toBe(10.0)
})


function assertLayout(screen, name, type) {
  let e = TestUtil.findOneElementsByName(screen, name)
  expect(e).not.toBeUndefined()
  expect(e.layout.type).toBe(type)
  return e
}


function assertCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBeGreaterThanOrEqual(0)
}

function assertNotCSS (file, statementToFind) {
  expect(file.code.indexOf(statementToFind)).toBe(-1)
}
