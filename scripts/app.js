'use strict';

let habits = [];
const HABIT_KEY = 'HABIT_KEY';
let globalActiveHabitId;

/* page */
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    habitName: document.querySelector('.habit_name'),
    progressPresent: document.querySelector('.progress_percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habit__day'),
  },
  popup: {
    index: document.getElementById('add-habit-popup'),
  },
};

/* utils */
function loadData() {
  const habitString = localStorage.getItem(HABIT_KEY);
  const habitArray = JSON.parse(habitString);
  if (Array.isArray(habitArray)) {
    habits = habitArray;
  }
}

function saveData() {
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

function togglePopup() {
  const cover = page.popup.index.classList;
  if (cover.contains('cover_hidden')) {
    cover.remove('cover_hidden');
  } else {
    cover.add('cover_hidden');
  }
}

/* render */
function rerenderMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
    if (!existed) {
      const elem = document.createElement('button');
      elem.setAttribute('menu-habit-id', habit.id);
      elem.classList.add('menu__item');
      elem.addEventListener('click', rerender.bind(null, habit.id));
      elem.innerHTML = `<img src="./images/${habit.icon}.svg" alt="${habit.name}">`;
      if (activeHabit.id === habit.id) {
        elem.classList.add('menu__item__active');
      }
      page.menu.appendChild(elem);
      continue;
    }
    if (activeHabit.id === habit.id) {
      existed.classList.add('menu__item__active');
    } else {
      existed.classList.remove('menu__item__active');
    }
  }
}

function renderHead(activeHabit) {
  page.header.habitName.innerText = activeHabit.name;
  const progressRatio = activeHabit.days.length / activeHabit.target;
  const progress = progressRatio > 1 ? 100 : progressRatio * 100;
  page.header.progressPresent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabit) {
  page.content.daysContainer.innerHTML = '';
  activeHabit.days.forEach((day, i) => {
    const habit = document.createElement('div');
    habit.classList.add('habit');
    habit.innerHTML = ` <div class="habit__day">День ${i + 1}</div>
    <div class="habit__comment">${day.comment}</div>
    <button class="habit__delete">
        <img src="./images/delete.svg" alt="Удалить день ${
          i + 1
        }" onClick="deleteDay(${i})">
    </button>`;
    page.content.daysContainer.appendChild(habit);
  });

  if (activeHabit.days.length < activeHabit.target) {
    page.content.nextDay.innerHTML = `День ${activeHabit.days.length + 1}`;
  }
}

function rerender(activeHabitId) {
  globalActiveHabitId = activeHabitId;
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  if (!activeHabit) {
    return;
  }
  rerenderMenu(activeHabit);
  renderHead(activeHabit);
  rerenderContent(activeHabit);
}

/* work with days */
function addDays(event) {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);
  const comment = data.get('comment');
  form['comment'].classList.remove('error');
  if (!comment) {
    form['comment'].classList.add('error');
    return;
  }
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([{ comment }]),
      };
    }
    return habit;
  });
  saveData();
  rerender(globalActiveHabitId);
  form['comment'].value = '';
}

function deleteDay(dayId) {
  habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      habit.days.splice(dayId, 1);
    }
    return habit;
  });
  saveData();
  rerender(globalActiveHabitId);
}

/* init */
(() => {
  loadData();
  rerender(habits[0].id);
})();
