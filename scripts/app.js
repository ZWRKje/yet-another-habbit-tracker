'use strict';

let habits = [];
const HABIT_KEY = 'HABIT_KEY';

/* page */
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    habitName: document.querySelector('.habit_name'),
    progressPresent: document.querySelector('.progress_percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
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

/* render */
function rerenderMenu(activeHabit) {
  if (!activeHabit) {
    return;
  }
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
  if (!activeHabit) {
    return;
  }
  page.header.habitName.innerText = activeHabit.name;
  const progressRatio = activeHabit.days.length / activeHabit.target;
  const progress = progressRatio > 1 ? 100 : progressRatio * 100;
  page.header.progressPresent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerender(activeHabitId) {
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  rerenderMenu(activeHabit);
  renderHead(activeHabit);
}

/* init */
(() => {
  loadData();
  rerender(habits[0].id);
})();
