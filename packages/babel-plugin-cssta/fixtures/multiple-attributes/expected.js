import _createComponent from 'cssta/lib/web/createComponent';


_createComponent('button', null, {
  'defaultClassName': 'A',
  'classNameMap': {
    'booleanAttribute': {
      'true': 'B'
    },
    'stringAttribute': {
      '1': 'C',
      '2': 'D'
    }
  }
});