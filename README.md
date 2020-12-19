# styled-jsx-plugin-sass-pxtorem

Use [Sass and pxtorem](http://sass-lang.com/) with [styled-jsx](https://github.com/zeit/styled-jsx) 💥

The code fork for [styled-jsx-plugin-sass](https://github.com/giuseppeg/styled-jsx-plugin-sass)

## Usage

Install the package first.

```bash
npm install --save-dev styled-jsx-plugin-sass-pxtorem
```

Install the `sass` version you need (it is a peer dependency).

```bash
npm install --save-dev sass
```

Next, add `styled-jsx-plugin-sass-pxtorem` to the `styled-jsx`'s `plugins` in your babel configuration:

```json
{
  "plugins": [
    [
      "styled-jsx/babel",
      { 
        "plugins": [
          "styled-jsx-plugin-sass-pxtorem",
          {
            "sassOptions": {
              "data": "@import '$path/variables.scss';"
            },
            "rem": {
              // 1rem=100px,
              "rootValue": 100,
              // toFixed(2)
              "unitPrecision": 2,
              // @media screen and (min-width: 1000px)
              "mediaQuery": false,
              // >= 2px
              "minPixelValue": 2,
              "selectorIgnore": [
                "html",
                ".ignore-test**"
              ],
              /* @pxtorem-ignore */
              "commentIgnore": "@pxtorem-ignore",
              "keyValueIgnore": {
                "font-size": "12px"
              }
            }
          }
        ] 
      }
    ]
  ]
}
```

next.js

```json
{
  "presets": [
    [
      "next/babel",
      {
        "styled-jsx": {
          "plugins": [
            [
              "styled-jsx-plugin-sass-pxtorem",
              {
                "sassOptions": {
                  "data": "@import '$path/variables.scss';"
                },
                "rem": {
                  // 1rem=100px,
                  "rootValue": 100,
                  // toFixed(2)
                  "unitPrecision": 2,
                  // @media screen and (min-width: 1000px)
                  "mediaQuery": false,
                  // >= 2px
                  "minPixelValue": 2,
                  "selectorIgnore": [
                    "html",
                    ".ignore-test**"
                  ],
                  /* @pxtorem-ignore */
                  "commentIgnore": "@pxtorem-ignore",
                  "keyValueIgnore": {
                    "font-size": "12px"
                  }
                }
              }
            ]
          ]
        }
      }
    ]
  ],
  "plugins": []
}
```


## examples styled-jsx

```scss
// input
.hello {
  padding: 100px;

  :global(.button-50px) {
    background-image: none;
  }
}

// output
.hello {
  padding: 1rem;

  :global(.button-50px) {
    background-image: none;
  }
}

// input
.test {
  /* @pxtorem-ignore */
  margin: 10px;
  /* @pxtorem-ignore */
  padding: 10px;
  font-size: 12px; // options.keyValueIgnore
  background: url(10px.jpg);
}

// output
.test {
  /* @pxtorem-ignore */
  margin: 10px;
  /* @pxtorem-ignore */
  padding: 10px;
  font-size: 12px; // options.keyValueIgnore
  background: url(10px.jpg);
}

// input
:root {
  --a12px: 12px;
}

.var-test {
  padding: var(--a12px);
}

// output
:root {
  --a12px: 0.12rem;
}

.var-test {
  padding: var(--a12px);
}

// input options.selectorIgnore ["html"]
html {
  font-size: 30px;
  margin: 30px;

  .b {
    font-size: 25px;
  }
}

html {
  padding: 24px;
}

.b {
  font-size: 30px;
}

// output options.selectorIgnore ["html"]
html {
  font-size: 30px;
  margin: 30px;

  .b {
    font-size: 0.25rem;
  }
}

html {
  padding: 24px;
}

.b {
  font-size: 0.3rem;
}

// input options.selectorIgnore [".ignore-test**"]
.ignore-test {
  font-size: 30px;

  .b {
    font-size: 25px;
  }
}

.a {
  font-size: 30px;
}

// output options.selectorIgnore [".ignore-test**"]
.ignore-test {
  font-size: 30px;

  .b {
    font-size: 25px;
  }
}

.a {
  font-size: 0.3rem;
}

// input/output options.mediaQuery false
@media screen and (min-width: 1000px) and (max-width: 1280px) {
  .a {
    color: #fff;
    background: url("20px.jpg");
  }
}
```

## License

MIT
