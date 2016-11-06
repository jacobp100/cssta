// You'd need a way to remove this file in your production build
import cssta from 'cssta';
import postcssSimpleExtend from 'postcss-simple-extend';

cssta.setPostCssPipeline([
  postcssSimpleExtend(),
]);
