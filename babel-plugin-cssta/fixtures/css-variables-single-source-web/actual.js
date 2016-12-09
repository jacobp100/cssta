import cssta from 'cssta';

cssta.div`
  --large: 100;
  --small: 50;
  --margin: var(--large) var(--small);

  width: var(--large);
`;

cssta.div`
  width: var(--small);
`;
