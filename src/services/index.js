// src/services/auth.service.js
import api from "./api";

export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data.data),

  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),

  me: () => api.get("/auth/me").then((r) => r.data.data),

  changePassword: (currentPassword, newPassword) =>
    api.patch("/auth/change-password", { currentPassword, newPassword }),
};

// src/services/tools.service.js — exportado abajo también
export const toolsService = {
  getAll: (params) => api.get("/resource", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/resource/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/resource", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/resource/${id}`, data).then((r) => r.data.data),
  patchAdmin: (id, data) =>
    api.patch(`/resource/${id}/edit`, data).then((r) => r.data.data),
  delete: (id) => api.delete(`/resource/${id}`),
};

export const assignmentsService = {
  getAll: (params) =>
    api.get("/assignments", { params }).then((r) => r.data.data),
  getByProject: (id) =>
    api.get(`/assignments/byproject/${id}`).then((r) => r.data.data),
  getOverdue: () => api.get("/assignments/overdue").then((r) => r.data.data),
  create: (data) => api.post("/assignments", data).then((r) => r.data.data),
  returnTool: (id, data) =>
    api.patch(`/assignments/${id}/return`, data).then((r) => r.data.data),
};

export const incidentsService = {
  getAll: (params) =>
    api.get("/incidents", { params }).then((r) => r.data.data),
  create: (data) => api.post("/incidents", data).then((r) => r.data.data),
  resolve: (id, data) =>
    api.patch(`/incidents/${id}/resolve`, data).then((r) => r.data.data),
};

export const projectsService = {
  getAll: (params) => api.get("/projects", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/projects/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/projects", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/projects/${id}`, data).then((r) => r.data.data),
};

export const projectWorkersService = {
  getByProject: (projectId) =>
    api.get(`/projects/${projectId}/workers`).then((r) => r.data.data),

  assign: (projectId, data) =>
    api.post(`/projects/${projectId}/workers`, data).then((r) => r.data.data),

  remove: (projectId, workerId) =>
    api.patch(`/projects/${projectId}/workers/${workerId}/remove`),
};

export const attendanceService = {
  getToday: (projectId) =>
    api.get(`/projects/${projectId}/attendance/today`).then((r) => r.data.data),

  create: (projectId, data) =>
    api
      .post(`/projects/${projectId}/attendance`, data)
      .then((r) => r.data.data),
};

export const subprojectsService = {
  getByProject: (proyectoId) =>
    api.get(`/contracts/by-project/${proyectoId}`).then((r) => r.data.data),
  getById: (id) => api.get(`/contracts/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/contracts", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/contracts/${id}`, data).then((r) => r.data.data),
};

export const tasksService = {
  getBySubproject: (subproyectoId) =>
    api.get(`/tasks/by-subproject/${subproyectoId}`).then((r) => r.data.data),
  create: (data) => api.post("/tasks", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/tasks/${id}`, data).then((r) => r.data.data),
};

export const usersService = {
  getAll: (params) => api.get("/users", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/users", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/users/${id}`, data).then((r) => r.data.data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

export const clientsService = {
  getAll: () => api.get("/clients").then((r) => r.data.data),
  getById: (id) => api.get(`/clients/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/clients", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/clients/${id}`, data).then((r) => r.data.data),
};

export const dashboardService = {
  getExecutive: () => api.get("/dashboard/executive").then((r) => r.data.data),
  getToolsSummary: () =>
    api.get("/dashboard/tools-summary").then((r) => r.data.data),
};

export const reportsService = {
  downloadWeekly: (startDate, endDate) =>
    api.get("/reports/weekly", {
      params: { startDate, endDate },
      responseType: "blob",
    }),

  downloadTools: (startDate, endDate) =>
    api.get("/reports/tools", {
      params: { startDate, endDate },
      responseType: "blob",
    }),

  downloadConsumables: (startDate, endDate) =>
    api.get("/reports/consumables", {
      params: { startDate, endDate },
      responseType: "blob",
    }),

  downloadIncidents: (startDate, endDate) =>
    api.get("/reports/incidents", {
      params: { startDate, endDate },
      responseType: "blob",
    }),

  downloadInventory: () =>
    api.get("/reports/inventory", { responseType: "blob" }),
};
export const financeService = {
  getAll: (params) => api.get("/finance", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/finance/${id}`).then((r) => r.data.data),
  create: (data) => api.post("/finance", data).then((r) => r.data.data),
  approve: (id, approved) =>
    api.patch(`/finance/${id}/approve`, { approved }).then((r) => r.data.data),
  getProjectSummary: (proyectoId) =>
    api.get(`/finance/summary/project/${proyectoId}`).then((r) => r.data.data),
};

export const unidadesMedidaService = {
  getAll: (params) =>
    api.get("/unidadesMedida", { params }).then((r) => r.data.data),

  getById: (id) => api.get(`/unidadesMedida/${id}`).then((r) => r.data.data),

  create: (data) => api.post("/unidadesMedida", data).then((r) => r.data.data),

  update: (id, data) =>
    api.put(`/unidadesMedida/${id}`, data).then((r) => r.data.data),

  delete: (id) => api.delete(`/unidadesMedida/${id}`).then((r) => r.data.data),
};
