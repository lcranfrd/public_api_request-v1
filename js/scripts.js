"use strict";

const employeesUrl = 'https://randomuser.me/api/?results=12&nat=us';
const searchDiv = document.querySelector('.search-container');
const employeesDiv = document.querySelector('#gallery');
const modalContainerDiv = document.createElement('div');
let liveIds = [];
let employeeHtml = '';

async function getApi(url) {
  employeesDiv.innerHTML = `<h2>Loading Employees</h2>`;
  try{
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    throw employeesDiv.innerHTML = `<h2>Something Unpleasant Happened: ${error}</h2>`;
  }
}

async function getUsers(url) {
  const data = await getApi(url);
  return data.results;
}

getUsers(employeesUrl)
.then((data) => {
    employeesDiv.innerHTML = '';
    data.sort((a,b) => {
      let aLow = a.name.last.toLowerCase(),
      bLow = b.name.last.toLowerCase();
      return (aLow < bLow) && -1 || (aLow > bLow) && 1 || 0;
    });

    data.forEach((v) => liveIds.push(v.login.uuid));
    makeEmployees(data);
    createModalBones(data);
    addSearch(data, liveIds);
  })
  .catch((e) => console.error(`Error of ${e}`));

function makeEmployees(data) {
  data.filter((v1) => liveIds.includes(v1.login.uuid))
    .forEach((v) => {
      const employeeHtml = `
        <div id="${v.login.uuid}" class="animate__animated animate__zoomInRight card">
        <div class="card-img-container">
            <img class="card-img" src="${v.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${v.name.first} ${v.name.last}</h3>
            <p class="card-text">${v.email}</p>
            <p class="card-text cap">${v.location.city}, ${v.location.state}</p>
        </div>
      </div>
      `;
      employeesDiv.insertAdjacentHTML('beforeend', employeeHtml);
    });

  employeesDiv.addEventListener('click', (e) => {
    (e.target.className !== 'gallery') && makeModal(e, data);
  });
}


function createModalBones(data) {
  modalContainerDiv.className = 'modal-container';
  const modalHtml = `
  <div class="modal animate__animated animate__fadeInLeft">
    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
    <div class="modal-info-container">

    </div>
  </div>
    <div class="modal-btn-container  animate__animated animate__fadeInRight">
      <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
      <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
  </div>
  `;
  modalContainerDiv.innerHTML = modalHtml;
  modalContainerDiv.style.display  = 'none';
  employeesDiv.insertAdjacentElement('afterend', modalContainerDiv);
  
  async function slideOut() {
    const modalDiv = document.querySelector('.animate__fadeInLeft');
    const modalBtnContainerDiv = document.querySelector('.animate__fadeInRight');
    let fadeOut = new Promise ((resolve,reject) => {
      doFade();
      setTimeout(() => resolve(true),500);
    });

  await fadeOut
    .then(() => {
      modalContainerDiv.style.display = 'none';
      modalDiv.classList.remove('animate__fadeOutLeft');
      modalBtnContainerDiv.classList.remove('animate__fadeOutRight');
      modalDiv.classList.add('animate__fadeInLeft');
      modalBtnContainerDiv.classList.add('animate__fadeInRight');
    })

  function doFade() {
    modalDiv.classList.remove('animate__fadeInLeft');
    modalBtnContainerDiv.classList.remove('animate__fadeInRight');
    modalDiv.classList.add('animate__fadeOutLeft');
    modalBtnContainerDiv.classList.add('animate__fadeOutRight');
  }
 }

  document.querySelector('#modal-close-btn').addEventListener('click', slideOut);
  
  document.querySelector('#modal-next').addEventListener('click', (e) => {
    const currentLiveId = document.querySelector('.modal-info-container').id;
    getModalEmployee(e, data, currentLiveId);
  });
  
  document.querySelector('#modal-prev').addEventListener('click', (e) => {
    const currentLiveId = document.querySelector('.modal-info-container').id;
    getModalEmployee(e, data, currentLiveId);
  });
}

function getModalEmployee(e, data, currentLiveId) {
  const btn = e.target;
  let currentLiveIndx = liveIds.indexOf(currentLiveId);
  if(btn.id === 'modal-prev') {
    document.querySelector('#modal-next').disabled = false;
    (!btn.disabled) && modalHtml(data[getDataId(data, liveIds[--currentLiveIndx])]);
    (currentLiveIndx === 0) && (btn.disabled = true);
  }
  if(btn.id === 'modal-next') {
    document.querySelector('#modal-prev').disabled = false;
    (!btn.disabled) && modalHtml(data[getDataId(data, liveIds[++currentLiveIndx])]);
    (currentLiveIndx === liveIds.length -1) && (btn.disabled = true);
  }
}

function getDataId(data, employeeLiveId) {
  return data.indexOf(data.find((v) => v.login.uuid.includes(employeeLiveId)));
}

function getLiveIdsId(currentUuid) {
  return liveIds.indexOf(liveIds.find((v) => v === currentUuid));
}

function makeModal(e, data) {
  const currentUuid = e.target.closest('.card').id;
  const currentLiveIndx = getLiveIdsId(currentUuid);
  const employee = data.find((v) => currentUuid.includes(v.login.uuid));
  modalHtml(employee, currentLiveIndx);
}
const makeDateStr = (date) => {
  const reg = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return `${reg[2]}/${reg[3]}/${reg[1]}`;
}

const makePhoneStr = (cell) => cell.replace(/\)-/, ') ');

function modalHtml(employee, currentLiveIndx) {
  const modalInfoContainerDiv = document.querySelector('.modal-info-container');
    modalInfoContainerDiv.id = employee.login.uuid;
    modalInfoContainerDiv.innerHTML = '';
  const modalHtml = `
    <img class="modal-img" src="${employee.picture.large}" alt="profile picture">
    <h3 id="name" class="modal-name cap">${employee.name.first} ${employee.name.last}</h3>
    <p class="modal-text">${employee.email}</p>
    <p class="modal-text cap">${employee.location.city}</p>
    <hr>
    <p class="modal-text">${makePhoneStr(employee.cell)}</p>
    <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${employee.location.state} ${employee.location.postcode}</p>
    <p class="modal-text">Birthday: ${makeDateStr(employee.dob.date)}</p>
  `;
  
  document.querySelector('#modal-prev').disabled = (currentLiveIndx === 0)
    ? true
    : false;
  document.querySelector('#modal-next').disabled = (currentLiveIndx === liveIds.length-1)
    ? true
    : false;
  modalInfoContainerDiv.insertAdjacentHTML('beforeend', modalHtml);
  modalContainerDiv.style.display = 'block';
}

function clearEmployeesDivMakeLiveIds(data, filteredData) {
  employeesDiv.innerHTML = '';
  liveIds = [];
  (filteredData.length === 0)
    ? data.forEach((v) => liveIds.push(v.login.uuid))
    : filteredData.forEach((v) => liveIds.push(v.login.uuid));
  makeEmployees(data);
}

function addSearch(data) {
  const searchHtml = `
  <form action="#" method="get">
    <input type="search" id="search-input" class="search-input" placeholder="Search...">
    <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
  </form>
  `;
  searchDiv.insertAdjacentHTML('beforeend', searchHtml);

  function execSearch(e, data) {
    e.preventDefault();
    const search = document.querySelector('#search-input').value;
    let filteredData = [];
    if(search.length > 0) {
      filteredData = data.filter((v) => 
        `${v.name.first} ${v.name.last}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    if(filteredData.length > 0) {
      clearEmployeesDivMakeLiveIds(data, filteredData);
    } else if(search.length === 0) {
        clearEmployeesDivMakeLiveIds(data, filteredData);
      } else{
          employeesDiv.innerHTML = '';
          employeesDiv.insertAdjacentHTML('beforeend', `
          <h1 class="no-results">No Search Results Found</h1>`);
        }
    // search.length === 0 && clearEmployeesDivMakeLiveIds(data, liveIds, filteredData);
  } 

  document.querySelector('#search-input').addEventListener('keyup', (e) => {
    execSearch(e, data)
  });
  document.querySelector('form').addEventListener('submit', (e) => {
    execSearch(e, data)
  });
}