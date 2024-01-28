const input = document.querySelector('.search-input__text');
const repositoriesList = document.querySelector('.repositories__list');
const searchList = document.querySelector('.search-list');

let debounceTimer;
let selectList;

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

async function fetchData(value) {
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${value}`);
    const data = await res.json();
    return data.items.slice(0, 5).map(({ name, owner: { login }, stargazers_count }) => ({
      name,
      login,
      stargazers_count
    }));
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data');
  }
}

function clearAutocompleteList() {
  if (selectList) {
    selectList.remove();
    selectList = null;
  }
}

function createAutocompleteList(repositories) {
  const fragment = document.createDocumentFragment();

  repositories.forEach(({ name }, index) => {
    const li = document.createElement('li');
    li.classList.add('select-list__item');
    li.setAttribute('data-count', index);
    li.textContent = name;
    fragment.append(li);
  });

  searchList.innerHTML = '';
  const newUl = document.createElement('ul');
  newUl.classList.add('select-list');
  newUl.addEventListener('click', (e) => handleSelect(repositories[e.target.getAttribute('data-count')]));
  newUl.appendChild(fragment);
  searchList.appendChild(newUl);
  selectList = newUl;
}

function handleSelect(el) {
    addRepository(el); 
    clearAutocompleteList();
    input.value = ''; 
  }

function addRepository({ name, login, stargazers_count }) {
  const li = document.createElement('li');
  li.classList.add('repositories__item');
  li.insertAdjacentHTML('beforeend',
  `
    <li>Name: ${name}</li>
    <li>Owner: ${login}</li>
    <li>Stars: ${stargazers_count}</li>
    <button class="cancel"></button>
  `
  );
  repositoriesList.append(li);
}

repositoriesList.addEventListener('click', function(event) {
  if (event.target.classList.contains('cancel')) {
    event.target.closest('.repositories__item').remove();
  }
});

input.addEventListener('input', debounce(async function(event) {
  const value = event.target.value.trim();
  clearAutocompleteList();

  if (!value) {
    return;
  }

  try {
    const repositories = await fetchData(value);
    createAutocompleteList(repositories);
  } catch (error) {
    console.error('Error:', error);
  }
}, 400));