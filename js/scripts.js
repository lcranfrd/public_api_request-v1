"use strict";
/*No matter what I try, I can only get a returned Promise object */
const states = async (state) => {
  return await import("./states.js")
  .finally((module) => module)
  .then((obj) => obj.twoLetterStates)
  .then((states) => states[state])

}
console.log(states('Idaho'))


/************************************************ */
// let ab = getStateAbbr('Idaho').then((response)=>response.Idaho);
// console.log(ab)
const employeesUrl = 'https://randomuser.me/api/?results=12&nat=us';
const searchDiv = document.querySelector('.search-container');
const galleryDiv = document.querySelector('#gallery');
const modalContainerDiv = document.createElement('div');
let liveIds = [];
let employeeHtml = '';

/**------------------------------------------------------------------------
 * *                          Program Entry
 *   Fetch data, sort data, create LiveIds, call functions to print
 *   employees to screen, create the html outline for the modal element,
 *   add the search bar to screen
 *------------------------------------------------------------------------**/
getApi(employeesUrl)
.then((data) => {
    galleryDiv.innerHTML = '';
    data.sort((a,b) => {
      let aLow = a.name.last.toLowerCase(),
      bLow = b.name.last.toLowerCase();
      return (aLow < bLow) && -1 || (aLow > bLow) && 1 || 0;
    });
// console.log(data)
    data.forEach((v) => liveIds.push(v.login.uuid));
    makeEmployees(data);
    createModalBones(data);
    addSearch(data, liveIds);
  })
  .catch((e) => console.error(`Error of ${e}`));

/**========================================================================
 **                           FUNCTION getApi
 *?  Try/Catch function for loading fetch operation
 *@param url string for url   
 *@return jason object
 *========================================================================**/
async function getApi(url) {
  galleryDiv.innerHTML = `<h2>Loading Employees</h2>`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    throw galleryDiv.innerHTML = `<h2>Something Unpleasant Happened: ${error}</h2>`;
  }
}

/**========================================================================
 **                           FUNCTION makeEmployees
 *?  Cycle through data and output Employees data to screen, create click
 *?  EventListener to open modal. 
 *@param data Object   
 *@return null
 *========================================================================**/
function makeEmployees(data) {
  data.filter((v1) => liveIds.includes(v1.login.uuid))
    .forEach((v) => {
      const employeeHtml = `
        <div id="${v.login.uuid}" class="animate__animated animate__fadeInDownBig card">
        <div class="card-img-container">
            <img class="card-img" src="${v.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${v.name.first} ${v.name.last}</h3>
            <p class="card-text">${v.email}</p>
            <p class="card-text cap">${v.location.city}</p>
        </div>
      </div>
      `;
      galleryDiv.insertAdjacentHTML('beforeend', employeeHtml);
    });

  galleryDiv.addEventListener('click', (e) => {
    (e.target.className !== 'gallery') && makeModal(e, data);
  });
}

/**========================================================================
 **                           FUNCTION createModalBones
 *?  Create the outer HTML for the modal. Sets animation and background
 *?  classes. Creates 3 eventListeners for buttons in modal. Contains
 *?  3 helper functions for modal close animation.
 *@param data Object  
 *@return type
 *========================================================================**/
function createModalBones(data) {
  modalContainerDiv.className = 'modal-container';
  const modalHtml = `
  <div class="modal modal-non-filtered animate__animated animate__fadeInLeft">
    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
    <div class="modal-info-container">

    </div>
  </div>
    <div class="modal-btn-container  modal-non-filtered animate__animated animate__fadeInRight">
      <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
      <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
  </div>
  `;
  modalContainerDiv.innerHTML = modalHtml;
  modalContainerDiv.style.display  = 'none';
  galleryDiv.insertAdjacentElement('afterend', modalContainerDiv);
  
  /**========================================================================
   **                           FUNCTION slideOut
   *?  Function called by modal-close-btn eventListener. 'modalBtnContainerDiv'
   *?  and 'modalDiv' are animated opposite left/right of each other.
   *@return null
   *========================================================================**/
  async function slideOut() {
    const modalDiv = document.querySelector('.animate__fadeInLeft');
    const modalBtnContainerDiv = document.querySelector('.animate__fadeInRight');
    let fadeOut = new Promise ((resolve) => {
      doFade();
      setTimeout(() => resolve(true),1500);
    });

/**========================================================================
 **                           FUNCTION fadeOut
 *?  Reset classes after animation for opening animation.
 *?  End result of animation is display:none.
 *@return null
 *========================================================================**/
  await fadeOut
    .then(() => {
      modalContainerDiv.style.display = 'none';
      modalContainerDiv.classList.remove('modal-out');
      modalDiv.classList.remove('animate__fadeOutLeft');
      modalBtnContainerDiv.classList.remove('animate__fadeOutRight');
      modalDiv.classList.add('animate__fadeInLeft');
      modalBtnContainerDiv.classList.add('animate__fadeInRight');
    })

/**========================================================================
 **                           FUNCTION doFade
 *?  Initiate animation by changing classNames to the animation names.
 *@return null
 *========================================================================**/
  function doFade() {
    modalContainerDiv.classList.add('modal-out');
    modalDiv.classList.remove('animate__fadeInLeft');
    modalBtnContainerDiv.classList.remove('animate__fadeInRight');
    modalDiv.classList.add('animate__fadeOutLeft');
    modalBtnContainerDiv.classList.add('animate__fadeOutRight');
  }
 }

/*  EventListeners for close, previous and next buttons in Modal  */
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

/**========================================================================
 **                       FUNCTION getModalEmployee
 *?  Get single Employee object matching currentLiveId which is derived
 *?  clicked element. Modal advance buttons are disabled/enabled according
 *?  to the Employee displayed in the liveIds queue.
 *@param e event Object  
 *@param data JSON Object
 *@param currentLiveId string  
 *@return null
 *========================================================================**/
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

/**========================================================================
 **                           FUNCTION getDataId
 *?  Matches employeeLiveId with employee Id contained in the data objects
 *?  and returns the index.
 *@param data JASON Object  
 *@param employeeLiveId string  
 *@return integer
 *========================================================================**/
function getDataId(data, employeeLiveId) {
  return data.indexOf(data.find((v) => v.login.uuid.includes(employeeLiveId)));
}

/**========================================================================
 **                           FUNCTION getLiveIdsId
 *?  Matches currentUuid with liveIds array and returns the index.
 *@param currentUuid string  
 *@return integer
 *========================================================================**/
function getLiveIdsId(currentUuid) {
  return liveIds.indexOf(liveIds.find((v) => v === currentUuid));
}

/**========================================================================
 **                           FUNCTION makeModal
 *?  Starts the business of making the Modal. Gets employee id from clicked
 *?  element, sets the pointers to the data object. Sets classes for 
 *?  background change if is created from a subset via search results.
 *@param e event object  
 *@param data JSON object  
 *@return null
 *========================================================================**/
function makeModal(e, data) {
  const currentUuid = e.target.closest('.card').id;
  const currentLiveIndx = getLiveIdsId(currentUuid);
  const employee = data.find((v) => currentUuid.includes(v.login.uuid));
  const modalDiv = document.querySelector('.modal');
  const modalBtnContainerDiv = document.querySelector('.modal-btn-container');
  if(liveIds.length === data.length) {
    modalDiv.classList.remove('modal-filtered');
    modalBtnContainerDiv.classList.remove('modal-filtered');
  } else {
    modalDiv.classList.add('modal-filtered');
    modalBtnContainerDiv.classList.add('modal-filtered');
  }
  modalHtml(employee, currentLiveIndx);
}

/*  2 Helper functions to extract, format and return date and cellphone */
const makeDateStr = (date) => {
  const reg = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return `${reg[2]}/${reg[3]}/${reg[1]}`;

}
const makePhoneStr = (cell) => cell.replace(/\)-/, ') ');
/* *** */

/**========================================================================
 **                           FUNCTION modalHtml
 *?  Continue with the business of making Modal. Output the Employee info and
 *?  disable/enable prev and next button in accordance to begin and end of
 *?  Employees in liveIds
 *@param employee JASON object 
 *@param currentLiveIndx integer
 *@return null
 *========================================================================**/
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
    <p class="modal-text">${employee.location.street.number} ${employee.location.street.name}, ${employee.location.city}, ${twoLetterStates[employee.location.state]} ${employee.location.postcode}</p>
    <p class="modal-text">Birthday: ${makeDateStr(employee.dob.date)}</p>`;
  
  document.querySelector('#modal-prev').disabled = (currentLiveIndx === 0)
    ? true
    : false;
  document.querySelector('#modal-next').disabled = (currentLiveIndx === liveIds.length-1)
    ? true
    : false;
  modalInfoContainerDiv.insertAdjacentHTML('beforeend', modalHtml);
  modalContainerDiv.style.display = 'block';
}

/**========================================================================
 **                 FUNCTION clearGalleryDivMakeLiveIds
 *?  Helper function that resets the gallery and liveIds with data taken
 *?  from filteredData then calls makeEmployees().
 *@param data JASON object  
 *@param filteredData JASON object
 *@return null
 *========================================================================**/
function clearGalleryDivMakeLiveIds(data, filteredData) {
  galleryDiv.innerHTML = '';
  liveIds = [];
  (filteredData.length === 0)
    ? data.forEach((v) => liveIds.push(v.login.uuid))
    : filteredData.forEach((v) => liveIds.push(v.login.uuid));
  makeEmployees(data);
}

/**========================================================================
 **                           FUNCTION addSearch
 *?  Adds the html for the search bar and all of its functionality.
 *@param data JASON object  
 *@return null
 *========================================================================**/
function addSearch(data) {
  const searchHtml = `
  <form action="#" method="get">
    <input type="search" id="search-input" class="search-input" placeholder="Search...">
    <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
  </form>
  `;
  searchDiv.insertAdjacentHTML('beforeend', searchHtml);

  /**========================================================================
   **                           FUNCTION execSearch
   *?  Executes the search called by eventListener. Data found is passed via
   *?  calling clearGalleryDivMakeLiveIds().
   *@param e Event object  
   *@param data JASON object  
   *@return null
   *========================================================================**/
  function execSearch(e, data) {
    e.preventDefault();
    const searchStr = document.querySelector('#search-input').value;
    let filteredData = [];
    if(searchStr.length > 0) {
      filteredData = data.filter((v) => 
        `${v.name.first} ${v.name.last}`.toLowerCase().includes(searchStr.toLowerCase())
      );
    }
    if(filteredData.length > 0) {
      clearGalleryDivMakeLiveIds(data, filteredData);
    } else if(searchStr.length === 0) {
        clearGalleryDivMakeLiveIds(data, filteredData);
      } else{
          galleryDiv.innerHTML = '';
          galleryDiv.insertAdjacentHTML('beforeend', `
          <h1 class="no-results">No Search Results Found</h1>`);
        }
  } 

  document.querySelector('#search-input').addEventListener('input', (e) => {
    execSearch(e, data)
  });
  document.querySelector('form').addEventListener('submit', (e) => {
    execSearch(e, data)
  });
}

/* twoLetterStates obj used to convert full state to 2 letter abbreviation */
const twoLetterStates = {
  'Arizona': 'AZ',
  'Alabama': 'AL',
  'Alaska':'AK',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'}