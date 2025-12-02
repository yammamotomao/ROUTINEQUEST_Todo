// ログインユーザー確認
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  alert('ログインしてください');
  location.href = 'login.html';
} else {
  // ユーザー情報を読み込む
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const userData = users[currentUser];

  // UIに反映
  document.getElementById('playerName').textContent = currentUser;
  document.getElementById('miniHeroIcon').src = `images/${userData.hero}.png`;
  // レベルや経験値も必要なら userData から取得
}

// 保存キーをユーザー名ごとに
const taskKey = `tasks_${currentUser}`;
let tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

// js/index.js - タスク管理 + 報酬同期（完全版）

// =======================
// 要素取得（インデックス用）
// =======================
const questList = document.getElementById("questList");
const addQuestBtn = document.getElementById("addQuestBtn");
const expBar = document.getElementById("expBar");
const levelDisplay = document.getElementById("level");
const modal = document.getElementById("taskModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const taskNameInput = document.getElementById("taskName");
const taskDateInput = document.getElementById("taskDate");
const taskHourInput = document.getElementById("taskHour");
const taskMinuteInput = document.getElementById("taskMinute");
const taskPriorityInput = document.getElementById("taskPriority");
const miniHeroIcon = document.getElementById("miniHeroIcon");
const playerNameEl = document.getElementById("playerName");

// =======================
// データロード
// =======================
let quests = JSON.parse(localStorage.getItem("quests")) || [];
let level = parseInt(localStorage.getItem("level")) || 1;
let exp = parseInt(localStorage.getItem("exp")) || 0;

// Date型に復元
quests = quests.map(q => ({ ...q, deadline: q.deadline ? new Date(q.deadline) : null }));

// =======================
// 初期描画
// =======================
updateMiniInfo();
updateLevelBar();
sortAndRenderQuests(); // 初期ロード時にもソートして描画
syncCompletedTasksToBattle(); // 初期同期（バトル画面用）

// =======================
// モーダル制御
// =======================
if (addQuestBtn) addQuestBtn.addEventListener("click", () => { if(modal) modal.style.display = "flex"; });
if (cancelTaskBtn) cancelTaskBtn.addEventListener("click", () => { if(modal) modal.style.display = "none"; });
window.addEventListener("click", e => { if(e.target === modal) modal.style.display="none"; });

// =======================
// タスク保存
// =======================
if(saveTaskBtn){
  saveTaskBtn.addEventListener("click", () => {
    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const hour = parseInt(taskHourInput.value) || 0;
    const minute = parseInt(taskMinuteInput.value) || 0;
    const priority = taskPriorityInput.value || "medium";

    if(!name) return alert("タスク名を入力してください！");
    if(!date) return alert("期限日を入力してください！");

    const deadline = new Date(date);
    deadline.setHours(hour, minute, 0, 0);

    quests.push({ name, deadline, priority, done:false });

    // 入力リセット
    taskNameInput.value = "";
    taskDateInput.value = "";
    taskHourInput.value = "";
    taskMinuteInput.value = "";
    taskPriorityInput.value = "medium";

    if(modal) modal.style.display = "none";

    saveData();
    sortAndRenderQuests(); // 保存後にソートして描画
    updateLevelBar();
    syncCompletedTasksToBattle(); // 保存後に念のため同期
  });
}

// =======================
// タスクソート関数
// =======================
function sortQuests() {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    quests.sort((a, b) => {
        // 1. 達成済み(done: true)を後回しにする
        if (a.done !== b.done) {
            return a.done ? 1 : -1;
        }

        // 2. 優先度でソート (高→中→低)
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        // 3. 期限日でソート (早い順)
        if (a.deadline && b.deadline) {
            return a.deadline.getTime() - b.deadline.getTime();
        } else if (a.deadline) {
            return -1;
        } else if (b.deadline) {
            return 1;
        }
        return 0;
    });
}

// ソート＋描画
function sortAndRenderQuests() {
    sortQuests();
    renderQuests();
}

// =======================
// タスク描画
// =======================
function renderQuests(){
  const questListEl = document.getElementById("questList");
  if(!questListEl) return;
  questListEl.innerHTML = "";

  quests.forEach((q,i)=> {
    const li = document.createElement("li");
    li.className = `quest-item priority-${q.priority}`;
    if (q.done) {
        li.classList.add("done"); // 達成済みなら 'done' クラスを追加
    }

    const name = document.createElement("span");
    name.className="quest-name";
    name.textContent=q.name;

    const info = document.createElement("div");
    info.className="deadline";
    if(q.deadline){
      const hh = String(q.deadline.getHours()).padStart(2,"0");
      const mm = String(q.deadline.getMinutes()).padStart(2,"0");
      info.textContent = `期限: ${q.deadline.toLocaleDateString()} ${hh}:${mm}`;

      const diffMs = q.deadline - new Date();
      if(diffMs < 0 && !q.done) info.classList.add("overdue");
      else if(diffMs <= 24*60*60*1000 && !q.done) info.style.color = "#ffd27f";
    }

    const btns = document.createElement("div");
    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = `<i class="fas fa-trash"></i>`;
    del.addEventListener("click", ()=> {
      quests.splice(i,1);
      saveData();
      sortAndRenderQuests(); // 削除後にソートして描画
      syncCompletedTasksToBattle();
    });
    btns.appendChild(del);

    // タスク名クリックで完了トグル
    name.addEventListener("click",()=> {
      q.done = !q.done;
      if(q.done){
        exp += 20;
        if(exp >= 100){
          level++; exp -= 100;
          alert(`レベルアップ！ Lv${level}`);
        }
        // タスク完了時に報酬付与
        if (typeof window.awardRewardsOnTaskComplete === 'function') {
          try { window.awardRewardsOnTaskComplete(); } catch(e) { console.error(e); }
        }
      } else {
        // 未完に戻した場合、必要なら処理（今はEXPは戻さない）
      }

      saveData();
      syncCompletedTasksToBattle(); // 完了状態の変更をバトル側へ反映
      sortAndRenderQuests(); // 達成状態変更後にソートして描画
      updateLevelBar();
    });

    li.appendChild(name);
    li.appendChild(info);
    li.appendChild(btns);
    questListEl.appendChild(li);
  });
}
// index.js の初期化処理内
document.addEventListener("DOMContentLoaded", () => {
  // タスク・クエスト描画や localStorage 読み込みなどの初期化
  renderQuests();
  loadTasksFromStorage();
  updateLevelAndExp();

  // resetBtn の存在確認付きイベント登録
  const resetBtn = document.getElementById("resetDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if(confirm("本当にデータをリセットしますか？")) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  // 他のボタンやモーダルイベント登録もここでまとめて安全に
});

// =======================
// 保存
// =======================
function saveData(){
  // DateオブジェクトをJSONに保存できる形式に戻す
  const questsToSave = quests.map(q => ({
    ...q,
    deadline: q.deadline ? q.deadline.toISOString() : null
  }));
  localStorage.setItem("quests", JSON.stringify(questsToSave));
  localStorage.setItem("level", level);
  localStorage.setItem("exp", exp);
}

// =======================
// 完了タスク数をバトル画面へ保存（同期）
// =======================
function syncCompletedTasksToBattle() {
  const completedCount = quests.filter(q => q.done).length;
  localStorage.setItem("completedTasks", completedCount);
  // 累積も更新（Reward.js がこれを参照する場合あり）
  const prevTotal = parseInt(localStorage.getItem('totalCompletedCount')) || 0;
  localStorage.setItem('totalCompletedCount', prevTotal);
}

// =======================
// レベルバー更新
// =======================
function updateLevelBar(){
  if(levelDisplay) levelDisplay.textContent = level;
  if(expBar) expBar.style.width = `${exp}%`;
}

// =======================
// ミニ情報反映
// =======================
function updateMiniInfo(){
  const savedPlayer = JSON.parse(localStorage.getItem("playerData")) || {};
  if(miniHeroIcon && savedPlayer.image) miniHeroIcon.src = savedPlayer.image;
  if(playerNameEl && savedPlayer.name) playerNameEl.textContent = savedPlayer.name;
}
const resetBtn = document.getElementById("resetDataBtn");

resetBtn.addEventListener("click", () => {
  if(confirm("本当に全てのデータを削除しますか？ この操作は元に戻せません。")) {
    // 1. localStorage の全クリア
    localStorage.clear();

    // 2. ページをリロードして初期状態に戻す
    alert("データを削除しました。ゲームをリロードします。");
    location.reload();
  }
});
