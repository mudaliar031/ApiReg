# API Registration System - Complete Guide

## Overview
This is a role-based API registration platform where users can register their APIs and administrators can manage both APIs and users. The system has two main dashboards with different features based on user roles.

---

## 🔑 Login System

### How it Works:
- **Two Types of Users:**
  1. **Regular Users** - Can register APIs and view their own dashboard
  2. **Administrators** - Have full control over the platform

- **Login Process:**
  - Users select their role (User or Admin) using tabs
  - Enter email and password
  - System stores the role in browser memory (localStorage)
  - Redirects to appropriate dashboard based on role

---

## 👤 USER DASHBOARD

### What Users Can Do:

#### 1. **View Registered APIs**
- See a list of all APIs you've registered
- Each API shows:
  - **API Name** (e.g., "Weather Pro API")
  - **Endpoint URL** (e.g., "https://api.weatherpro.com")
  - **Status Badge:**
    - 🟢 **Active** (green) - API is approved and working
    - 🟡 **Pending** (yellow) - Waiting for admin approval
    - 🔴 **Rejected** (red) - Admin rejected the request
    - ⚫ **Revoked** (gray) - Admin removed access
  - **Registration Date** - When you submitted the API

#### 2. **Search and Filter**
- **Search Box**: Type API name or endpoint URL to find specific APIs
- **Filter Dropdown**: Show only APIs with specific status (All/Active/Pending/Rejected)

#### 3. **Action Buttons** (For Each API)
- **👁️ Eye Icon**: View complete details including all configuration fields
- **✏️ Edit Icon**: Modify API details and configuration
- **📋 Copy Icon**: Copy endpoint URL to clipboard
- **🗑️ Delete Icon**: Remove the API registration

#### 4. **Statistics at Top**
- **Total APIs**: How many APIs you've registered
- **Active**: How many are currently approved
- **Pending**: How many are waiting for approval
- **Requests Today**: Number of API calls made today (mock data)

#### 5. **Register New API Button**
- Click the blue "Register New API" button at the top
- Takes you to registration form

---

## 📝 USER - REGISTER API PAGE

### How to Register an API:

#### Step 1: Basic Information
- **API Name**: Give your API a recognizable name (e.g., "Payment Gateway")
- **Endpoint URL**: Enter the complete API URL (e.g., "https://api.example.com/v1")

#### Step 2: Configuration Fields (Dynamic!)
- **Add Custom Fields** for your API authentication:
  - Click "+ Add Field" button
  - **Field Key**: Name of the field (e.g., "Authorization", "API-Key", "Content-Type")
  - **Field Value**: The actual value (e.g., "Bearer token_xyz123")
  - **Add Multiple Fields**: You can add as many as you need
  - **Remove Fields**: Click the ❌ button to remove unwanted fields

#### Step 3: Submit
- Click "Submit Request" button
- API goes to "Pending" status
- Wait for admin approval
- You'll see a confirmation message

#### What Happens Next:
- Your request appears in the Admin Dashboard
- Admin reviews your API details
- Admin can **Approve** (makes it Active) or **Reject** it
- You see the status update in your dashboard

---

## 👨‍💼 ADMIN DASHBOARD

### What Administrators Can Do:

#### 1. **View All API Requests**
- See every API registration from all users
- Table shows:
  - **Requester Info**: User's name and email with profile icon
  - **API Details**: Name and endpoint URL
  - **Status**: Current approval status
  - **Date**: When the request was submitted

#### 2. **Quick Statistics Cards**
- **Total APIs**: Count of all API registrations
- **Pending Approval**: How many need review (yellow)
- **Active APIs**: How many are approved (green)
- **Suspended APIs**: How many are revoked (red)

#### 3. **Action Buttons for Each Request**

**For PENDING Requests:**
- **👁️ Eye Icon**: View full details (opens detailed modal)
- **✅ Check Icon**: Approve the request (makes it Active)
- **❌ X Icon**: Reject the request
- **⋮ Three Dots Menu**: More options (Revoke, Delete, etc.)

**For ACTIVE/REJECTED Requests:**
- **👁️ Eye Icon**: View full details
- **⋮ Three Dots Menu**: Additional actions

#### 4. **View Full API Details Modal (Eye Icon)**
When clicking the eye icon, admin sees a beautiful popup showing:
- **User Information:**
  - Full name of the person who registered it
  - Their email address
  
- **API Configuration:**
  - Complete API name
  - Full endpoint URL
  
- **Configuration Fields:**
  - All custom fields the user added
  - Keys and values (like Authorization headers, API keys, etc.)
  
- **Quick Actions:**
  - **Approve Button** (green) - Makes API active
  - **Reject Button** (red) - Denies the request

#### 5. **Search Function**
- Type in the search box to find specific:
  - API names
  - User names
  - Any keyword in the table

#### 6. **Filter Button**
- Click "Filter" to open filtering options
- Filter by:
  - **Status**: All/Pending/Active/Rejected/Revoked
  - **Date Range**: All Time/Today/This Week/This Month
- Click "Apply Filters" to see filtered results
- Click "Reset" to clear all filters

---

## 👥 ADMIN - MANAGE USERS PAGE

### Accessing This Page:
- Click "Manage Users" in the left sidebar
- Shows all registered users in the system

### What You Can See:

#### 1. **User Statistics (Top Cards)**
- **Total Users**: Count of all registered users
- **Active Users**: Users who can use the system
- **Suspended**: Users whose access is blocked
- **Admins**: Number of administrator accounts

#### 2. **User Table Shows:**
For each user:
- **Profile Icon**: Shows first letter of name (purple for admins)
- **Name and Email**: User's full details
- **Role**: USER or ADMIN (purple for admins)
- **Status**: Active (green) or Suspended (red)
- **APIs Count**: How many APIs this user registered (with progress bar)
- **Join Date**: When they created their account

#### 3. **Action Buttons for Each User:**

- **👁️ Eye Icon - View APIs**:
  - Opens a modal showing ALL APIs this user has registered
  - Each API shows:
    - API name and endpoint
    - Configuration fields
    - Current status
  - **Special Admin Actions in This Modal:**
    - **✅ Check Button**: Approve pending APIs
    - **🚫 Ban Button**: Revoke/block API access
  
- **🚫 Ban Icon**: Suspend the user (turns status to Suspended)
  - Only shows for Active users
  - Suspended users can't use the system
  
- **✅ Check Icon**: Activate suspended user
  - Only shows for Suspended users
  - Restores their access
  
- **🗑️ Delete Icon**: Permanently remove user
  - Shows confirmation dialog
  - Cannot be undone!

#### 4. **Add New User Button**
- Click "+ Add New User" (top right)
- Opens form with fields:
  - **Full Name**: User's name (e.g., "Raj Kumar")
  - **Email Address**: For login
  - **Password**: Account password
  - **Role**: Choose User or Admin (radio buttons)
- Click "Add User" to create the account
- New user appears in the table immediately

#### 5. **Search Users**
- Use search box to find users by:
  - Name
  - Email address
- Results filter automatically as you type

---

## ⚙️ ADMIN - SYSTEM CONFIG PAGE

### Purpose:
- Configure platform-wide settings
- Currently shows a placeholder for future settings
- Admin can customize system behavior here

---

## 🎨 KEY FEATURES EXPLAINED

### 1. **Color-Coded Status System**
Throughout the app, statuses use consistent colors:
- **🟢 Green (Active/Approved)**: Everything is working
- **🟡 Yellow (Pending)**: Waiting for action
- **🔴 Red (Rejected/Suspended)**: Blocked or denied
- **⚫ Gray (Revoked)**: Access removed

### 2. **Real-Time Feedback**
- Every action shows a notification:
  - ✅ Success (green notification)
  - ⚠️ Warning (yellow notification)
  - ❌ Error (red notification)
- Notifications appear in top-right corner

### 3. **Responsive Design**
- Works on desktop, tablet, and mobile
- Tables scroll horizontally on small screens
- Sidebar collapses on mobile devices

### 4. **Data Persistence**
- Your data stays even after closing the browser
- Uses browser's localStorage (for demo purposes)
- In production, this would connect to a real database

### 5. **Role-Based Access**
- Users can only see their own data
- Admins can see and manage everything
- Sidebar menu changes based on role

---

## 📱 NAVIGATION EXPLAINED

### User Navigation (Sidebar):
1. **User Dashboard** - See your APIs
2. **Register API** - Add new API

### Admin Navigation (Sidebar):
1. **Admin Panel** - Main dashboard with all requests
2. **Management Section**:
   - **Manage Users** - View and control user accounts
   - **System Config** - Platform settings

### Common Elements:
- **User Profile** at bottom of sidebar (shows your name)
- **Log Out** button (red) - Returns to login page

---

## 💡 COMMON WORKFLOWS

### For Users:

**Workflow 1: Register a New API**
1. Click "Register New API" button
2. Enter API name and endpoint URL
3. Add configuration fields (Authorization, API keys, etc.)
4. Click "Submit Request"
5. Wait for admin approval
6. Check status in User Dashboard

**Workflow 2: Edit Existing API**
1. Go to User Dashboard
2. Find your API in the list
3. Click the ✏️ Edit icon
4. Modify details in the modal
5. Click "Save Changes"

**Workflow 3: Check API Status**
1. Log in to User Dashboard
2. Look at the status badge on each API
3. Click 👁️ Eye icon to see full details

### For Administrators:

**Workflow 1: Approve an API Request**
1. Go to Admin Dashboard
2. Find pending request (yellow badge)
3. Click 👁️ Eye icon to review details
4. Click green "Approve" button
5. API becomes Active for the user

**Workflow 2: Review User's APIs**
1. Go to "Manage Users" page
2. Find the user in the table
3. Click 👁️ Eye icon next to their name
4. See all their APIs with actions to approve/revoke

**Workflow 3: Suspend a User**
1. Go to "Manage Users" page
2. Find the user
3. Click 🚫 Ban icon
4. User loses access immediately
5. Click ✅ Check icon to restore access

---

## 🔍 SEARCH AND FILTER TIPS

### Search Best Practices:
- **Case-insensitive**: Typing "raj" finds "Raj"
- **Partial matches**: Typing "wea" finds "Weather Pro API"
- **Works on multiple fields**: Searches names, emails, endpoints

### Filter Usage:
- Combine search and filters for precise results
- Reset filters to see all data again
- Date filters help find recent requests

---

## 🎯 STATUS LIFECYCLE

**For API Requests:**
1. **Pending** → User submits → Waiting for review
2. **Active** → Admin approves → API is working
3. **Rejected** → Admin denies → User sees rejection
4. **Revoked** → Admin removes access → API stops working

**For Users:**
1. **Active** → Normal state → Can use system
2. **Suspended** → Admin blocks → Cannot access system

---

## 🛡️ SECURITY NOTE

This is a demo application with mock data. In a real production environment:
- Passwords would be encrypted
- API keys would be stored securely
- Authentication would use tokens
- Data would be in a secure database
- All actions would be logged

---

## 📊 MOCK DATA

The system includes sample data for demonstration:

**Sample Users:**
- Raj (raj@example.com) - Regular user
- Priya (priya@company.com) - Regular user
- Vikram (vikram@admin.com) - Administrator
- Ananya (ananya@tech.io) - Regular user

**Sample APIs:**
- Weather Pro API
- Stripe Webhook
- Legacy DB Sync
- Payment Gateway

All this data is for demonstration and can be modified/deleted.

---

## 🎨 UI ELEMENTS EXPLAINED

### Buttons:
- **Blue buttons** = Primary actions (Submit, Register)
- **Green buttons** = Approve/Activate
- **Red buttons** = Delete/Reject
- **Gray buttons** = Cancel/Close
- **Purple buttons** = Admin-specific actions

### Icons Guide:
- 👁️ = View/Show details
- ✏️ = Edit
- 🗑️ = Delete
- 📋 = Copy
- ✅ = Approve/Activate
- ❌ = Reject/Close
- 🚫 = Ban/Revoke
- ⋮ = More options menu
- 🔍 = Search
- 🔽 = Filter

---

## 💬 NOTIFICATIONS

The system shows toast notifications (small popups) for:
- ✅ **Success**: "API approved successfully"
- ⚠️ **Warning**: "API access revoked"
- ❌ **Error**: "API request rejected"
- ℹ️ **Info**: "API set to pending approval"

These appear in the top-right corner and disappear automatically after a few seconds.

---

This guide covers all features in simple terms. If you have questions about any specific feature, refer to the relevant section above!
