// ===========================
// ボス管理
// ===========================
let bosses = [
  { name: "スライム", hp: 3, img: "images/enemies/1.png" },
  { name: "ゴブリン", hp: 5, img: "images/enemies/2.png" },
  { name: "ドラゴン", hp: 8, img: "images/enemies/3.png" }
];
let currentBossIndex = 0; // 現在のボス
let rewards = []; // 取得済み報酬

const enemyModal = document.getElementById("enemyModal");
const bossImg = document.getElementById("bossImg");
const bossName = document.getElementById("bossName");
const bossHp = document.getElementById("bossHp");
const attackBtn = document.getElementById("attackBtn");

const rewardBox = document.getElementById("rewardBox");
const rewardModal = document.getElementById("rewardModal");
const rewardList = document.getElementById("rewardList");

// ===========================
// ボス表示更新
// ===========================
function updateBossModal(){
  if(currentBossIndex >= bosses.length) return enemyModal.style.display="none";

  const boss = bosses[currentBossIndex];
  bossImg.src = boss.img;
  bossName.textContent = boss.name;
  bossHp.textContent = `HP: ${boss.hp}`;
  enemyModal.style.display = "flex";
}

// ===========================
// ボス攻撃
// ===========================
function attackBoss(){
  if(currentBossIndex >= bosses.length) return;
  const boss = bosses[currentBossIndex];
  boss.hp--;
  if(boss.hp <= 0){
    alert(`${boss.name}を倒した！`);
    giveReward();
    currentBossIndex++;
  }
  updateBossModal();
}

// ===========================
// 報酬取得
// ===========================
function giveReward(){
  const rewardCount = 10; // images/housyu/1.png ... 10.pngまで
  const num = Math.floor(Math.random() * rewardCount) + 1;
  const rewardImg = `images/housyu/${num}.png`;
  rewards.push(rewardImg);
  alert(`報酬ゲット！`);
}

// ===========================
// 宝箱クリックで報酬表示
// ===========================
rewardBox.addEventListener("click", () => {
  rewardList.innerHTML = rewards.map(r=>`<img src="${r}" style="width:50px; margin:5px;">`).join("");
  rewardModal.style.display = "flex";
});

// ===========================
// 攻撃ボタン
// ===========================
attackBtn.addEventListener("click", attackBoss);

// ===========================
// タスク完了で攻撃
// （index.jsのタスククリックイベント内で呼ぶ）
// ===========================
function onTaskComplete() {
  attackBoss();
}
