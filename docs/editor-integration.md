---
layout: page
title: Editor Integration
permalink: /editor-integration/
---

# 🖇 Editor Integration

Loads of great work has been done for styled-components integration into text editors, including syntax highlighting and linting. Luckily, all styled-components tooling should work with Cssta: you just have call your Cssta import `styled`.

```jsx
import styled from "cssta"

styled(View)`
  color: red;
`
```

## 🖍 Syntax Highlighting

The most up-to-date list of plugins can be viewed on the [styled-components page](https://github.com/styled-components/styled-components#syntax-highlighting). Below is a copy (verbatim from styled-components).

![syntax highlighting](http://imgur.com/k7h45c3.jpg)

### Atom

[@gandm](https://github.com/gandm), the creator of language-babel, has added support for styled-components in Atom!

To get proper syntax highlighting, all you have to do is install and use the language-babel package for your JavaScript files!

### Sublime Text

There is an [open PR](https://github.com/babel/babel-sublime/pull/289) by [@garetmckinley](https://github.com/garetmckinley) to add support for styled-components to babel-sublime! (if you want the PR to land, feel free to 👍 the initial comment to let the maintainers know there’s a need for this!)

As soon as that PR is merged and a new version released, all you’ll have to do is install and use babel-sublime to highlight your JavaScript files!

### Visual Studio Code

The [vscode-styled-components](https://github.com/styled-components/vscode-styled-components) extension provides syntax highlighting inside your Javascript files. You can install it as usual from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components).

### VIM

The [vim-styled-components](https://github.com/fleischie/vim-styled-components) plugin gives you syntax highlighting inside your Javascript files. Install it with your usual plugin manager like [Plug](https://github.com/junegunn/vim-plug), [Vundle](https://github.com/VundleVim/Vundle.vim), [Pathogen](https://github.com/tpope/vim-pathogen), etc.

Also if you’re looking for an awesome javascript syntax package you can never go wrong with [YAJS.vim](https://github.com/othree/yajs.vim).
