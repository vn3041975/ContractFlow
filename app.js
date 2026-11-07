// Application State
let contracts = [];
let currentFilter = {
  search: "",
  type: "all",
  priority: "all",
  urgency: "all"
};
let activeTab = "pipeline"; // pipeline, table, archive, analytics
let currentDetailContractId = null;
let stageDistributionChart = null;
let typeValueChart = null;

// Helpers: Date & Currency Formatting
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateVN(dateStr) {
  if (!dateStr) return "Chưa đặt";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  } catch (e) {
    return dateStr;
  }
}

function formatCurrencyVN(val) {
  if (isNaN(val) || val === null || val === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
}

function getDaysRemaining(endDateStr) {
  if (!endDateStr) return null;
  const today = new Date(getTodayDateString());
  const end = new Date(endDateStr);
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// LocalStorage Persistence
const STORAGE_KEY = "contractflow_contracts_data_v1";

function loadContracts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      contracts = JSON.parse(stored);
    } else {
      contracts = JSON.parse(JSON.stringify(initialContracts));
      saveContracts();
    }
  } catch (err) {
    console.error("Lỗi đọc dữ liệu từ LocalStorage:", err);
    contracts = JSON.parse(JSON.stringify(initialContracts));
  }
}

function saveContracts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  } catch (err) {
    console.error("Lỗi ghi dữ liệu vào LocalStorage:", err);
    showToast("Không thể lưu dữ liệu vào trình duyệt!", "error");
  }
}

// Toast Notifications
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const isError = type === "error";
  const isWarn = type === "warn";

  let bgClass = "bg-slate-900 text-white border-slate-700";
  let iconName = "check-circle";

  if (isError) {
    bgClass = "bg-rose-600 text-white border-rose-700";
    iconName = "alert-circle";
  } else if (isWarn) {
    bgClass = "bg-amber-600 text-white border-amber-700";
    iconName = "alert-triangle";
  }

  toast.className = `flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium transition-all transform duration-300 opacity-0 translate-y-2 pointer-events-auto ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 3200);
}

// Header Date Display
function updateHeaderDate() {
  const el = document.getElementById("currentDateDisplay");
  if (!el) return;
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" };
  const dateFormatted = now.toLocaleDateString("vi-VN", options);
  el.textContent = `Hôm nay: ${dateFormatted}`;
}

// Morning Action Center / Daily Briefing Calculation
function updateDailyBriefing() {
  const todayStr = getTodayDateString();
  const activeContracts = contracts.filter(c => !c.isArchived);

  let dueTodayItems = [];
  let overdueItems = [];
  let expiringSoonItems = [];
  let totalActiveValue = 0;

  activeContracts.forEach(c => {
    totalActiveValue += Number(c.value) || 0;

    // Check next action date
    if (c.nextActionDate) {
      if (c.nextActionDate === todayStr) {
        dueTodayItems.push(c);
      } else if (c.nextActionDate < todayStr) {
        overdueItems.push(c);
      }
    }

    // Check expiry
    const daysLeft = getDaysRemaining(c.endDate);
    if (c.stage === "expiring" || (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30)) {
      expiringSoonItems.push({ ...c, daysLeft });
    }
  });

  // Update Counters
  document.getElementById("countDueToday").textContent = dueTodayItems.length;
  document.getElementById("countOverdue").textContent = overdueItems.length;
  document.getElementById("countExpiringSoon").textContent = expiringSoonItems.length;
  document.getElementById("countActiveTotal").textContent = activeContracts.length;
  document.getElementById("totalActiveValueFormatted").textContent = formatCurrencyVN(totalActiveValue);

  // Badge Status Text
  const totalUrgent = dueTodayItems.length + overdueItems.length;
  const badge = document.getElementById("briefingBadge");
  if (totalUrgent > 0) {
    badge.className = "bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 font-semibold animate-pulse";
    badge.textContent = `${totalUrgent} việc cần xử lý ngay`;
  } else {
    badge.className = "bg-emerald-400/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 font-semibold";
    badge.textContent = "Tiến độ hôm nay ổn định";
  }

  // Render Briefing Items List
  const container = document.getElementById("briefingActionList");
  const allBriefingItems = [
    ...overdueItems.map(item => ({ ...item, urgencyType: "overdue" })),
    ...dueTodayItems.map(item => ({ ...item, urgencyType: "today" })),
    ...expiringSoonItems.filter(item => !overdueItems.some(o => o.id === item.id) && !dueTodayItems.some(d => d.id === item.id)).map(item => ({ ...item, urgencyType: "expiring" }))
  ];

  if (allBriefingItems.length === 0) {
    container.innerHTML = `
      <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center text-xs text-slate-300 flex items-center justify-center space-x-2">
        <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i>
        <span>Tuyệt vời! Không có hợp đồng nào bị quá hạn hoặc cần xử lý gấp vào đầu ngày hôm nay.</span>
      </div>
    `;
  } else {
    container.innerHTML = allBriefingItems.map(item => {
      let badgeHtml = "";
      if (item.urgencyType === "overdue") {
        badgeHtml = `<span class="bg-rose-500/20 text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded border border-rose-500/40 shrink-0">QUÁ HẠN (${formatDateVN(item.nextActionDate)})</span>`;
      } else if (item.urgencyType === "today") {
        badgeHtml = `<span class="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-500/40 shrink-0">HÔM NAY</span>`;
      } else {
        badgeHtml = `<span class="bg-yellow-500/20 text-yellow-300 text-[11px] font-bold px-2 py-0.5 rounded border border-yellow-500/40 shrink-0">CÒN ${item.daysLeft} NGÀY HẾT HẠN</span>`;
      }

      return `
        <div class="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition">
          <div class="flex items-start space-x-3 min-w-0">
            ${badgeHtml}
            <div class="min-w-0">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-white text-xs truncate cursor-pointer hover:underline" onclick="openDetailModal('${item.id}')">${item.title}</span>
                <span class="text-[11px] text-slate-400 font-mono">(${item.id})</span>
              </div>
              <p class="text-xs text-slate-300 truncate mt-0.5">
                <i data-lucide="arrow-right-circle" class="w-3 h-3 inline mr-1 text-amber-400"></i>
                <span class="font-medium text-amber-200">Việc cần làm:</span> ${item.nextActionNote || "Cập nhật tiến độ xử lý"}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button onclick="quickCompleteAction('${item.id}')" class="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1" title="Đánh dấu đã xử lý bước này">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Đã xử lý</span>
            </button>
            <button onclick="openDetailModal('${item.id}')" class="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1">
              <span>Xem chi tiết</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  lucide.createIcons();
}

// Filter Urgency shortcut from cards
function filterByUrgency(urgency) {
  currentFilter.urgency = currentFilter.urgency === urgency ? "all" : urgency;
  // Switch to table or pipeline
  if (activeTab === "archive" || activeTab === "analytics") {
    switchTab("pipeline");
  } else {
    renderAllViews();
  }
}

// Quick action: mark action complete for contract
function quickCompleteAction(contractId) {
  const item = contracts.find(c => c.id === contractId);
  if (!item) return;

  const todayStr = getTodayDateString();
  const notePrompt = prompt(`Nhập nội dung hoàn tất cho hợp đồng ${item.id}:`, `Đã xử lý: ${item.nextActionNote || "công việc trong ngày"}`);
  if (notePrompt === null) return; // User cancelled

  if (!item.notes) item.notes = [];
  item.notes.unshift({
    date: todayStr,
    content: notePrompt || "Đã hoàn thành công việc theo lịch nhắc đầu ngày."
  });

  // Ask for next due date
  const nextDate = prompt("Nhập hạn xử lý kế tiếp (định dạng YYYY-MM-DD) hoặc để trống nếu chưa có:", "");
  item.nextActionDate = nextDate ? nextDate.trim() : null;
  if (item.nextActionDate) {
    const nextNote = prompt("Ghi chú việc cần làm cho đợt tiếp theo:", "");
    item.nextActionNote = nextNote ? nextNote.trim() : "";
  } else {
    item.nextActionNote = "";
  }

  saveContracts();
  renderAllViews();
  showToast(`Đã cập nhật tiến độ hợp đồng ${item.id}`);
}

// Filter Logic
function getFilteredContracts() {
  const todayStr = getTodayDateString();
  return contracts.filter(c => {
    // Search query
    if (currentFilter.search) {
      const q = currentFilter.search.toLowerCase();
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchId = (c.id || "").toLowerCase().includes(q);
      const matchPartner = (c.partner || "").toLowerCase().includes(q);
      const matchAssignee = (c.assignee || "").toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchPartner && !matchAssignee) return false;
    }

    // Type filter
    if (currentFilter.type !== "all" && c.contractType !== currentFilter.type) {
      return false;
    }

    // Priority filter
    if (currentFilter.priority !== "all" && c.priority !== currentFilter.priority) {
      return false;
    }

    // Urgency filter
    if (currentFilter.urgency === "today") {
      if (c.isArchived || c.nextActionDate !== todayStr) return false;
    } else if (currentFilter.urgency === "overdue") {
      if (c.isArchived || !c.nextActionDate || c.nextActionDate >= todayStr) return false;
    } else if (currentFilter.urgency === "expiring") {
      const days = getDaysRemaining(c.endDate);
      if (c.isArchived || (c.stage !== "expiring" && (days === null || days < 0 || days > 30))) return false;
    } else if (currentFilter.urgency === "active") {
      if (c.isArchived) return false;
    }

    return true;
  });
}

// Render Pipeline Kanban Board
function renderPipelineView() {
  const filtered = getFilteredContracts().filter(c => !c.isArchived);
  const todayStr = getTodayDateString();

  const stageKeys = ["draft", "review", "signing", "active", "expiring"];

  stageKeys.forEach(stageKey => {
    const stageItems = filtered.filter(c => c.stage === stageKey);
    const countEl = document.getElementById(`countStage-${stageKey}`);
    const colEl = document.getElementById(`column-${stageKey}`);

    if (countEl) countEl.textContent = stageItems.length;

    if (!colEl) return;

    if (stageItems.length === 0) {
      colEl.innerHTML = `
        <div class="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
          Chưa có hợp đồng
        </div>
      `;
      return;
    }

    colEl.innerHTML = stageItems.map(c => {
      const isDueToday = c.nextActionDate === todayStr;
      const isOverdue = c.nextActionDate && c.nextActionDate < todayStr;

      let urgencyBadge = "";
      let cardGlow = "";

      if (isOverdue) {
        urgencyBadge = `<span class="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200">Quá hạn: ${formatDateVN(c.nextActionDate)}</span>`;
        cardGlow = "urgent-glow border-rose-300";
      } else if (isDueToday) {
        urgencyBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">Xử lý hôm nay</span>`;
        cardGlow = "today-glow border-amber-300";
      }

      // Priority badge
      let priorityBadge = "";
      if (c.priority === "high") {
        priorityBadge = `<span class="w-2 h-2 rounded-full bg-rose-500" title="Ưu tiên cao"></span>`;
      } else if (c.priority === "medium") {
        priorityBadge = `<span class="w-2 h-2 rounded-full bg-amber-500" title="Ưu tiên trung bình"></span>`;
      } else {
        priorityBadge = `<span class="w-2 h-2 rounded-full bg-slate-300" title="Ưu tiên bình thường"></span>`;
      }

      return `
        <div class="contract-card bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5 ${cardGlow}">
          
          <!-- Top Row: ID, Priority, Type -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center space-x-1.5">
              ${priorityBadge}
              <span class="font-mono font-bold text-slate-600">${c.id}</span>
            </div>
            <span class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">${c.contractType || "HĐ"}</span>
          </div>

          <!-- Title -->
          <h4 class="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition" onclick="openDetailModal('${c.id}')">
            ${c.title}
          </h4>

          <!-- Partner & Value -->
          <div class="space-y-1 text-xs">
            <div class="text-slate-600 truncate flex items-center space-x-1">
              <i data-lucide="building" class="w-3 h-3 text-slate-400 shrink-0"></i>
              <span class="truncate">${c.partner}</span>
            </div>
            <div class="font-bold text-blue-700">
              ${formatCurrencyVN(c.value)}
            </div>
          </div>

          <!-- Next Action Warning (if any) -->
          ${(isDueToday || isOverdue || c.nextActionNote) ? `
            <div class="bg-amber-50/80 p-2 rounded-lg border border-amber-200/70 text-[11px] space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-900 flex items-center space-x-1">
                  <i data-lucide="alert-circle" class="w-3 h-3 text-amber-600"></i>
                  <span>Nhiệm vụ đầu ngày:</span>
                </span>
                ${urgencyBadge}
              </div>
              <p class="text-amber-800 line-clamp-2">${c.nextActionNote || "Chưa có mô tả chi tiết"}</p>
            </div>
          ` : ""}

          <!-- Card Footer & Quick Pipeline Navigation -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div class="text-[11px] text-slate-400">
              Phụ trách: <strong class="text-slate-600 font-medium">${c.assignee ? c.assignee.split(" ").pop() : "Chưa gán"}</strong>
            </div>

            <div class="flex items-center space-x-1">
              <button onclick="openDetailModal('${c.id}')" title="Xem chi tiết" class="p-1 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              </button>
              
              <button onclick="advanceStage('${c.id}')" title="Chuyển sang giai đoạn kế tiếp" class="p-1 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded">
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join("");
  });

  lucide.createIcons();
}

// Advance Contract to next Stage
function advanceStage(contractId) {
  const c = contracts.find(item => item.id === contractId);
  if (!c) return;

  const stageOrder = ["draft", "review", "signing", "active", "expiring", "completed"];
  const currentIndex = stageOrder.indexOf(c.stage);

  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    showToast("Hợp đồng đã ở bước cuối cùng hoặc đã hoàn tất!", "warn");
    return;
  }

  const nextStage = stageOrder[currentIndex + 1];
  changeStage(contractId, nextStage);
}

function changeStage(contractId, targetStage) {
  const c = contracts.find(item => item.id === contractId);
  if (!c) return;

  const prevStageName = STAGES[c.stage]?.name || c.stage;
  const newStageName = STAGES[targetStage]?.name || targetStage;

  c.stage = targetStage;

  if (targetStage === "completed") {
    c.isArchived = true;
    c.completedAt = getTodayDateString();
  } else {
    c.isArchived = false;
  }

  // Add timeline note
  if (!c.notes) c.notes = [];
  c.notes.unshift({
    date: getTodayDateString(),
    content: `Chuyển trạng thái từ [${prevStageName}] sang [${newStageName}]`
  });

  saveContracts();
  renderAllViews();
  if (currentDetailContractId === contractId) {
    populateDetailModal(c);
  }

  showToast(`Đã chuyển hợp đồng ${c.id} sang "${newStageName}"`);
}

// Render Table View
function renderTableView() {
  const filtered = getFilteredContracts().filter(c => !c.isArchived);
  const tbody = document.getElementById("tableContractsBody");
  const emptyState = document.getElementById("tableEmptyState");
  const countBadge = document.getElementById("badgeActiveCount");

  countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  const todayStr = getTodayDateString();

  tbody.innerHTML = filtered.map(c => {
    const stageInfo = STAGES[c.stage] || STAGES.draft;
    const isDueToday = c.nextActionDate === todayStr;
    const isOverdue = c.nextActionDate && c.nextActionDate < todayStr;

    let deadlineBadge = `<span class="text-slate-500">${formatDateVN(c.nextActionDate)}</span>`;
    if (isOverdue) {
      deadlineBadge = `<span class="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px] border border-rose-200">Quá hạn (${formatDateVN(c.nextActionDate)})</span>`;
    } else if (isDueToday) {
      deadlineBadge = `<span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-200">Hôm nay</span>`;
    }

    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-200">
        <td class="px-4 py-3 font-mono font-bold text-xs text-blue-600 whitespace-nowrap">
          ${c.id}
        </td>
        <td class="px-4 py-3 max-w-xs">
          <div class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 cursor-pointer hover:text-blue-600" onclick="openDetailModal('${c.id}')">${c.title}</div>
          <div class="text-xs text-slate-500 line-clamp-1 flex items-center space-x-1 mt-0.5">
            <i data-lucide="building" class="w-3 h-3 text-slate-400"></i>
            <span>${c.partner}</span>
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">${c.contractType || "Khác"}</span>
        </td>
        <td class="px-4 py-3 font-bold text-xs text-slate-900 whitespace-nowrap">
          ${formatCurrencyVN(c.value)}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="text-[11px] px-2.5 py-1 rounded-full font-semibold border ${stageInfo.badgeClass}">
            ${stageInfo.name}
          </span>
        </td>
        <td class="px-4 py-3 max-w-xs text-xs text-slate-600">
          <div class="line-clamp-2">${c.nextActionNote || "Chưa có ghi chú"}</div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap text-xs">
          ${deadlineBadge}
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <div class="flex items-center justify-end space-x-1">
            <button onclick="openDetailModal('${c.id}')" class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="openEditModal('${c.id}')" class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded" title="Chỉnh sửa">
              <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
            <button onclick="archiveContract('${c.id}', true)" class="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Hoàn tất & Lưu trữ">
              <i data-lucide="archive" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

// Render Archived Contracts View
function renderArchiveView() {
  const archived = contracts.filter(c => c.isArchived);
  const tbody = document.getElementById("tableArchiveBody");
  const emptyState = document.getElementById("archiveEmptyState");
  const countBadge = document.getElementById("badgeArchiveCount");

  countBadge.textContent = archived.length;

  if (archived.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  tbody.innerHTML = archived.map(c => {
    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-200">
        <td class="px-4 py-3 font-mono font-bold text-xs text-emerald-700 whitespace-nowrap">
          ${c.id}
        </td>
        <td class="px-4 py-3 max-w-sm">
          <div class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 cursor-pointer hover:text-emerald-700" onclick="openDetailModal('${c.id}')">${c.title}</div>
          <div class="text-xs text-slate-500 line-clamp-1 flex items-center space-x-1 mt-0.5">
            <i data-lucide="building" class="w-3 h-3 text-slate-400"></i>
            <span>${c.partner}</span>
          </div>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">${c.contractType || "Khác"}</span>
        </td>
        <td class="px-4 py-3 font-bold text-xs text-slate-900 whitespace-nowrap">
          ${formatCurrencyVN(c.value)}
        </td>
        <td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
          ${formatDateVN(c.startDate)} - ${formatDateVN(c.endDate)}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-200">
            ${formatDateVN(c.completedAt || c.endDate)}
          </span>
        </td>
        <td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
          ${c.assignee || "—"}
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <div class="flex items-center justify-end space-x-2">
            <button onclick="openDetailModal('${c.id}')" class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded" title="Xem hồ sơ">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="archiveContract('${c.id}', false)" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1" title="Khôi phục lại quy trình">
              <i data-lucide="rotate-ccw" class="w-3 h-3"></i>
              <span>Khôi phục</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

// Archive / Unarchive Handler
function archiveContract(contractId, shouldArchive) {
  const c = contracts.find(item => item.id === contractId);
  if (!c) return;

  if (shouldArchive) {
    c.isArchived = true;
    c.stage = "completed";
    c.completedAt = getTodayDateString();
    if (!c.notes) c.notes = [];
    c.notes.unshift({
      date: getTodayDateString(),
      content: "Hợp đồng đã hoàn tất các thủ tục và được chuyển vào Kho Lưu Trữ."
    });
    showToast(`Đã chuyển hợp đồng ${c.id} vào Kho Lưu Trữ.`);
  } else {
    c.isArchived = false;
    c.stage = "active";
    c.completedAt = null;
    if (!c.notes) c.notes = [];
    c.notes.unshift({
      date: getTodayDateString(),
      content: "Khôi phục hợp đồng từ Kho Lưu Trữ về trạng thái Đang thực hiện."
    });
    showToast(`Đã khôi phục hợp đồng ${c.id} về trạng thái Đang thực hiện.`);
  }

  saveContracts();
  renderAllViews();
  if (currentDetailContractId === contractId) {
    populateDetailModal(c);
  }
}

// Render Analytics Charts
function renderAnalyticsCharts() {
  const activeContracts = contracts.filter(c => !c.isArchived);

  // 1. Stage Distribution Data
  const stageCounts = {
    draft: 0,
    review: 0,
    signing: 0,
    active: 0,
    expiring: 0
  };

  activeContracts.forEach(c => {
    if (stageCounts[c.stage] !== undefined) {
      stageCounts[c.stage]++;
    }
  });

  const stageLabels = ["Soạn thảo", "Chờ duyệt", "Chờ ký kết", "Đang thực hiện", "Sắp hết hạn"];
  const stageData = [
    stageCounts.draft,
    stageCounts.review,
    stageCounts.signing,
    stageCounts.active,
    stageCounts.expiring
  ];

  const ctxStage = document.getElementById("chartStageDistribution");
  if (ctxStage) {
    if (stageDistributionChart) stageDistributionChart.destroy();
    stageDistributionChart = new Chart(ctxStage, {
      type: "doughnut",
      data: {
        labels: stageLabels,
        datasets: [{
          data: stageData,
          backgroundColor: ["#94a3b8", "#f59e0b", "#a855f7", "#3b82f6", "#f43f5e"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 11, family: "Plus Jakarta Sans" } }
          }
        }
      }
    });
  }

  // 2. Value by Contract Type Data
  const typeValues = {};
  CONTRACT_TYPES.forEach(t => typeValues[t] = 0);

  contracts.forEach(c => {
    const t = c.contractType || "Khác";
    typeValues[t] = (typeValues[t] || 0) + (Number(c.value) || 0);
  });

  const filteredTypeLabels = Object.keys(typeValues).filter(t => typeValues[t] > 0);
  const filteredTypeValues = filteredTypeLabels.map(t => typeValues[t] / 1000000); // quy về triệu VNĐ

  const ctxType = document.getElementById("chartTypeValue");
  if (ctxType) {
    if (typeValueChart) typeValueChart.destroy();
    typeValueChart = new Chart(ctxType, {
      type: "bar",
      data: {
        labels: filteredTypeLabels,
        datasets: [{
          label: "Giá trị (Triệu VNĐ)",
          data: filteredTypeValues,
          backgroundColor: "#4f46e5",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `${value} tr`
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// Master Render All
function renderAllViews() {
  updateDailyBriefing();
  renderPipelineView();
  renderTableView();
  renderArchiveView();
  if (activeTab === "analytics") {
    renderAnalyticsCharts();
  }
}

// Detail Modal Handling
function openDetailModal(contractId) {
  const c = contracts.find(item => item.id === contractId);
  if (!c) return;

  currentDetailContractId = contractId;
  populateDetailModal(c);

  const modal = document.getElementById("detailModal");
  modal.classList.remove("hidden");
  lucide.createIcons();
}

function closeDetailModal() {
  document.getElementById("detailModal").classList.add("hidden");
  currentDetailContractId = null;
}

function populateDetailModal(c) {
  const stageInfo = STAGES[c.stage] || STAGES.draft;

  // Header
  document.getElementById("detailBadgeStage").className = `px-3 py-1 rounded-full text-xs font-bold border ${stageInfo.badgeClass}`;
  document.getElementById("detailBadgeStage").textContent = stageInfo.name;
  document.getElementById("detailContractCode").textContent = c.id;
  document.getElementById("detailTitle").textContent = c.title;
  document.getElementById("detailPartner").textContent = c.partner || "Chưa cập nhật";
  document.getElementById("detailPartnerContact").textContent = c.partnerContact || "Chưa có thông tin liên hệ";
  document.getElementById("detailAssignee").textContent = c.assignee || "Chưa gán";

  // 3 Highlights
  document.getElementById("detailValue").textContent = formatCurrencyVN(c.value);
  document.getElementById("detailType").textContent = `Loại: ${c.contractType || "Khác"}`;
  document.getElementById("detailDateRange").textContent = `${formatDateVN(c.startDate)} - ${formatDateVN(c.endDate)}`;

  const daysLeft = getDaysRemaining(c.endDate);
  const remainingEl = document.getElementById("detailRemainingDays");
  if (c.isArchived) {
    remainingEl.textContent = `Đã lưu trữ ngày: ${formatDateVN(c.completedAt || c.endDate)}`;
  } else if (daysLeft !== null) {
    if (daysLeft < 0) {
      remainingEl.innerHTML = `<span class="text-rose-600 font-bold">Đã hết hạn ${Math.abs(daysLeft)} ngày trước</span>`;
    } else {
      remainingEl.textContent = `Thời hạn còn lại: ${daysLeft} ngày`;
    }
  } else {
    remainingEl.textContent = "Chưa thiết lập ngày kết thúc";
  }

  // Next action
  document.getElementById("detailNextDueDate").textContent = `Hạn xử lý: ${formatDateVN(c.nextActionDate)}`;
  document.getElementById("detailNextNote").textContent = c.nextActionNote || "Chưa có công việc được lên lịch";

  // Stage Switcher Buttons
  const stageBtnContainer = document.getElementById("detailStageButtons");
  stageBtnContainer.innerHTML = Object.values(STAGES).map(st => {
    const isCurrent = c.stage === st.id;
    return `
      <button onclick="changeStage('${c.id}', '${st.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${isCurrent ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'}">
        ${st.name}
      </button>
    `;
  }).join("");

  // Documents list
  const docContainer = document.getElementById("detailDocumentsList");
  if (c.documents && c.documents.length > 0) {
    docContainer.innerHTML = c.documents.map(doc => `
      <div class="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 cursor-pointer">
        <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-600"></i>
        <span>${doc}</span>
      </div>
    `).join("");
  } else {
    docContainer.innerHTML = `<span class="text-xs text-slate-400 italic">Không có tài liệu đính kèm</span>`;
  }

  // Timeline / Notes list
  const timelineContainer = document.getElementById("detailTimelineList");
  if (c.notes && c.notes.length > 0) {
    timelineContainer.innerHTML = c.notes.map(n => `
      <div class="relative pb-2">
        <div class="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white"></div>
        <div class="text-[11px] font-semibold text-slate-500">${formatDateVN(n.date)}</div>
        <div class="text-xs text-slate-800 mt-0.5">${n.content}</div>
      </div>
    `).join("");
  } else {
    timelineContainer.innerHTML = `<div class="text-xs text-slate-400 italic">Chưa có nhật ký hoạt động</div>`;
  }

  // Archive toggle button text
  const archiveBtnText = document.getElementById("btnArchiveToggleText");
  if (c.isArchived) {
    archiveBtnText.textContent = "Khôi phục hợp đồng";
  } else {
    archiveBtnText.textContent = "Chuyển vào kho lưu trữ";
  }
}

// Add Note to Detail Contract
function addNoteToCurrentContract() {
  if (!currentDetailContractId) return;
  const c = contracts.find(item => item.id === currentDetailContractId);
  if (!c) return;

  const input = document.getElementById("inputNewNote");
  const text = (input.value || "").trim();
  if (!text) return;

  if (!c.notes) c.notes = [];
  c.notes.unshift({
    date: getTodayDateString(),
    content: text
  });

  input.value = "";
  saveContracts();
  populateDetailModal(c);
  showToast("Đã ghi nhận thêm một cập nhật tiến độ!");
}

// Create / Edit Modal Handling
function openNewContractModal() {
  document.getElementById("modalContractTitle").textContent = "Thêm Hợp Đồng Mới";
  document.getElementById("btnSubmitFormText").textContent = "Tạo hợp đồng";
  document.getElementById("contractForm").reset();
  document.getElementById("formContractIdHidden").value = "";

  // Auto-generate next ID
  const nextNum = contracts.length + 1;
  document.getElementById("formContractCode").value = `HD-2026-${String(nextNum).padStart(3, "0")}`;
  document.getElementById("formStartDate").value = getTodayDateString();
  document.getElementById("formNextActionDate").value = getTodayDateString();

  document.getElementById("contractModal").classList.remove("hidden");
  lucide.createIcons();
}

function openEditModal(contractId) {
  const c = contracts.find(item => item.id === contractId);
  if (!c) return;

  document.getElementById("modalContractTitle").textContent = "Chỉnh Sửa Hợp Đồng";
  document.getElementById("btnSubmitFormText").textContent = "Cập nhật thay đổi";
  document.getElementById("formContractIdHidden").value = c.id;

  document.getElementById("formContractCode").value = c.id;
  document.getElementById("formContractType").value = c.contractType || CONTRACT_TYPES[0];
  document.getElementById("formPriority").value = c.priority || "medium";
  document.getElementById("formContractTitle").value = c.title || "";
  document.getElementById("formPartner").value = c.partner || "";
  document.getElementById("formPartnerContact").value = c.partnerContact || "";
  document.getElementById("formValue").value = c.value || 0;
  document.getElementById("formAssignee").value = c.assignee || "";
  document.getElementById("formStartDate").value = c.startDate || "";
  document.getElementById("formEndDate").value = c.endDate || "";
  document.getElementById("formStage").value = c.stage || "draft";
  document.getElementById("formNextActionDate").value = c.nextActionDate || "";
  document.getElementById("formNextActionNote").value = c.nextActionNote || "";
  document.getElementById("formDocuments").value = c.documents ? c.documents.join(", ") : "";

  document.getElementById("contractModal").classList.remove("hidden");
  lucide.createIcons();
}

function closeContractModal() {
  document.getElementById("contractModal").classList.add("hidden");
}

function handleContractFormSubmit(e) {
  e.preventDefault();

  const hiddenId = document.getElementById("formContractIdHidden").value;
  const code = document.getElementById("formContractCode").value.trim();
  const title = document.getElementById("formContractTitle").value.trim();
  const contractType = document.getElementById("formContractType").value;
  const priority = document.getElementById("formPriority").value;
  const partner = document.getElementById("formPartner").value.trim();
  const partnerContact = document.getElementById("formPartnerContact").value.trim();
  const value = parseFloat(document.getElementById("formValue").value) || 0;
  const assignee = document.getElementById("formAssignee").value.trim();
  const startDate = document.getElementById("formStartDate").value;
  const endDate = document.getElementById("formEndDate").value;
  const stage = document.getElementById("formStage").value;
  const nextActionDate = document.getElementById("formNextActionDate").value || null;
  const nextActionNote = document.getElementById("formNextActionNote").value.trim();
  const docsRaw = document.getElementById("formDocuments").value.trim();
  const documents = docsRaw ? docsRaw.split(",").map(d => d.trim()).filter(Boolean) : [];

  if (hiddenId) {
    // Edit existing
    const existing = contracts.find(c => c.id === hiddenId);
    if (!existing) return;

    existing.id = code;
    existing.title = title;
    existing.contractType = contractType;
    existing.priority = priority;
    existing.partner = partner;
    existing.partnerContact = partnerContact;
    existing.value = value;
    existing.assignee = assignee;
    existing.startDate = startDate;
    existing.endDate = endDate;
    existing.stage = stage;
    existing.nextActionDate = nextActionDate;
    existing.nextActionNote = nextActionNote;
    existing.documents = documents;

    if (stage === "completed") {
      existing.isArchived = true;
      if (!existing.completedAt) existing.completedAt = getTodayDateString();
    }

    showToast(`Đã cập nhật thông tin hợp đồng ${code}`);
  } else {
    // Create new
    const isCompleted = stage === "completed";
    const newContract = {
      id: code,
      title,
      partner,
      partnerContact,
      contractType,
      value,
      startDate,
      endDate,
      nextActionDate,
      nextActionNote,
      priority,
      stage,
      assignee,
      notes: [
        { date: getTodayDateString(), content: "Khởi tạo hợp đồng mới trên hệ thống" }
      ],
      documents,
      isArchived: isCompleted,
      completedAt: isCompleted ? getTodayDateString() : null
    };

    contracts.unshift(newContract);
    showToast(`Đã thêm thành công hợp đồng ${code}`);
  }

  saveContracts();
  closeContractModal();
  renderAllViews();
}

// Delete Contract
function deleteContract(contractId) {
  if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hợp đồng ${contractId}? Hành động này không thể hoàn tác.`)) {
    return;
  }

  contracts = contracts.filter(c => c.id !== contractId);
  saveContracts();
  closeDetailModal();
  renderAllViews();
  showToast(`Đã xóa hợp đồng ${contractId}`, "warn");
}

// Export / Import Data
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contracts, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = getTodayDateString();
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ContractFlow_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Đã xuất file sao lưu dữ liệu JSON thành công!");
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        contracts = parsed;
        saveContracts();
        renderAllViews();
        showToast(`Đã phục hồi thành công ${parsed.length} hợp đồng từ file!`);
      } else {
        showToast("Định dạng file sao lưu không hợp lệ!", "error");
      }
    } catch (err) {
      showToast("Lỗi khi đọc file JSON!", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // reset input
}

function resetDemoData() {
  if (!confirm("Bạn có muốn tải lại toàn bộ danh sách hợp đồng mẫu ban đầu không? Dữ liệu hiện tại sẽ được thay thế.")) {
    return;
  }
  contracts = JSON.parse(JSON.stringify(initialContracts));
  saveContracts();
  renderAllViews();
  showToast("Đã khôi phục dữ liệu mẫu thành công!");
}

// Tab Switching
function switchTab(tabId) {
  activeTab = tabId;

  const tabButtons = {
    pipeline: document.getElementById("tabPipeline"),
    table: document.getElementById("tabTable"),
    archive: document.getElementById("tabArchive"),
    analytics: document.getElementById("tabAnalytics")
  };

  const viewSections = {
    pipeline: document.getElementById("viewPipeline"),
    table: document.getElementById("viewTable"),
    archive: document.getElementById("viewArchive"),
    analytics: document.getElementById("viewAnalytics")
  };

  Object.keys(tabButtons).forEach(key => {
    const btn = tabButtons[key];
    const sec = viewSections[key];
    if (key === tabId) {
      btn.className = "tab-btn active px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition bg-blue-600 text-white shadow-sm shadow-blue-600/30";
      sec.classList.remove("hidden");
    } else {
      btn.className = "tab-btn px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition bg-white text-slate-700 hover:bg-slate-100 border border-slate-200";
      sec.classList.add("hidden");
    }
  });

  if (tabId === "analytics") {
    renderAnalyticsCharts();
  }

  lucide.createIcons();
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadContracts();
  updateHeaderDate();

  // Populate Contract Types in Filter and Form Select
  const filterTypeSelect = document.getElementById("filterTypeSelect");
  const formContractType = document.getElementById("formContractType");

  CONTRACT_TYPES.forEach(type => {
    const optFilter = document.createElement("option");
    optFilter.value = type;
    optFilter.textContent = type;
    filterTypeSelect.appendChild(optFilter);

    const optForm = document.createElement("option");
    optForm.value = type;
    optForm.textContent = type;
    formContractType.appendChild(optForm);
  });

  // Tab Events
  document.getElementById("tabPipeline").addEventListener("click", () => switchTab("pipeline"));
  document.getElementById("tabTable").addEventListener("click", () => switchTab("table"));
  document.getElementById("tabArchive").addEventListener("click", () => switchTab("archive"));
  document.getElementById("tabAnalytics").addEventListener("click", () => switchTab("analytics"));

  // Search & Filter Events
  document.getElementById("searchInput").addEventListener("input", (e) => {
    currentFilter.search = e.target.value.trim();
    renderAllViews();
  });

  document.getElementById("filterTypeSelect").addEventListener("change", (e) => {
    currentFilter.type = e.target.value;
    renderAllViews();
  });

  document.getElementById("filterPrioritySelect").addEventListener("change", (e) => {
    currentFilter.priority = e.target.value;
    renderAllViews();
  });

  // Backup & Restore Events
  document.getElementById("btnExportData").addEventListener("click", exportData);
  document.getElementById("btnExportArchive").addEventListener("click", exportData);
  document.getElementById("importFileInput").addEventListener("change", importData);
  document.getElementById("btnResetDemo").addEventListener("click", resetDemoData);

  // Toggle Morning Briefing Action List
  const toggleBtn = document.getElementById("toggleBriefingListBtn");
  const briefingContainer = document.getElementById("briefingItemsContainer");
  const toggleText = document.getElementById("toggleBriefingText");
  const toggleIcon = document.getElementById("toggleBriefingIcon");

  toggleBtn.addEventListener("click", () => {
    const isHidden = briefingContainer.classList.contains("hidden");
    if (isHidden) {
      briefingContainer.classList.remove("hidden");
      toggleText.textContent = "Thu gọn danh sách";
      toggleIcon.setAttribute("data-lucide", "chevron-up");
    } else {
      briefingContainer.classList.add("hidden");
      toggleText.textContent = "Mở rộng danh sách";
      toggleIcon.setAttribute("data-lucide", "chevron-down");
    }
    lucide.createIcons();
  });

  // Modal Open/Close Events
  document.getElementById("btnOpenNewContractModal").addEventListener("click", openNewContractModal);
  document.getElementById("btnCloseModal").addEventListener("click", closeContractModal);
  document.getElementById("btnCancelModal").addEventListener("click", closeContractModal);
  document.getElementById("contractForm").addEventListener("submit", handleContractFormSubmit);

  // Detail Modal Events
  document.getElementById("btnCloseDetailModal").addEventListener("click", closeDetailModal);
  document.getElementById("btnAddNote").addEventListener("click", addNoteToCurrentContract);
  document.getElementById("inputNewNote").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNoteToCurrentContract();
    }
  });

  document.getElementById("btnEditDetail").addEventListener("click", () => {
    if (currentDetailContractId) {
      const id = currentDetailContractId;
      closeDetailModal();
      openEditModal(id);
    }
  });

  document.getElementById("btnDeleteDetail").addEventListener("click", () => {
    if (currentDetailContractId) {
      deleteContract(currentDetailContractId);
    }
  });

  document.getElementById("btnArchiveToggleDetail").addEventListener("click", () => {
    if (currentDetailContractId) {
      const c = contracts.find(item => item.id === currentDetailContractId);
      if (c) {
        archiveContract(c.id, !c.isArchived);
      }
    }
  });

  document.getElementById("btnPrintContract").addEventListener("click", () => {
    window.print();
  });

  // Initial Render
  renderAllViews();
  lucide.createIcons();
});
