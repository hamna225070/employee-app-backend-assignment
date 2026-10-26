const form = document.getElementById("employeeForm");
const rows = document.getElementById("employeeRows");
const message = document.getElementById("message");
const count = document.getElementById("count");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function safe(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

async function loadEmployees() {
  rows.innerHTML = '<tr><td colspan="6" class="empty">Loading employees…</td></tr>';
  try {
    const employees = await api("/api/employees");
    count.textContent = `${employees.length} employee${employees.length === 1 ? "" : "s"}`;
    if (!employees.length) {
      rows.innerHTML = '<tr><td colspan="6" class="empty">No employees yet. Add the first employee above.</td></tr>';
      return;
    }
    rows.innerHTML = employees.map((employee) => `
      <tr>
        <td>${safe(employee.name)}</td>
        <td>${safe(employee.email)}</td>
        <td>${safe(employee.department)}</td>
        <td>${safe(employee.position)}</td>
        <td>${safe(employee.phone)}</td>
        <td><div class="row-actions">
          <button class="small" data-action="edit" data-id="${safe(employee._id)}">Edit</button>
          <button class="danger" data-action="delete" data-id="${safe(employee._id)}">Delete</button>
        </div></td>
      </tr>`).join("");
  } catch (error) {
    rows.innerHTML = `<tr><td colspan="6" class="empty">${safe(error.message)} Check that the server and MongoDB connection are running.</td></tr>`;
    count.textContent = "Unavailable";
  }
}

function resetForm() {
  form.reset();
  document.getElementById("employeeId").value = "";
  formTitle.textContent = "Add an employee";
  saveBtn.textContent = "Save employee";
  cancelBtn.classList.add("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("employeeId").value;
  const employee = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    department: document.getElementById("department").value.trim(),
    position: document.getElementById("position").value.trim(),
    phone: document.getElementById("phone").value.trim()
  };
  try {
    await api(id ? `/api/employees/${id}` : "/api/employees", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(employee)
    });
    showMessage(id ? "Employee updated successfully." : "Employee added successfully.");
    resetForm();
    await loadEmployees();
  } catch (error) {
    showMessage(error.message, true);
  }
});

rows.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "edit") {
    try {
      const employee = await api(`/api/employees/${id}`);
      document.getElementById("employeeId").value = employee._id;
      document.getElementById("name").value = employee.name || "";
      document.getElementById("email").value = employee.email || "";
      document.getElementById("department").value = employee.department || "";
      document.getElementById("position").value = employee.position || "";
      document.getElementById("phone").value = employee.phone || "";
      formTitle.textContent = "Edit employee";
      saveBtn.textContent = "Update employee";
      cancelBtn.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      showMessage("Update the fields and click Update employee.");
    } catch (error) {
      showMessage(error.message, true);
    }
  } else if (action === "delete") {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;
    try {
      await api(`/api/employees/${id}`, { method: "DELETE" });
      showMessage("Employee deleted successfully.");
      await loadEmployees();
    } catch (error) {
      showMessage(error.message, true);
    }
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  showMessage("");
});
document.getElementById("refreshBtn").addEventListener("click", loadEmployees);
loadEmployees();
