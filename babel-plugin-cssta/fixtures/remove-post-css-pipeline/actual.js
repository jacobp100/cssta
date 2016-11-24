import cssta from 'cssta';
import simpleExtend from 'postcss-simple-extend';

cssta.setPostCssPipeline([
  simpleExtend(),
]);

cssta.button`
  color: red;
`;
