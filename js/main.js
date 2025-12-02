document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("confirmBtn");
  const saveBtn = document.getElementById("saveBtn");

  // === register.html（主人公選択）===
  if (confirmBtn) {
    const heroCards = document.querySelectorAll(".hero-card");
    let selectedHero = null;

    heroCards.forEach(card => {
      card.addEventListener("click", () => {
        heroCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedHero = card.dataset.hero;
      });
    });

    confirmBtn.addEventListener("click", () => {
      if (!selectedHero) {
        alert("主人公を選んでください！");
        return;
      }
      localStorage.setItem("hero", selectedHero);
      window.location.href = "name.html";
    });
  }

  // === name.html（名前＆パスワード入力）===
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const name = document.getElementById("playerName").value;
      const pass = document.getElementById("playerPass").value;

      if (!name || !pass) {
        alert("名前とパスワードを入力してください！");
        return;
      }

      localStorage.setItem("playerName", name);
      localStorage.setItem("playerPass", pass);
      window.location.href = "save.html";
    });
  }

  // === save.html（セーブスロット管理）===
  const slotsDiv = document.getElementById("slots");
  if (slotsDiv) {
    const name = localStorage.getItem("playerName");
    const hero = localStorage.getItem("hero");

    let slots = JSON.parse(localStorage.getItem("saveSlots")) || [null, null, null];
    slotsDiv.innerHTML = "";

    slots.forEach((slot, i) => {
      const div = document.createElement("div");
      div.className = "slot";

      if (slot) {
        div.innerHTML = `
          <h2>スロット${i + 1}</h2>
          <p>${slot.name} (${slot.hero})</p>
          <button class="load-btn" data-i="${i}">ロード</button>
          <button class="delete-btn" data-i="${i}">削除</button>
        `;
      } else {
        div.innerHTML = `
          <h2>スロット${i + 1}</h2>
          <p>空きスロット</p>
          <button class="save-btn" data-i="${i}">ここに保存</button>
        `;
      }

      slotsDiv.appendChild(div);
    });

    document.querySelectorAll(".save-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const i = e.target.dataset.i;
        slots[i] = { name, hero };
        localStorage.setItem("saveSlots", JSON.stringify(slots));
        alert("保存しました！");
        location.reload();
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const i = e.target.dataset.i;
        slots[i] = null;
        localStorage.setItem("saveSlots", JSON.stringify(slots));
        location.reload();
      });
    });
  }
});
