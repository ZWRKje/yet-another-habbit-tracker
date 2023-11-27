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
    iconField: document.querySelector('.popup__form input[name="icon"]'),
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

function validForm(event) {
  const form = event.target;
  let isValid = true;
  const data = new FormData(form);
  for (const child of form.children) {
    const name = child.getAttribute('name');
    if (name) {
      child.classList.remove('error');
      if (!data.get(`${name}`)) {
        child.classList.add('error');
        isValid = false;
      }
    }
  }
  return isValid;
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
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
  document.location.replace(document.location.pathname + '#' + activeHabitId);
  rerenderMenu(activeHabit);
  renderHead(activeHabit);
  rerenderContent(activeHabit);
}

/* work with days */
function addDays(event) {
  event.preventDefault();
  if (!validForm(event)) {
    return false;
  }
  const form = event.target;
  const data = new FormData(form);
  const comment = data.get('comment');
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
  resetForm(event.target, ['comment']);
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

/* work with habits add*/
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active');
}

function addHabit(event) {
  event.preventDefault();
  if (!validForm(event)) {
    return false;
  }
  const form = event.target;
  const data = new FormData(form);
  const name = data.get('name');
  const icon = data.get('icon');
  const target = data.get('target');
  const maxId = habits.reduce(
    (acc, habit) => (habit.id > acc ? habit.id : acc),
    0
  );
  habits.push({ id: maxId + 1, icon, name, target, days: [] });

  saveData();
  rerender(maxId + 1);
  resetForm(event.target, ['name', 'icon', 'target']);
  togglePopup();
}

/* init */
(() => {
  loadData();
  const hashId = +document.location.hash.replace('#', '');
  const urlHabit = habits.find((habit) => habit.id === hashId);
  if (urlHabit) {
    rerender(urlHabit.id);
  } else {
    rerender(habits[0].id);
  }
})();
