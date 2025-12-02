// js/Reward.js - 報酬システム（修正版・完全版）
(function(){
  // --- 初期データロード ---
  let coins = parseInt(localStorage.getItem("coins")) || 0;
  let tickets = parseInt(localStorage.getItem("tickets")) || 0;
  let unlockedTitles = JSON.parse(localStorage.getItem("unlockedTitles")) || [];
  let collection = JSON.parse(localStorage.getItem("collection")) || [];
  let totalCompletedCount = parseInt(localStorage.getItem("totalCompletedCount")) || 0;

  // --- ドロップテーブル（図鑑アイテム） ---
  const dropTable = [
    { id: 'gem_blue', name: '青い宝石', rarity: 'common' },
    { id: 'gem_red', name: '赤い宝石', rarity: 'common' },
    { id: 'amulet', name: '古い護符', rarity: 'uncommon' },
    { id: 'golden_feather', name: '黄金の羽', rarity: 'rare' },
    { id: 'mysterious_scroll', name: '不思議な巻物', rarity: 'legendary' }
  ];

  // --- UI 注入 ---
  function injectRewardUI(){
    const statusRight = document.querySelector(".status-right");
    if(!statusRight) return;

    const rewardWrap = document.createElement("div");
    rewardWrap.id = "rewardWrap";
    rewardWrap.style.display = "flex";
    rewardWrap.style.alignItems = "center";
    rewardWrap.style.gap = "10px";
    rewardWrap.style.marginLeft = "14px";

    const coinBadge = document.createElement("div");
    coinBadge.id = "coinBadge";
    coinBadge.className = "reward-badge";
    coinBadge.title = "所持コイン";
    coinBadge.innerHTML = `💰 <span id="coinCount">${coins}</span>`;
    rewardWrap.appendChild(coinBadge);

    const ticketBadge = document.createElement("div");
    ticketBadge.id = "ticketBadge";
    ticketBadge.className = "reward-badge";
    ticketBadge.title = "ガチャチケット";
    ticketBadge.innerHTML = `🎟️ <span id="ticketCount">${tickets}</span>`;
    rewardWrap.appendChild(ticketBadge);

    const gachaBtn = document.createElement("button");
    gachaBtn.id = "gachaBtn";
    gachaBtn.className = "small-btn";
    gachaBtn.textContent = "ガチャ";
    rewardWrap.appendChild(gachaBtn);

    const titleBtn = document.createElement("button");
    titleBtn.id = "titleBtn";
    titleBtn.className = "small-btn";
    titleBtn.textContent = "称号";
    rewardWrap.appendChild(titleBtn);

    const collBtn = document.createElement("button");
    collBtn.id = "collBtn";
    collBtn.className = "small-btn";
    collBtn.textContent = "図鑑";
    rewardWrap.appendChild(collBtn);

    statusRight.appendChild(rewardWrap);

    const modalHtml = `
      <div id="rewardModalWrap" class="rq-modal" style="display:none">
        <div class="rq-modal-inner">
          <button class="rq-close">&times;</button>
          <div id="rewardModalContent"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    gachaBtn.addEventListener('click', () => openGachaModal());
    titleBtn.addEventListener('click', () => openTitleModal());
    collBtn.addEventListener('click', () => openCollectionModal());
    document.querySelector('#rewardModalWrap .rq-close').addEventListener('click', closeRewardModal);
    document.getElementById('rewardModalWrap').addEventListener('click', (e)=> {
      if(e.target.id === 'rewardModalWrap') closeRewardModal();
    });
  }

  // --- 保存ユーティリティ ---
  function saveRewardsState(){
    localStorage.setItem("coins", coins);
    localStorage.setItem("tickets", tickets);
    localStorage.setItem("unlockedTitles", JSON.stringify(unlockedTitles));
    localStorage.setItem("collection", JSON.stringify(collection));
    localStorage.setItem("totalCompletedCount", totalCompletedCount);
    updateHeaderBadges();
  }

  function updateHeaderBadges(){
    const c = document.getElementById("coinCount");
    if(c) c.textContent = coins;
    const t = document.getElementById("ticketCount");
    if(t) t.textContent = tickets;
  }

  // --- ランダムドロップ ---
  function randomDrop(){
    const r = Math.random() * 100;
    if(r < 5) return dropTable.find(i=>i.rarity==='legendary');
    if(r < 15) return dropTable.find(i=>i.rarity==='rare');
    if(r < 40) return dropTable.find(i=>i.rarity==='uncommon');
    return dropTable.find(i=>i.rarity==='common');
  }

  // --- バトル画面通知ユーティリティ ---
  function enqueueBattleMessage(msg){
    const battleMessage = document.getElementById("battle-message");
    if(battleMessage){
      const prev = battleMessage.textContent;
      battleMessage.textContent = msg;
      setTimeout(()=> {
        if(battleMessage.textContent === msg) battleMessage.textContent = prev;
      }, 3000);
    } else {
      console.log("MSG:", msg);
    }
  }

  // --- タスク完了時の報酬付与（index.js から呼ばれる） ---
  window.awardRewardsOnTaskComplete = function(){
    totalCompletedCount = (parseInt(localStorage.getItem('totalCompletedCount')) || totalCompletedCount) + 1;

    // ① コイン（10〜30）
    const coinGain = 10 + Math.floor(Math.random() * 21);
    coins += coinGain;

    // ② チケット（10%で1枚）
    let ticketGained = false;
    if(Math.random() < 0.10) {
      tickets += 1;
      ticketGained = true;
    }

    // ③ 称号（閾値）
    const thresholds = [
      { n:5, id:'努力家', name:'努力家' },
      { n:10, id:'勤勉の勇者', name:'勤勉の勇者' },
      { n:25, id:'黄金の手帳術師', name:'黄金の手帳術師' }
    ];
    thresholds.forEach(t => {
      if(totalCompletedCount >= t.n && !unlockedTitles.find(x=>x.id===t.id)){
        unlockedTitles.push({ id: t.id, name: t.name, unlockedAt: (new Date()).toISOString() });
        enqueueBattleMessage(`称号を獲得：${t.name}`);
      }
    });

    // ④ 図鑑ドロップ（25%）
    if(Math.random() < 0.25){
      const d = randomDrop();
      if(d && !collection.includes(d.id)){
        collection.push(d.id);
        enqueueBattleMessage(`図鑑ゲット：${d.name}`);
      } else if (d) {
        enqueueBattleMessage(`図鑑アイテムを獲得（既に所持）：${d.name}`);
      }
    }

    saveRewardsState();
    enqueueBattleMessage(`コイン +${coinGain}${ticketGained ? ' / チケット +1' : ''}`);
    updateHeaderBadges();
  };

  // --- ガチャ機能 ---
  function openGachaModal(){
    const modalWrap = document.getElementById('rewardModalWrap');
    const content = document.getElementById('rewardModalContent');
    content.innerHTML = `
      <h3>ガチャ（チケット1枚、またはコイン200）</h3>
      <p>チケット: ${tickets} / コイン: ${coins}</p>
      <button id="gachaUseTicket">チケットで回す</button>
      <button id="gachaUseCoins">コインで回す（200）</button>
      <div id="gachaResult" style="margin-top:12px;"></div>
    `;
    modalWrap.style.display = 'flex';

    document.getElementById('gachaUseTicket').onclick = async () => {
      if(tickets <= 0) return alert("チケットがありません！");
      // 簡易演出のためボタンを無効化
      document.getElementById('gachaUseTicket').disabled = true;
      document.getElementById('gachaUseCoins').disabled = true;
      tickets--; saveRewardsState();
      const prize = gachaRoll();
      await applyGachaPrize(prize);
      document.getElementById('gachaResult').innerHTML = `<strong>獲得：${prize.name}</strong>`;
      document.getElementById('gachaUseTicket').disabled = false;
      document.getElementById('gachaUseCoins').disabled = false;
    };
    document.getElementById('gachaUseCoins').onclick = async () => {
      if(coins < 200) return alert("コインが足りません（200必要）");
      document.getElementById('gachaUseTicket').disabled = true;
      document.getElementById('gachaUseCoins').disabled = true;
      coins -= 200; saveRewardsState();
      const prize = gachaRoll();
      await applyGachaPrize(prize);
      document.getElementById('gachaResult').innerHTML = `<strong>獲得：${prize.name}</strong>`;
      document.getElementById('gachaUseTicket').disabled = false;
      document.getElementById('gachaUseCoins').disabled = false;
    };
  }

  function gachaRoll(){
    const r = Math.random();
    if(r < 0.05) return { type:'title', id:'legendary_master', name:'伝説の達人' };
    if(r < 0.25) {
      const rare = dropTable.find(x=>x.rarity === 'rare' || x.rarity === 'legendary') || dropTable[0];
      return { type:'collection', id: rare.id, name: rare.name };
    }
    if(r < 0.6) return { type:'coins', amount: 50, name: 'コイン×50' };
    // フォールバック
    return { type:'coins', amount: 20, name: 'コイン×20' };
  }

  async function applyGachaPrize(prize){
    if(!prize) return;
    switch(prize.type){
      case 'title':
        if(!unlockedTitles.find(t=>t.id===prize.id)){
          unlockedTitles.push({ id: prize.id, name: prize.name, unlockedAt: (new Date()).toISOString() });
          enqueueBattleMessage(`称号を獲得：${prize.name}`);
        } else {
          enqueueBattleMessage(`既に所持している称号：${prize.name}`);
        }
        break;
      case 'collection':
        if(!collection.includes(prize.id)){
          collection.push(prize.id);
          enqueueBattleMessage(`図鑑ゲット：${prize.name}`);
        } else {
          enqueueBattleMessage(`図鑑アイテムを獲得（既に所持）：${prize.name}`);
        }
        break;
      case 'coins':
        coins += (prize.amount || 0);
        enqueueBattleMessage(`コイン +${prize.amount || 0}`);
        break;
      case 'tickets':
        tickets += (prize.amount || 1);
        enqueueBattleMessage(`チケット +${prize.amount || 1}`);
        break;
      default:
        enqueueBattleMessage(`獲得：${prize.name || '不明な景品'}`);
    }
    saveRewardsState();
    updateHeaderBadges();
  }

  // --- 称号モーダル ---
  function openTitleModal(){
    const modalWrap = document.getElementById('rewardModalWrap');
    const content = document.getElementById('rewardModalContent');
    const html = `
      <h3>称号一覧</h3>
      <ul id="titleList">${unlockedTitles.map(t=>`<li>${t.name} <small>(${new Date(t.unlockedAt).toLocaleString()})</small></li>`).join('') || '<li>未獲得</li>'}</ul>
    `;
    content.innerHTML = html;
    modalWrap.style.display = 'flex';
  }

  // --- 図鑑モーダル ---
  function openCollectionModal(){
    const modalWrap = document.getElementById('rewardModalWrap');
    const content = document.getElementById('rewardModalContent');
    const itemsHtml = dropTable.map(d => {
      const owned = collection.includes(d.id);
      return `<div class="coll-item" style="margin-bottom:8px">${d.name} ${owned?'<strong>(所持)</strong>':'<em>(未所持)</em>'}</div>`;
    }).join('');
    content.innerHTML = `<h3>図鑑</h3>${itemsHtml}`;
    modalWrap.style.display = 'flex';
  }

  function closeRewardModal(){
    const modalWrap = document.getElementById('rewardModalWrap');
    if(modalWrap) modalWrap.style.display = 'none';
  }

  // --- 初期化 ---
  document.addEventListener('DOMContentLoaded', () => {
    injectRewardUI();
    updateHeaderBadges();
  });

})();

