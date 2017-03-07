import _createComponent from 'cssta/lib/web/createComponent';
import cssta from 'cssta';
import simpleExtend from 'postcss-simple-extend';

cssta.setPostCssPipeline([simpleExtend()]);

_createComponent('button', null, {
  'defaultClassName': 'A',
  'classNameMap': {}
});

doSomethingWith(simpleExtend);