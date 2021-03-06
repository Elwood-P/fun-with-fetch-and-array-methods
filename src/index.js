// Vars
let charactersData = [];
let loadingAnimation = null;

// Consts
const characterTable = document.getElementById('table--character');
const characterTableBody = document.getElementById('table--character__body');
const addBtn = document.getElementById('btn--add');
const calcGoldBtn = document.getElementById('btn--calc-gold');
const dragonBtn = document.getElementById('btn--dragon');
const orderBtn = document.getElementById('btn--order');
const filterBtn = document.getElementById('btn--filter');
const errorBtn = document.getElementById('btn--error');

// EventListeners
addBtn.addEventListener('click', () => addRandomCharacter());
calcGoldBtn.addEventListener('click', () => renderTable(charactersData, true));
dragonBtn.addEventListener('click', dragonAttack);
orderBtn.addEventListener('click', orderByGold);
filterBtn.addEventListener('click', filterByHobbits);
errorBtn.addEventListener('click', () => addRandomCharacter(true));

// Fetch & add character to array
async function addRandomCharacter(error) {
  const characterNumber = Math.floor(Math.random() * 932);
  loading();
  try {
    const response = await fetch(
      `/.netlify/functions/token-hider?${characterNumber}` // Netlify function makes fetch request to API in order to hide API token - see netlify/functions/token-hider/token-hider.js
    );
    if (response.ok) {
      const newCharacterArray = await response.json();
      const newCharacter = {
        id: characterNumber,
        name: newCharacterArray.docs[0].name,
        race:
          newCharacterArray.docs[0].race !== 'NaN'
            ? newCharacterArray.docs[0].race
            : 'Unknown', // Original data is polluted with occasional "NaN" values
        gold: Math.floor(Math.random() * 1000),
      };
      charactersData.push(newCharacter);

      setTimeout(() => {
        renderTable();
      }, 1000);

    } else {
      renderFetchError(`${response.status}: ${response.statusText}`);
    }
  }
  catch (error) {
    console.log(error);
  }
}

// Render Table
function renderTable(Data = charactersData, showTotal) {
  clearTable();

  for (const character of Data) {
    characterTableBody.innerHTML += `
    <tr>
      <td>${character.name}</td>
      <td>${character.race}</td>
      <td>${character.gold}</td>
    </tr>
  `;
  }

  if (showTotal) {
    const totalGold = getTotalGold();
    characterTableBody.innerHTML += `
    <tr class="table__row-total">
      <td></td>
      <td>Total Gold</td>
      <td>${totalGold}</td>
    </tr>
    `;
  }
}

// Loading animation (css version: https://jsfiddle.net/f6vhway2/1/)
function loading() {
  clearTable();
  let i = 0;
  loadingAnimation = setInterval(animateDots, 500);

  function animateDots() {
    i = (i % 4) + 1;
    const loadingDots = '.'.repeat(i - 1);
    characterTableBody.innerHTML = `Loading${loadingDots}`;
  }
}

// Clear Table
function clearTable() {
  // Clear timer
  clearInterval(loadingAnimation);
  // Clear alert
  if (document.getElementById('alert--fetchError')) {
    document.getElementById('alert--fetchError').remove();
  }
  // Clear table data
  characterTableBody.innerHTML = '';
}

// Button functions
function getTotalGold() {
  return charactersData.reduce((previous, current) => {
    return previous + current.gold;
  }, 0);
}

function dragonAttack() {
  const totalGold = getTotalGold();
  charactersData = charactersData.map((character, i) => {
    return i ? { ...character, gold: 0 } : { ...character, gold: totalGold }; // Dragon is always index 0
  });
  renderTable();
}

function orderByGold() {
  const orderedCharactersData = [...charactersData];
  orderedCharactersData.sort((a, b) => b.gold - a.gold);
  renderTable(orderedCharactersData);
}

function filterByHobbits() {
  const filteredCharactersData = charactersData.filter((character) => {
    return character.race === 'Hobbit';
  });
  renderTable(filteredCharactersData);
}

function renderFetchError(errorText) {
  if (document.getElementById('alert--fetchError')) {
    document.getElementById('alert--fetchError').remove();
  }

  const alertComponent = document.createElement('div');
  alertComponent.setAttribute('id', 'alert--fetchError');
  alertComponent.className = 'alert alert--error';
  alertComponent.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
    <span>${errorText}</span>
  `;
  characterTable.after(alertComponent);
}

// Init app - Populate data and render table
function init() {
  charactersData.push({ name: 'Smaug', race: 'Dragon', gold: 1000 }); // Add Dragon and fetch the rest from api
  for (let i = 0; i < 3; i++) {
    addRandomCharacter();
  }
}
init();
