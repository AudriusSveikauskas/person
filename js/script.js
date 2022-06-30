"use strict";

const FORM = document.getElementById("person-form");
const INPUT = document.getElementById("person-input");

const GENDERIZE_API = "https://api.genderize.io?name=";
const NATIONALIZE_API = "https://api.nationalize.io?name=";
const AGIFY_API = "https://api.agify.io?name=";
const MODAL = document.getElementById("modal-text");
const SHOW_MODAL = document.querySelector(".modal-background");
const CLOSE_BTN = document.querySelector(".modal-close");
const LOADING_MSG = document.querySelector(".loader");

FORM.addEventListener("submit", (e) => {
  e.preventDefault();
  const personName = INPUT.value.replaceAll(" ", "");
  let personGender,
    personGenderProbability,
    personAge,
    personCountry,
    personCountryProbability = "";

  if (personName.length < 3) {
    alertMessage("Klaida! Minimalus vardo ilgis 3 simboliai...");
    return;
  }

  if (!charIsLetter(personName)) {
    alertMessage("Klaida! Varde neleistini simboliai...");
    return;
  }

  LOADING_MSG.style.display = "block";

  fetch(`${GENDERIZE_API}${personName}`)
    .then((resp) => resp.json())
    .then((person) => {
      personGender = person.gender;
      personGenderProbability = person.probability;
      console.log(person);

      fetch(`${NATIONALIZE_API}${personName}`)
        .then((resp) => resp.json())
        .then((nationality) => {
          if (nationality.country.length === 0) {
            personCountry = "";
            personCountryProbability = 0;
          } else {
            nationality.country.map((country) => {
              if (country.probability > personCountryProbability) {
                personCountryProbability = country.probability;
                personCountry = country.country_id;
              }
            });
          }
          console.log(nationality);

          fetch(`${AGIFY_API}${personName}`)
            .then((resp) => resp.json())
            .then((person) => {
              personAge = person.age;
              console.log(person);
              showModal(
                personName,
                personGender,
                personGenderProbability,
                personCountry,
                personCountryProbability,
                personAge
              );
            });
        });
    });
});

function charIsLetter(name) {
  const letter = /\p{Letter}/u;
  let isOnlyLetters = true;
  for (let i = 0; i < name.length; i++) {
    if (!letter.test(name[i])) {
      isOnlyLetters = false;
    }
  }
  return isOnlyLetters;
}

function alertMessage(msg) {
  console.log(msg);
}

function showModal(name, gender, genderProb, country, countryProb, age) {
  if (gender === null) {
    MODAL.innerHTML = `<p class="modal-text">Atsiprašome, bet neturime informacijos apie asmenį kurio vardas <span class="modal-text-large">${
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }</span>.`;
  } else if (country !== "") {
    MODAL.innerHTML = `<p class="modal-text">Asmuo, kurio vardas <span class="modal-text-large">${
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }</span>, su <span class="modal-text-large">${Math.round(
      genderProb * 100
    )}%</span> tikimybe yra <span class="modal-text-large">${
      gender === "male" ? "vyriškos giminės" : "moteriškos giminės"
    }</span>. Didžiausia tikimybė, <span class="modal-text-large">${Math.round(
      countryProb * 100
    )}%</span>, kad asmuo yra <img src="https://countryflagsapi.com/png/${country}" class="modal-img"> ${
      gender === "male" ? "pilietis" : "pilietė"
    }, o tikėtinas amžius yra <span class="modal-text-large">${age}m</span>.</p>`;
  } else {
    MODAL.innerHTML = `<p class="modal-text">Asmuo, kurio vardas <span class="modal-text-large">${name}</span>, su <span class="modal-text-large">${Math.round(
      genderProb * 100
    )}%</span> tikimybe yra <span class="modal-text-large">${
      gender === "male" ? "vyriškos giminės" : "moteriškos giminės"
    }</span>. Tikėtinas asmens amžius yra <span class="modal-text-large">${age}m</span>.</p>`;
  }
  LOADING_MSG.style.display = "none";
  SHOW_MODAL.style.display = "block";
}

CLOSE_BTN.addEventListener("click", () => {
  INPUT.textContent = "";
  SHOW_MODAL.style.display = "none";
});
