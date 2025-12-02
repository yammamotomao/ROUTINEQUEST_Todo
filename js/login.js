document.getElementById("loginBtn").addEventListener("click", () => {
  const slot = document.getElementById("slotSelect").value;
  const password = document.getElementById("password").value;

  if (!password) {
    alert("パスワードを入力してください！");
    return;
  }

  // 保存されているデータを取得
  const saveData = JSON.parse(localStorage.getItem(slot));

  if (!saveData) {
    alert("このスロットにはデータがありません。");
    return;
  }

  // パスワード一致チェック
  if (saveData.password === password) {
    // ログイン成功 → index.htmlへ
    localStorage.setItem("currentSlot", slot);
    window.location.href = "index.html";
  } else {
    alert("パスワードが違います！");
  }
});
