"use strict";

const randomEmployeeUrl = 'https://randomuser.me/api/?results=12&nat=us,gb,fr,au,de&seed=bucky';
const searchDiv = document.querySelector('.search-container');
const employeesDiv = document.querySelector('#gallery');
const modalContainerDiv = document.createElement('div');
let liveIds = [];
let employeeHtml = '';

async function getApi(url) {
  try{
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function getUsers(url) {
  const data = await getApi(url);
  return data.results;
}

getUsers(randomEmployeeUrl)
  .then((data) => {
    data.sort((a,b) => {
      let aLow = a.name.last.toLowerCase(),
      bLow = b.name.last.toLowerCase();
      return (aLow < bLow) && -1 || (aLow > bLow) && 1 || 0;
    });
    data.forEach((v) => liveIds.push(v.login.uuid));
    // console.log(`first ${liveIds.length}`)
    makeEmployees(data,liveIds);
    createModalBones(data);
  })
  .catch((e) => console.error(`Error of ${e}`));

function makeEmployees(data, liveIds) {
  console.log(data);
  data.forEach((v) => {
    // liveIds.push(v.login.uuid);
    const employeeHtml = `
      <div id="${v.login.uuid}" class="card">
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
    (e.target.className !== 'gallery') && makeModal(e,data,liveIds);
  });
}

const searchHtml = `
<form action="#" method="get">
  <input type="search" id="search-input" class="search-input" placeholder="Search...">
  <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
</form>
`;
searchDiv.insertAdjacentHTML('beforeend', searchHtml);

function createModalBones(data) {
  modalContainerDiv.className = 'modal-container';
  const modalHtml = `
  <div class="modal">
    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
    <div class="modal-info-container">

    </div>
  </div>
    <div class="modal-btn-container">
      <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
      <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
  </div>
  `;
  modalContainerDiv.innerHTML = modalHtml;
  modalContainerDiv.style.display  = 'none';
  document.body.insertAdjacentElement('beforeend', modalContainerDiv);
  document.querySelector('#modal-close-btn')
    .addEventListener('click', () => modalContainerDiv.style.display = 'none');

  document.querySelector('#modal-next').addEventListener('click', () => {
    const currentLiveId = document.querySelector('.modal-info-container').id;
    getNextEmployee(data, liveIds, currentLiveId);
  });


  document.querySelector('#modal-prev').addEventListener('click', () => {
    const currentLiveId = document.querySelector('.modal-info-container').id;
    getPrevEmployee(data, liveIds, currentLiveId);
  });
}

function getNextEmployee(data, liveIds, currentLiveId) {
  const currentLiveIndx = liveIds.indexOf(currentLiveId);
  (currentLiveIndx <= data.length -1 && currentLiveIndx !== data.length -1) 
    && modalHtml(data[currentLiveIndx + 1])
}

function getPrevEmployee(data, liveIds, currentLiveId) {
  const currentLiveIndx = liveIds.indexOf(currentLiveId);
  (currentLiveIndx <= data.length -1 && currentLiveIndx !== 0)
    && modalHtml(data[currentLiveIndx - 1])
  // const currentEmployeeIndx = data.indexOf(data.find((v) => v.login.uuid ===currentLiveId));

}

function makeModalIds(data, liveIds) {
  if(liveIds.length !== 0) {
    return data.filter((v) => uuids.includes(v.login.uuid));
  }
}

function makeModal(e, data, liveIds) {
  const currentUuid = e.target.closest('.card').id;
  // const currentLiveId = liveIds.indexOf(currentUuid);
  const employee = data.find((v) => currentUuid.includes(v.login.uuid));
  // 23 Portland Ave., Portland, OR 97204
  modalHtml(employee);

}
  
function modalHtml(employee) {
  const modalInfoContainerDiv = document.querySelector('.modal-info-container');
  modalInfoContainerDiv.id = employee.login.uuid;
  modalInfoContainerDiv.innerHTML = '';
  const modalHtml = `
    <img class="modal-img" src="${employee.picture.large}" alt="profile picture">
    <h3 id="name" class="modal-name cap">${employee.name.first} ${employee.name.last}</h3>
    <p class="modal-text">${employee.email}</p>
    <p class="modal-text cap">${employee.location.city}</p>
    <hr>
    <p class="modal-text">${employee.phone}</p>
    <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${employee.location.state} ${employee.location.postcode}</p>
    <p class="modal-text">${employee.dob.date}</p>
  `;
  modalInfoContainerDiv.insertAdjacentHTML('beforeend', modalHtml);
  modalContainerDiv.style.display = 'block';
}