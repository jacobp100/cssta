import _createComponent from 'cssta/lib/web/createComponent';


_createComponent('button', null, {
  'defaultClassName': 'A',
  'classNameMap': {
    'stringAttribute': {
      '1': 'B',
      '2': 'C'
    }
  }
});