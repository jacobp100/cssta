import cssta from 'cssta';

cssta.button`
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
