// 穷举单种花色所有不带将组合情况（依次放次1组、2组、3组、4组顺子或刻子，将最到得到的牌按连续性切分放入wave表中）
// 穷举单种花色所有带将组合情况（先放入一对将，然后依次放次1组、2组、3组、4组顺子或刻子，将最到得到的牌按连续性切分放入wave表或wave_eye表中）

// 不带将：3, 6, 9, 12
// 带将：2, 5, 8, 11, 14

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

// 去重表
const cache = {
  table: [],
  eyeTable: []
};
// 组合表
const assembly = {
  table: {
    '3': [111, 3],
    '6': [],
    '9': [],
    '12': []
  },
  eyeTable: {
    '2': [
      '200000000',
      '020000000',
      '002000000',
      '000200000',
      '000020000',
      '000002000',
      '000000200',
      '000000020',
      '000000002'
    ],
    '5': [],
    '8': [],
    '11': [],
    '14': []
  }
};

const maxLen = 9;
const maxSize = 4;

// 不断往牌组里按连续的组合，添加顺子和刻子，找出所有的可能
// 注：带眼的按最大9的可能来添加，因为要首先保证各种位置的眼都成可能
function add(cards, idx, hasEye) {
  for (let i = 0, len = cards.length; i < len; i++) {
    const card = cards[i].toString();
    const cLen = card.length;

    let sLen = Math.min(cLen + 3, maxLen);
    let sMatrix = _.fill(Array(sLen), 0);
    let sCardMatrix = sMatrix.slice();
    sCardMatrix.splice(0, cLen, ...card.split(''));
    let sCard = parseInt(sCardMatrix.join(''));

    // 顺子
    for (let j = 2; j < sLen; j++) { 
      const matrix = sMatrix.slice();
      matrix.splice(j - 2, 3, 1, 1, 1);
      const augend = matrix.join('') - 0;

      check(sCard + augend, idx, hasEye);
    }

    let tLen = Math.min(cLen + 1, maxLen);
    let tCard = tLen >= 9 ? parseInt(card) : card * 10;
    let tMatrix = _.fill(Array(tLen), 0);

    // 刻子
    for (let j = 0; j < tLen; j++) {
      const matrix = tMatrix.slice();
      matrix.splice(j, 1, 3);
      const augend = matrix.join('') - 0;

      check(tCard + augend, idx, hasEye);
    }
  }
}

// 检查正确性
// 1. 去重
// 2. 去掉某些组合超出每个牌只有3张的可能
function check(meld, idx, hasEye, isNumberal) {
  const list = cache[hasEye ? 'eyeTable' : 'table'];
  const map = assembly[hasEye ? 'eyeTable' : 'table'];
  
  if (_.indexOf(list, meld) > -1) {
    return;
  }

  list.push(meld);
  
  let flag = true;
  let melds = meld.toString().split('');

  for (let i = 0, len = melds.length; i < len; i++) {
    let item = melds[i];

    if (item > maxSize) {
      flag = false;
      break;
    }
  }

  if (flag) {
    meld = parseInt(melds.join('')); 
    map[idx].push(meld);
  }
}

// 移除不连续的牌组 & 去掉开头和末尾的多余占位符
function drop(list) {
  let result = [];

  list.forEach(meld => {
    let flag = true;
    let melds = meld.toString().split('');
    melds = _.dropWhile(melds, zero);
    melds = _.dropRightWhile(melds, zero);

    for (let i = 0, len = melds.length; i < len; i++) {
      let item = melds[i];

      if (item == 0) {
        flag = false;
        break;
      }
    }

    if (flag) {
      result.push(parseInt(melds.join('')));
    }
  });

  return result;
}

function zero(num) {
  return num === '0';
}

// 不带将牌组
function makeTable() {
  const map = assembly.table;

  for (let i = 1; i < 4; i++) {
    let key = i * 3;
    let nextKey = key + 3;

    add(map[key], nextKey, false);
    map[nextKey] = _.uniq(drop(map[nextKey]));
  }
}

// 带将牌组
function makeEyeTable() {
  const map = assembly.eyeTable;

  for (let i = 0; i < 4; i++) {
    let key = i * 3 + 2;
    let nextKey = key + 3;

    add(map[key], nextKey, true);
    map[key] = _.uniq(drop(map[key]));

    if (i === 3) {
      map[nextKey] = _.uniq(drop(map[nextKey]));
    }
  }
}

function count(map) {
  let total = 0;

  for (let key in map) {
    total += map[key].length;
  }

  return total;
}

console.log('创建表开始----');
console.log('1. 创建普通表');

makeTable();

console.log(`---数字牌普通表创建完成，总共${count(assembly.table)}种可能`);
console.log('2. 创建带将表');

makeEyeTable();

console.log(`---数字牌带将表创建完成，总共${count(assembly.eyeTable)}种可能`);
console.log('创建表结束----');

function writeLocal() {
  let data = `
    import * as _ from 'lodash';
    export const assembly: _.Dictionary<number[]> = ${JSON.stringify(assembly.table)};
    export const eyeAssembly: _.Dictionary<number[]> = ${JSON.stringify(assembly.eyeTable)};
  `;

  fs.writeFileSync(path.resolve(__dirname, 'data.ts'), data);
}

writeLocal();
