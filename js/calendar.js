// ===========================
// calendar.js 完全版
// ===========================

// ---------------------------
// 要素取得
// ---------------------------
const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const eventList = document.getElementById("eventList");

const expBar = document.getElementById("expBar");
const levelDisplay = document.getElementById("level");

const addTaskBtn = document.getElementById("addTaskCalendarBtn");
const taskModal = document.getElementById("taskModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

const taskNameInput = document.getElementById("taskName");
const taskDateInput = document.getElementById("taskDate");
const taskHourInput = document.getElementById("taskHour");
const taskMinuteInput = document.getElementById("taskMinute");
const taskPrioritySelect = document.getElementById("taskPriority");

// ---------------------------
// quests 読み込み
// ---------------------------
let quests = JSON.parse(localStorage.getItem("quests")) || [];

// Date型に戻す（hour, minute も保持）
quests = quests.map(q => {
  if (!q.deadline) return { ...q, deadline: null };
  let d = q.deadline;

  if (d instanceof Date) return q;

  if (typeof d === "string") {
    d = d.replace(/\//g, "-");
    const parts = d.split("-");
    if (parts.length >= 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const hour = q.hour || 0;
      const minute = q.minute || 0;
      return { ...q, deadline: new Date(year, month, day, hour, minute) };
    }
  }

  return { ...q, deadline: null };
});

let current = new Date();

// ---------------------------
// 初期描画
// ---------------------------
updateMiniInfo();
updateLevelBar();
renderCalendar();

// ===========================
// カレンダー描画
// ===========================
function renderCalendar() {
  const year = current.getFullYear();
  const month = current.getMonth();

  monthYear.textContent = `${year}年 ${month + 1}月`;
  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 日ごとにタスクまとめ
  const dailyEvents = {};
  quests.forEach(q => {
    if (!q.deadline) return;
    const d = q.deadline;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (!dailyEvents[key]) dailyEvents[key] = [];
    dailyEvents[key].push({
      name: q.name,
      priority: q.priority,
      hour: d.getHours(),
      minute: d.getMinutes()
    });
  });

  // 空白セル
  for (let i=0;i<firstDay;i++){
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  // 日付セル
  for(let day=1; day<=lastDate; day++){
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");
    cell.textContent = day;

    const today = new Date();
    if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()){
      cell.classList.add("today");
    }

    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    if(dailyEvents[key]){
      cell.classList.add("has-event");

      const priorities = dailyEvents[key].map(ev=>ev.priority);
      if(priorities.includes("high")) cell.classList.add("priority-high");
      else if(priorities.includes("medium")) cell.classList.add("priority-medium");
      else cell.classList.add("priority-low");
    }

    cell.addEventListener("click", ()=> showSchedule(key, dailyEvents[key]));
    calendarGrid.appendChild(cell);
  }
}

// ===========================
// 月移動
// ===========================
prevMonth.addEventListener("click", ()=>{
  current.setMonth(current.getMonth()-1);
  renderCalendar();
});
nextMonth.addEventListener("click", ()=>{
  current.setMonth(current.getMonth()+1);
  renderCalendar();
});

// ===========================
// ミニ情報
// ===========================
function updateMiniInfo(){
  const miniHeroIcon = document.getElementById("miniHeroIcon");
  const playerNameEl = document.getElementById("playerName");
  const savedPlayer = JSON.parse(localStorage.getItem("playerData"))||{};
  if(miniHeroIcon && savedPlayer.image) miniHeroIcon.src = savedPlayer.image;
  if(playerNameEl && savedPlayer.name) playerNameEl.textContent = savedPlayer.name;
}

// ===========================
// レベルバー
// ===========================
function updateLevelBar(){
  const level = localStorage.getItem("level")||1;
  const exp = localStorage.getItem("exp")||0;
  levelDisplay.textContent = level;
  expBar.style.width = `${exp}%`;
}

// ===========================
// 予定表示
// ===========================
function showSchedule(dateKey, events){
  if(!events || events.length===0){
    eventList.innerHTML = `<h3>${dateKey}</h3><p>予定はありません</p>`;
    return;
  }
  const items = events.map(ev=>{
    const hh = String(ev.hour).padStart(2,"0");
    const mm = String(ev.minute).padStart(2,"0");
    return `<li>[${hh}:${mm}] ${ev.name}</li>`;
  }).join("");
  eventList.innerHTML = `<h3>${dateKey} の予定</h3><ul>${items}</ul>`;
}

// ===========================
// モーダル・タスク追加
// ===========================
addTaskBtn.addEventListener("click", ()=>{
  taskModal.style.display = "block";
});

cancelTaskBtn.addEventListener("click", ()=>{
  taskModal.style.display = "none";
});

saveTaskBtn.addEventListener("click", ()=>{
  const name = taskNameInput.value.trim();
  const dateVal = taskDateInput.value;
  const hour = parseInt(taskHourInput.value)||0;
  const minute = parseInt(taskMinuteInput.value)||0;
  const priority = taskPrioritySelect.value;

  if(!name || !dateVal){
    alert("タスク名と日付を入力してください");
    return;
  }

  const deadline = new Date(dateVal);
  deadline.setHours(hour, minute);

  quests.push({name, deadline, hour, minute, priority});
  localStorage.setItem("quests", JSON.stringify(quests));

  taskModal.style.display = "none";

  renderCalendar();
});
