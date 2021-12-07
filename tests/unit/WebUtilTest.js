import {replaceAllowedTags} from '../../src/qux/web/WebUtil'

test('Test cleanInnerHTML', async () => {

    let clean = replaceAllowedTags('&lt;b&gt;Rhis is fat&lt;/b&gt; not fat &lt;b&gt;fat agaib&lt;/b&gt; - &lt;B&gt;FAT&lt;/B&gt;&lt;script&gt;alert("XXX")&lt;/script&gt;')
    expect(clean).toBe('<b>Rhis is fat</b> not fat <b>fat agaib</b> - <b>FAT</b>&lt;script&gt;alert("XXX")&lt;/script&gt;')
  
  
  });
  