document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const logo = document.getElementById("titleLogo");
  const login = document.getElementById("loginBtn");
  const newgame = document.getElementById("newgameBtn");

  function updateTime() {
    const hour = new Date().getHours();
    let time;

    if (hour >= 5 && hour < 11) time = "asa";
    else if (hour >= 11 && hour < 16) time = "hiru";
    else if (hour >= 16 && hour < 19) time = "yugata";
    else time = "yoru";

    // 背景とロゴを更新
    body.className = ""; // 既存クラスをリセット
    body.classList.add(time);

    if (logo) logo.src = `images/${time}_logo.png`;
    if (login) login.src = `images/${time}_login.png`;
    if (newgame) newgame.src = `images/${time}_newgame.png`;
  }

  // 初回実行
  updateTime();

  // 1分ごとにチェックして更新
  setInterval(updateTime, 60 * 1000);
});
