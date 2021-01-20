
import FigmaService from '../../src/qux/figma/FigmaService'
import luisaAttachLabelBug from './data/luisaAttachLabelBug.json'


test('Test Luisa Landing', async () => {


  let figmaService = new FigmaService()
  figmaService.setDownloadVectors(false)
  let app = await figmaService.parse(luisaAttachLabelBug.id, luisaAttachLabelBug)
  expect(app).not.toBeUndefined()

  let placeHolderWidget = Object.values(app.widgets).find(w => w.figmaId === '124:388')
  expect(placeHolderWidget).not.toBeUndefined()
  console.debug(placeHolderWidget)

  let nodesWithImages = figmaService.getElementsWithBackgroundIMage(app, true)
  let placeHolderWidget2 = nodesWithImages.find( w => w.figmaId === '124:388')
  console.debug(placeHolderWidget2)


});



