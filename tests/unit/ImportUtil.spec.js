
import ImportUtil from '../../src/qux/core/ImportUtil'


test('Test ImportUtil', () => {

    let prefix = ImportUtil.get('generated/src/components', 'generated/src/images')
    expect(prefix).toBe('../images')

    prefix = ImportUtil.get('generated/src/components', 'generated/images')
    expect(prefix).toBe('../../images')

});

