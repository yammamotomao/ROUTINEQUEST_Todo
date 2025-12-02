document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ status.js 読み込みOK");

  // --- HTML要素 ---
  const heroImage = document.getElementById("heroImage");
  const imageInput = document.getElementById("imageInput");
  const changeImageBtn = document.getElementById("changeImageBtn");

  const playerName = document.getElementById("playerName");
  const playerTitle = document.getElementById("playerTitle");
  const editNameBtn = document.getElementById("editNameBtn");
  const editTitleBtn = document.getElementById("editTitleBtn");
  const playerLevelElem = document.getElementById("playerLevel");

  // --- 称号リスト（Lv1～100） ---
  const titles = [
    "見習い冒険者","新人冒険者","初級冒険者","冒険者見習","駆け出し冒険者",
    "冒険者A","冒険者B","冒険者C","冒険者D","熟練冒険者","天空の守護者","闇を裂く剣士","光の聖騎士","風の旅人",
    "炎の魔導士","鋼の盾持ち","影の暗殺者","星降る勇者","雷鳴の戦士","永遠の剣","霧の忍者","月光の剣士","大地の守護者",
    "火山の勇者","氷河の戦士","海原の冒険者","闇夜の騎士","太陽の守護者","竜騎士","狼の従者","天翔ける剣士","雷神の戦士",
    "烈火の勇者","氷刃の剣士","風切る冒険者","光明の守護者","幻影の忍者","鋼鉄の勇者","星霊の戦士","月影の剣士",
    "炎刃の冒険者","深淵の勇者","竜牙の戦士","闇影の剣士","天空の旅人","海風の勇者",
    "雷光の剣士","氷霜の戦士","森の守護者","火焔の勇者","星辰の剣士","光翼の戦士",
    "影縫いの忍者","大海の勇者","月光の旅人","雷鳴の剣士","炎帝の戦士",
    "霧深き忍者","氷刃の冒険者","闇王の勇者","鋼刃の戦士","星海の剣士","風魔の忍者",
    "太陽神の勇者","月輪の戦士","龍牙の剣士","影刃の冒険者","光の剣士","炎の守護者",
    "氷雪の戦士","森羅の勇者","雷鳴の旅人","霧影の剣士","鋼の冒険者","星霊の勇者",
    "月影の戦士","風切りの剣士","闇刃の忍者","炎帝の勇者","氷結の戦士","光翼の剣士",
    "大地の旅人","火焔の冒険者","雷神の勇者","竜騎の戦士","影縫いの剣士","月光の守護者",
    "星降る戦士","鋼鉄の剣士","闇夜の冒険者","光明の勇者","霧深き戦士","氷刃の剣士",
    "森の旅人","炎刃の勇者","雷鳴の戦士","大海の剣士","風魔の冒険者","月輪の勇者","星辰の戦士",
    "光翼の剣士","影縫いの勇者","霧影の戦士","鋼刃の剣士","炎帝の冒険者","氷結の勇者","雷光の戦士",
    "天翔ける剣士","闇影の冒険者","火焔の勇者","星霊の戦士","光の剣士","風切る旅人","月光の勇者",
    "大地の戦士","影刃の剣士","炎刃の勇者","氷雪の戦士","雷神の冒険者","鋼の勇者"

  ];
  for (let i = 11; i <= 100; i++) {
    titles.push(`冒険者Lv${i}`);
  }

  // --- 保存済みデータ読み込み ---
  const savedData = JSON.parse(localStorage.getItem("playerData")) || {};
  if (savedData.name) playerName.textContent = savedData.name;
  if (savedData.title) playerTitle.textContent = savedData.title;
  if (savedData.image) heroImage.src = savedData.image;

  // index.html 側のレベル連携
  const savedLevel = parseInt(localStorage.getItem("level") || "1");
  playerLevelElem.textContent = savedLevel;

  // レベルに応じて称号自動更新（Lv1～100）
  const displayLevel = Math.min(savedLevel, 100);
  playerTitle.textContent = titles[displayLevel - 1];

  // --- 画像変更 ---
const openFileDialog = () => imageInput.click();
heroImage.addEventListener("click", openFileDialog);
changeImageBtn.addEventListener("click", openFileDialog);

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    // 自分のページの画像を変更
    heroImage.src = e.target.result;

    // task-area の heroIcon にも反映
    const taskHeroIcon = document.getElementById('heroIcon');
    if (taskHeroIcon) taskHeroIcon.src = e.target.result;

    // 保存
    saveData("image", e.target.result);
  };
  reader.readAsDataURL(file);
});

// --- ページ読み込み時に保存データを反映 ---
window.addEventListener("DOMContentLoaded", () => {
  const savedImage = loadData("image"); // 保存データを取得
  if (savedImage) {
    // 自分のページの画像を反映
    heroImage.src = savedImage;

    // task-area 側にも反映
    const taskHeroIcon = document.getElementById('heroIcon');
    if (taskHeroIcon) taskHeroIcon.src = savedImage;
  }
});


  // --- 名前編集 ---
  editNameBtn.addEventListener("click", () => {
    const newName = prompt("新しい名前を入力してください：", playerName.textContent);
    if (newName !== null && newName.trim() !== "") {
      playerName.textContent = newName.trim();
      saveData("name", newName.trim());
    }
  });

  // --- 称号編集（手動で変更したい場合） ---
  editTitleBtn.addEventListener("click", () => {
    const newTitle = prompt("新しい称号を入力してください：", playerTitle.textContent);
    if (newTitle !== null && newTitle.trim() !== "") {
      playerTitle.textContent = newTitle.trim();
      saveData("title", newTitle.trim());
    }
  });

  // --- 保存関数 ---
  function saveData(key, value) {
    const current = JSON.parse(localStorage.getItem("playerData")) || {};
    current[key] = value;
    localStorage.setItem("playerData", JSON.stringify(current));
  }
});
