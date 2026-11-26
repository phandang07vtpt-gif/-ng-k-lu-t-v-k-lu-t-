const CATEGORIES = {
  expense: [
    { id: "food", name: "Ăn uống & Cà phê", icon: "🍜", color: "#f97316" },
    {
      id: "housing",
      name: "Nhà ở, Điện nước & Net",
      icon: "🏠",
      color: "#2563eb",
    },
    {
      id: "transport",
      name: "Xăng xe & Di chuyển",
      icon: "🛵",
      color: "#06b6d4",
    },
    { id: "shopping", name: "Mua sắm cá nhân", icon: "🛍️", color: "#ec4899" },
    {
      id: "entertainment",
      name: "Giải trí & Bạn bè",
      icon: "🎬",
      color: "#8b5cf6",
    },
    {
      id: "education",
      name: "Học tập & Sức khỏe",
      icon: "📚",
      color: "#10b981",
    },
    { id: "other_exp", name: "Chi phí khác", icon: "📦", color: "#64748b" },
  ],
  income: [
    { id: "salary", name: "Lương / Làm thêm", icon: "💼", color: "#10b981" },
    {
      id: "allowance",
      name: "Trợ cấp / Gia đình",
      icon: "🎁",
      color: "#3b82f6",
    },
    {
      id: "business",
      name: "Kinh doanh / Bán hàng",
      icon: "📈",
      color: "#f59e0b",
    },
    { id: "other_inc", name: "Thu nhập khác", icon: "💰", color: "#6366f1" },
  ],
};

const STORAGE_KEY = "so_thu_chi_pro_data_v1";

// Lấy chuỗi YYYY-MM hiện tại
function getCurrentMonthStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Dữ liệu mẫu khởi tạo ban đầu
function createDemoData() {
  const month = getCurrentMonthStr();
  return {
    monthlyBudget: 6000000,
    transactions: [
      {
        id: 1,
        type: "income",
        amount: 8500000,
        category: "salary",
        date: `${month}-01`,
        wallet: "Chuyển khoản",
        note: "Lương tháng này",
      },
      {
        id: 2,
        type: "expense",
        amount: 2200000,
        category: "housing",
        date: `${month}-02`,
        wallet: "Chuyển khoản",
        note: "Tiền phòng + điện nước",
      },
      {
        id: 3,
        type: "expense",
        amount: 350000,
        category: "food",
        date: `${month}-03`,
        wallet: "Tiền mặt",
        note: "Đi chợ nấu ăn tuần 1",
      },
      {
        id: 4,
        type: "expense",
        amount: 80000,
        category: "transport",
        date: `${month}-04`,
        wallet: "Tiền mặt",
        note: "Đổ đầy bình xăng",
      },
      {
        id: 5,
        type: "expense",
        amount: 65000,
        category: "food",
        date: `${month}-05`,
        wallet: "Ví điện tử",
        note: "Cà phê làm việc",
      },
      {
        id: 6,
        type: "expense",
        amount: 420000,
        category: "shopping",
        date: `${month}-06`,
        wallet: "Chuyển khoản",
        note: "Mua áo sơ mi",
      },
      {
        id: 7,
        type: "expense",
        amount: 250000,
        category: "education",
        date: `${month}-07`,
        wallet: "Chuyển khoản",
        note: "Mua sách kỹ năng",
      },
    ],
  };
}

let appData = loadData();
let currentFormType = "expense";

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return createDemoData();
    }
  }
  return createDemoData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function formatVND(num) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
}

function getCategoryInfo(type, catId) {
  const list = CATEGORIES[type] || [];
  return (
    list.find((c) => c.id === catId) || {
      name: "Khác",
      icon: "📌",
      color: "#64748b",
    }
  );
}

// Cập nhật danh sách dropdown danh mục theo loại Thu / Chi
function populateCategorySelect(type) {
  const select = document.getElementById("tx-category");
  select.innerHTML = "";
  CATEGORIES[type].forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.name}`;
    select.appendChild(opt);
  });
}

// Lọc giao dịch theo tháng đang chọn
function getMonthTransactions() {
  const selectedMonth = document.getElementById("month-filter").value;
  return appData.transactions.filter((tx) => tx.date.startsWith(selectedMonth));
}

// Cập nhật 4 thẻ KPI trên cùng
function renderKPIs(monthTxs) {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  monthTxs.forEach((tx) => {
    if (tx.type === "income") {
      totalIncome += tx.amount;
      incomeCount++;
    } else {
      totalExpense += tx.amount;
      expenseCount++;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  document.getElementById("kpi-balance").textContent = formatVND(balance);
  document.getElementById("kpi-balance").style.color =
    balance < 0 ? "var(--expense)" : "var(--text-primary)";

  const badge = document.getElementById("saving-rate-badge");
  badge.textContent = `Tiết kiệm ${savingRate}%`;
  badge.style.background = savingRate >= 20 ? "var(--income-bg)" : "#e0f2fe";
  badge.style.color = savingRate >= 20 ? "var(--income)" : "#0369a1";

  document.getElementById("kpi-income").textContent = formatVND(totalIncome);
  document.getElementById("kpi-income-count").textContent =
    `${incomeCount} khoản thu`;

  document.getElementById("kpi-expense").textContent = formatVND(totalExpense);
  document.getElementById("kpi-expense-count").textContent =
    `${expenseCount} khoản chi`;

  // Hạn mức ngân sách
  const budget = appData.monthlyBudget || 0;
  const budgetLeft = budget - totalExpense;
  const usedPercent =
    budget > 0 ? Math.min(Math.round((totalExpense / budget) * 100), 100) : 0;
  const rawPercent = budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;

  const budgetLeftEl = document.getElementById("kpi-budget-left");
  budgetLeftEl.textContent =
    budgetLeft >= 0
      ? `Còn ${formatVND(budgetLeft)}`
      : `Vượt ${formatVND(Math.abs(budgetLeft))}`;
  budgetLeftEl.style.color =
    budgetLeft < 0 ? "var(--expense)" : "var(--text-primary)";

  const fillEl = document.getElementById("kpi-budget-fill");
  fillEl.style.width = `${usedPercent}%`;
  if (rawPercent >= 100) {
    fillEl.style.backgroundColor = "var(--expense)";
  } else if (rawPercent >= 80) {
    fillEl.style.backgroundColor = "var(--warning)";
  } else {
    fillEl.style.backgroundColor = "var(--primary)";
  }

  document.getElementById("kpi-budget-text").textContent =
    `Đã dùng ${rawPercent}% trên ${formatVND(budget)}`;
}

// Vẽ biểu đồ Donut bằng HTML5 Canvas & danh sách tỷ trọng
function renderChartAndBreakdown(monthTxs) {
  const expenses = monthTxs.filter((tx) => tx.type === "expense");
  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  document.getElementById("donut-total").textContent = formatVND(totalExpense);

  // Gom nhóm theo danh mục
  const grouped = {};
  expenses.forEach((tx) => {
    grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
  });

  const sortedCategories = Object.entries(grouped)
    .map(([catId, amount]) => ({
      ...getCategoryInfo("expense", catId),
      id: catId,
      amount,
      percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Vẽ Canvas Donut
  const canvas = document.getElementById("expense-chart");
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 76;
  const lineWidth = 24;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (totalExpense === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  } else {
    let startAngle = -Math.PI / 2;
    sortedCategories.forEach((item) => {
      const sliceAngle = (item.amount / totalExpense) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      startAngle += sliceAngle;
    });
  }

  // Render danh sách thanh tiến trình bên dưới biểu đồ
  const listEl = document.getElementById("category-breakdown");
  listEl.innerHTML = "";

  if (sortedCategories.length === 0) {
    listEl.innerHTML = `<p class="empty-state" style="padding: 12px;">Chưa có khoản chi nào trong tháng này.</p>`;
    return;
  }

  sortedCategories.forEach((item) => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `
      <div class="breakdown-info">
        <span class="breakdown-name">
          <span class="dot" style="background:${item.color}"></span>
          ${item.icon} ${item.name}
        </span>
        <span><strong>${formatVND(item.amount)}</strong> (${item.percent.toFixed(1)}%)</span>
      </div>
      <div class="breakdown-track">
        <div class="breakdown-fill" style="width:${item.percent}%; background:${item.color}"></div>
      </div>
    `;
    listEl.appendChild(row);
  });
}

// Render danh sách giao dịch gom nhóm theo ngày
function renderTransactionList(monthTxs) {
  const listEl = document.getElementById("transaction-list");
  const searchKeyword = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();
  const typeFilter = document.getElementById("type-filter").value;

  const filtered = monthTxs
    .filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (searchKeyword) {
        const cat = getCategoryInfo(tx.type, tx.category);
        const matchNote = (tx.note || "").toLowerCase().includes(searchKeyword);
        const matchCat = cat.name.toLowerCase().includes(searchKeyword);
        const matchWallet = (tx.wallet || "")
          .toLowerCase()
          .includes(searchKeyword);
        return matchNote || matchCat || matchWallet;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>Không tìm thấy giao dịch nào phù hợp.</p>
      </div>
    `;
    return;
  }

  // Gom nhóm theo ngày
  const byDate = {};
  filtered.forEach((tx) => {
    if (!byDate[tx.date]) byDate[tx.date] = [];
    byDate[tx.date].push(tx);
  });

  Object.entries(byDate).forEach(([dateStr, txs]) => {
    const dayNet = txs.reduce(
      (sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount),
      0,
    );
    const [y, m, d] = dateStr.split("-");
    const formattedDate = `Ngày ${d}/${m}/${y}`;

    const groupDiv = document.createElement("div");
    groupDiv.className = "tx-date-group";
    groupDiv.innerHTML = `
      <div class="tx-date-header">
        <span>${formattedDate}</span>
        <span>${dayNet >= 0 ? "+" : ""}${formatVND(dayNet)}</span>
      </div>
    `;

    txs.forEach((tx) => {
      const cat = getCategoryInfo(tx.type, tx.category);
      const itemDiv = document.createElement("div");
      itemDiv.className = "tx-item";

      const isIncome = tx.type === "income";
      const sign = isIncome ? "+" : "-";
      const amountClass = isIncome ? "text-income" : "text-expense";

      itemDiv.innerHTML = `
        <div class="tx-left">
          <div class="tx-cat-icon">${cat.icon}</div>
          <div class="tx-details">
            <span class="tx-title">${tx.note ? tx.note : cat.name}</span>
            <span class="tx-meta">${cat.name} • ${tx.wallet}</span>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${amountClass}">${sign}${formatVND(tx.amount)}</span>
          <button class="btn-delete" title="Xóa giao dịch" data-id="${tx.id}">&times;</button>
        </div>
      `;

      itemDiv.querySelector(".btn-delete").addEventListener("click", () => {
        appData.transactions = appData.transactions.filter(
          (item) => item.id !== tx.id,
        );
        saveData();
        refreshAll();
      });

      groupDiv.appendChild(itemDiv);
    });

    listEl.appendChild(groupDiv);
  });
}

// Xuất dữ liệu ra file CSV mở bằng Excel
function exportToCSV() {
  const monthTxs = getMonthTransactions();
  if (monthTxs.length === 0) {
    alert("Không có dữ liệu trong tháng này để xuất file.");
    return;
  }

  let csv = "\uFEFFNgày,Loại,Danh mục,Số tiền,Nguồn tiền,Ghi chú\n";
  monthTxs.forEach((tx) => {
    const cat = getCategoryInfo(tx.type, tx.category);
    const typeLabel = tx.type === "income" ? "Thu nhập" : "Chi tiêu";
    const safeNote = `"${(tx.note || "").replace(/"/g, '""')}"`;
    csv += `${tx.date},${typeLabel},"${cat.name}",${tx.amount},"${tx.wallet}",${safeNote}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const selectedMonth = document.getElementById("month-filter").value;
  a.href = url;
  a.download = `So_Thu_Chi_${selectedMonth}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function refreshAll() {
  const monthTxs = getMonthTransactions();
  renderKPIs(monthTxs);
  renderChartAndBreakdown(monthTxs);
  renderTransactionList(monthTxs);
}

// Khởi tạo sự kiện DOM
document.addEventListener("DOMContentLoaded", () => {
  const monthFilter = document.getElementById("month-filter");
  const dateInput = document.getElementById("tx-date");

  monthFilter.value = getCurrentMonthStr();
  dateInput.value = getTodayStr();
  populateCategorySelect("expense");

  // Chuyển đổi Thu / Chi trên Form
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".type-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFormType = btn.dataset.type;
      populateCategorySelect(currentFormType);
    });
  });

  // Nút cộng nhanh số tiền (+20k, +50k...)
  document.querySelectorAll(".quick-amounts button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const amountInput = document.getElementById("tx-amount");
      const current = Number(amountInput.value) || 0;
      amountInput.value = current + Number(btn.dataset.add);
    });
  });

  // Submit thêm giao dịch mới
  document
    .getElementById("transaction-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById("tx-amount").value);
      const category = document.getElementById("tx-category").value;
      const date = document.getElementById("tx-date").value;
      const wallet = document.getElementById("tx-wallet").value;
      const note = document.getElementById("tx-note").value.trim();

      if (amount <= 0) return;

      appData.transactions.push({
        id: Date.now(),
        type: currentFormType,
        amount,
        category,
        date,
        wallet,
        note,
      });

      // Tự động chuyển kỳ báo cáo sang tháng của giao dịch vừa nhập
      monthFilter.value = date.slice(0, 7);

      saveData();
      refreshAll();

      document.getElementById("tx-amount").value = "";
      document.getElementById("tx-note").value = "";
    });

  // Lọc theo tháng, loại và từ khóa tìm kiếm
  monthFilter.addEventListener("change", refreshAll);
  document.getElementById("type-filter").addEventListener("change", refreshAll);
  document.getElementById("search-input").addEventListener("input", refreshAll);

  // Xuất CSV & Khôi phục dữ liệu mẫu
  document
    .getElementById("export-csv-btn")
    .addEventListener("click", exportToCSV);
  document.getElementById("reset-demo-btn").addEventListener("click", () => {
    if (
      confirm(
        "Khôi phục lại dữ liệu mẫu ban đầu? Dữ liệu hiện tại sẽ bị thay thế.",
      )
    ) {
      appData = createDemoData();
      monthFilter.value = getCurrentMonthStr();
      saveData();
      refreshAll();
    }
  });

  // Modal chỉnh sửa hạn mức tháng
  const modal = document.getElementById("budget-modal");
  document.getElementById("edit-budget-btn").addEventListener("click", () => {
    document.getElementById("monthly-budget-input").value =
      appData.monthlyBudget;
    modal.classList.remove("hidden");
  });

  document.getElementById("close-modal-btn").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  document.getElementById("save-budget-btn").addEventListener("click", () => {
    const newBudget = Math.max(
      0,
      Number(document.getElementById("monthly-budget-input").value),
    );
    appData.monthlyBudget = newBudget;
    saveData();
    modal.classList.add("hidden");
    refreshAll();
  });

  refreshAll();
});
