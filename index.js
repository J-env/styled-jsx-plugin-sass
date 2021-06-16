const sass = require('sass');
// excluding regex trick: http://www.rexegg.com/regex-best-trick.html

// Not anything inside double quotes
// Not anything inside single quotes
// Not anything inside url()
// Any digit followed by px
// !singlequotes|!doublequotes|!url()|pixelunit
const pxRegex = /--[^-\d][^\s]+:|"[^"]+"|'[^']+'|:global\([^)]+\)|url\([^)]+\)|var\([^)]+\)|(\d*\.?\d+)px/;
const pxMediaRegex = /(?:screen)?\s*and\s*\([^)]+px\)/;
const commentIgnoreRegex = /\/\*\s*@@\s*\*\/[^;}]+;?/;
const keyValueIgnoreRegex = /@k:\s*@v/;
const selectorIgnoreRegex = /selector[^}]+}/;
const selectorIgnoreRegex2 = /selector[^{]*{[^{}]+/;
const styledJsxRegex = /%%styled-jsx-placeholder-[\d]+%%(?:\w*\s*[),;!{])?/;

const rem_defaults = {
  rootValue: 16,
  unitPrecision: 5,
  mediaQuery: false,
  minPixelValue: 0,
  selectorIgnore: [],
  commentIgnore: "@pxtorem-ignore",
  keyValueIgnore: {}
};

let _regexpGroupStr;
let pxReplace;
let rem_options;

module.exports = (css, settings) => {
  // pxtorem
  if (settings.rem) {
    rem_options = rem_options || Object.assign({}, rem_defaults, settings.rem || {});
    _regexpGroupStr = _regexpGroupStr || createRegexpGroupStr(rem_options);
    
    pxReplace = pxReplace || createPxReplace(
      rem_options.rootValue,
      rem_options.unitPrecision,
      rem_options.minPixelValue
    );
  
    css = css.replace(new RegExp(_regexpGroupStr, 'g'), pxReplace);
  }

  // scss
  const cssWithPlaceholders = css
    .replace(/%%styled-jsx-placeholder-(\d+)%%(\w*\s*[),;!{])/g, (_, id, p1) =>
    `styled-jsx-placeholder-${id}-${p1}`
    )
    .replace(/%%styled-jsx-placeholder-(\d+)%%/g, (_, id) =>
    `/*%%styled-jsx-placeholder-${id}%%*/`
    );

  // Prepend option data to cssWithPlaceholders
  const optionData = settings.sassOptions && settings.sassOptions.data || "";
  const data = optionData + "\n" + cssWithPlaceholders;

  let preprocessed = sass.renderSync(
    Object.assign(
      {},
      settings.sassOptions,
      { data }
    )).css.toString();

  // rtl
  if (settings.rtlMode) {
    preprocessed = require('cssjanus').transform(preprocessed)
  }

  return preprocessed
    .replace(/styled-jsx-placeholder-(\d+)-(\w*\s*[),;!{])/g, (_, id, p1) =>
      `%%styled-jsx-placeholder-${id}%%${p1}`
    )
    .replace(/\/\*%%styled-jsx-placeholder-(\d+)%%\*\//g, (_, id) =>
      `%%styled-jsx-placeholder-${id}%%`
    )
}

// fns
function createPxReplace(rootValue, unitPrecision, minPixelValue) {
  return (m, $1) => {
    if (!$1) return m;

    const pixels = parseFloat($1);
    if (pixels === 0) return "0";
    if (pixels < minPixelValue || isNaN(pixels)) return m;

    const fixedVal = toFixed(pixels / rootValue, unitPrecision);
    return fixedVal === 0 ? "0" : fixedVal + "rem";
  };
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    // wholeNumber = Math.floor(number * multiplier);
    wholeNumber = ~~(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function encodeHandler(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function createRegexpGroupStr(rem_options = {}) {
  const {
    mediaQuery,
    commentIgnore,
    keyValueIgnore,
    selectorIgnore
  } = rem_options;

  const group = [styledJsxRegex.source, pxRegex.source];
  
  if (!mediaQuery) {
    group.unshift(pxMediaRegex.source);
  }

  if (commentIgnore) {
    // group.unshift(`\\/\\*\\s\*${commentIgnore}\\s\*\\\*\\/\[\^;\]\+`);
    group.unshift(commentIgnoreRegex.source.replace('@@', commentIgnore));
  }

  if (keyValueIgnore && Object.prototype.toString.call(keyValueIgnore) === '[object Object]') {
    Object.keys(keyValueIgnore).forEach(key => {
      let source = keyValueIgnoreRegex.source.replace('@k', key);
      if (keyValueIgnore[key]) source = source.replace('@v', keyValueIgnore[key]);

      group.unshift(source);
    });
  }

  if (Array.isArray(selectorIgnore)) {
    const endAllRegexp = /(\*\*)$/;

    selectorIgnore.filter(Boolean).forEach(item => {
      if (endAllRegexp.test(item)) {
        group.unshift(selectorIgnoreRegex.source.replace('selector', item.replace(endAllRegexp, '')));
      } else {
        group.unshift(selectorIgnoreRegex2.source.replace('selector', item));
      }
    });
  }

  return group.join('|');
}
