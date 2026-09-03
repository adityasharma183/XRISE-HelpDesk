# 🔑 Predefined Credentials & Access Guide

This document lists all predefined user accounts, roles, access permissions, and test data for evaluating and testing the **XRISEAI Mini Helpdesk** platform.

---

## 👥 Predefined Staff Accounts

| Role | Full Name | Email Address | Password | Key Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **👑 ADMIN** | System Admin | `admin@xriseai.com` | `admin@123` | Global ticket overview, round-robin auto-assignment, manual reassignment to any agent, full agent roster access, replying, and status updates. |
| **🛡️ AGENT 1** | Aarav Sharma | `agent1@xriseai.com` | `agent1@123` | Scoped to assigned tickets, posting replies, updating ticket statuses (with automated customer email notifications on resolve/close), and generating AI draft replies. |
| **🛡️ AGENT 2** | Ananya Patel | `agent2@xriseai.com` | `agent2@123` | Scoped to assigned tickets, posting replies, updating ticket statuses, and generating AI draft replies. |
| **🛡️ AGENT 3** | Rohan Verma | `agent3@xriseai.com` | `agent3@123` | Scoped to assigned tickets, posting replies, updating ticket statuses, and generating AI draft replies. |

---

## 🌐 Application URLs

- **Frontend Customer Portal**: [http://localhost:5173](http://localhost:5173)
- **Customer Ticket Submission**: [http://localhost:5173/submit-ticket](http://localhost:5173/submit-ticket)
- **Customer Ticket Status Check**: [http://localhost:5173/check-status](http://localhost:5173/check-status)
- **Direct Contact & Feedback Portal**: [http://localhost:5173/get-in-touch](http://localhost:5173/get-in-touch)
- **Staff Sign-In Page**: [http://localhost:5173/login](http://localhost:5173/login)
- **Agent/Admin Dashboard**: [http://localhost:5173/agent/dashboard](http://localhost:5173/agent/dashboard)
- **Backend API Health Check (Local Dev)**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Backend API Health Check (Docker)**: [http://localhost:5001/api/health](http://localhost:5001/api/health) or [http://localhost:5173/api/health](http://localhost:5173/api/health)


---


## 🎫 Pre-seeded Sample Tickets for Testing

| Ticket ID | Customer Email | Customer Name | Initial Priority | Status | Assigned Agent | Subject |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `XR-9A2K4B` | `alice.johnson@example.com` | Alice Johnson | `HIGH` | `IN_PROGRESS` | Aarav Sharma (Agent 1) | Unable to connect custom domain to workspace |
| `XR-3M8V1P` | `david.miller@enterprise.io` | David Miller | `URGENT` | `OPEN` | Ananya Patel (Agent 2) | Urgent: Webhook payloads timing out during peak load |
| `XR-7X4W9Q` | `elena.rostova@techflow.co` | Elena Rostova | `MEDIUM` | `OPEN` | Rohan Verma (Agent 3) | Inquiry regarding SSO / SAML 2.0 integration with Okta |
| `XR-5H1L8Z` | `marcus.v@innovate.net` | Marcus Vance | `LOW` | `RESOLVED` | Aarav Sharma (Agent 1) | Billing inquiry: Invoice duplicate charge for May |

---

## 🧪 Testing Scenarios & User Flows

### Scenario 1: Customer Ticket Submission & Lookup
1. Go to [http://localhost:5173/submit-ticket](http://localhost:5173/submit-ticket).
2. Submit a new ticket. Take note of the generated **Ticket ID** (e.g. `XR-XXXXXX`).
3. Go to [http://localhost:5173/check-status](http://localhost:5173/check-status).
4. Enter the **Ticket ID** and **Email** to check status and view agent replies.

### Scenario 2: Agent Isolation (RBAC)
1. Sign in as **Agent 1** (`agent1@xriseai.com` / `agent1@123`).
2. Notice you only see tickets assigned to Agent 1 (`XR-9A2K4B`, `XR-5H1L8Z`).
3. Open a ticket, click **"✨ Generate AI Draft Reply"**, and send a reply.
4. Sign in as **Agent 2** (`agent2@xriseai.com` / `agent2@123`).
5. Notice you only see tickets assigned to Agent 2 (`XR-3M8V1P`).

### Scenario 3: Admin Reassignment & Global View
1. Sign in as **Admin** (`admin@xriseai.com` / `admin@123`).
2. Notice you see **all tickets** across the entire team with global KPI metrics.
3. Open any ticket and use the **Reassign Ticket** dropdown in the sidebar to reassign it to another agent.

---

## 🔄 Re-seeding the Database
If you ever want to reset the database to clean demo data, run:
```bash
npm run seed
```
