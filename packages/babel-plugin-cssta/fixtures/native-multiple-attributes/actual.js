import cssta from 'cssta/native';
import { View } from 'react-native';

cssta(View)`
  color: red;

  [@booleanAttribute] {
    color: green;
  }

  [@stringAttribute = "1"] {
    color: blue;
  }

  [@stringAttribute = "2"] {
    color: yellow;
  }
`;
