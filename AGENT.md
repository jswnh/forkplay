Build a **complete, polished, production-ready web dashboard for a lightweight game platform**. Treat this as a full implementation task, not just a visual mockup. **Complete every feature described below, including the inbox/messaging system, and ensure all UI states and interactions work end-to-end.**

## Overall Visual Direction

Create a sleek, modern gaming dashboard displayed with a premium, minimal aesthetic.

The visual atmosphere should feel:

- Dark, elegant, and futuristic
- Minimal rather than overly “gamer” or neon-heavy
- Calm but energetic
- Premium and highly interactive
- Responsive across desktop, tablet, and mobile
- Smoothly animated without excessive motion

Use a dark-mode foundation with subtle glassmorphism, soft gradients, crisp borders, gentle shadows, and restrained accent colors.

The visual reference should feel like a high-end game launcher combined with a modern SaaS dashboard.

---

## Main Layout

Create a responsive application shell consisting of:

### Sidebar

Build a persistent dark-mode sidebar with:

- Platform logo/name at the top
- Navigation items:
  - Games
  - Store
  - Achievements
  - Inbox
  - Profile

- Settings at the bottom
- User avatar/profile shortcut
- Active navigation state
- Unread inbox badge
- Collapsible desktop sidebar
- Mobile navigation/drawer

Icons should have a clean, glass-like appearance with subtle hover lighting and smooth transitions.

The sidebar should feel lightweight and should never visually overpower the main content.

---

## Games Dashboard

The default page should be the **Games** dashboard.

Include:

### Header

- Greeting based on the user
- Search games input
- Notification/inbox shortcut
- User avatar
- Optional quick actions

### Featured Game

Create a large featured-game section with:

- Cover artwork
- Game title
- Short description
- Genre/category
- Rating
- Last played information
- Primary “Play” button
- Secondary action such as “View Details”

Use a cinematic background image with a subtle dark overlay.

### Game Grid

Create a dynamic responsive grid of game cards.

Each card should contain:

- Cover artwork
- Game title
- Genre
- Rating
- Play/launch button
- Favorite/bookmark action
- Optional progress indicator
- Hover animation
- Glossy reflective artwork treatment
- Gentle drop shadow

Add filtering/sorting controls such as:

- All Games
- Recently Played
- Favorites
- New
- Most Played

Include realistic loading, empty, and error states.

---

## Missing Username Modal

If a newly authenticated user does not have a username, automatically display a polished modal.

The modal should:

- Explain that a username is required
- Include username input
- Validate username format
- Check username availability
- Display inline validation errors
- Show loading state while checking/submitting
- Prevent submission of invalid usernames
- Save the username successfully
- Close automatically after successful completion

The modal should use a smooth matte surface rather than excessive transparency.

Do not allow the user to bypass required username setup unless explicitly designed as an optional flow.

---

# Inbox System

Implement a **complete inbox/messaging/notification system** for the platform.

This should be a real functional feature rather than a static inbox screen.

## Inbox Navigation

Add **Inbox** to the sidebar.

Display:

- Inbox icon
- Unread count badge
- Active state
- Smooth transition into the inbox

The unread count should update dynamically.

---

## Inbox Page

Create a dedicated inbox interface with:

### Header

- “Inbox” title
- Search messages
- Mark all as read
- Refresh
- Compose/new message button if messaging is supported

### Message Categories

Support tabs/filters such as:

- All
- Unread
- Mentions
- System
- Game
- Social

Each category should dynamically filter the inbox.

---

## Message List

Each inbox item should contain:

- Sender avatar/icon
- Sender name
- Message title
- Short preview
- Timestamp
- Read/unread state
- Message category
- Optional game icon
- Context/action menu

Unread messages should have a clear but subtle visual distinction.

Use relative timestamps where appropriate, such as:

- Just now
- 5m
- 2h
- Yesterday
- Aug 18

---

## Message Detail

Clicking an inbox item should open a detailed message view.

Include:

- Sender
- Avatar
- Timestamp
- Subject/title
- Full message
- Related game/content if applicable
- Actions such as:
  - Mark as unread
  - Archive
  - Delete
  - Report

- Back button on mobile

When a message is opened, automatically mark it as read.

---

## Notifications

The platform should be capable of generating system notifications for events such as:

- Game updates
- Achievement unlocked
- New game added
- Friend request
- Friend activity
- Store purchase
- Promotional event
- Platform announcements

These notifications should appear in the inbox and update the unread counter.

Design the notification architecture so new notification types can be added later without rewriting the entire inbox.

---

## Inbox States

Implement all required states:

- Loading
- Empty inbox
- No search results
- Unread messages
- Error state
- Deleted/archived state
- Message successfully marked as read
- Message successfully archived
- Message successfully deleted

Do not leave any major interaction as a non-functional placeholder.

---

# Store

Create a modern game store page.

Include:

- Featured games
- New releases
- Popular games
- Categories
- Search
- Filters
- Game cards
- Game detail page
- Price
- Rating
- Purchase/get button
- Wishlist/favorite action

If payments are not being implemented, use a realistic mock purchase flow while keeping the architecture ready for a real payment provider.

---

# Achievements

Create an achievements dashboard containing:

- Overall completion percentage
- Total achievements
- Unlocked achievements
- Locked achievements
- Recently unlocked achievements
- Achievement cards
- Progress indicators
- Rarity indicators

Each achievement should have:

- Icon
- Title
- Description
- Game
- Unlock percentage/rarity
- Unlock date if completed
- Progress if incomplete

Add filtering by game and completion state.

---

# Profile

Create a polished user profile page containing:

- Avatar
- Username
- Display name
- Account information
- Games played
- Achievements
- Playtime
- Favorite games
- Recent activity
- Profile editing

Allow the user to edit appropriate profile fields.

---

# Authentication

Implement a complete authentication flow.

Support:

- Google authentication
- Authentication loading states
- Authenticated application state
- Logged-out state
- Sign out
- Protected routes/pages

After first authentication, determine whether the user has a username.

If not, show the username setup modal.

Do not duplicate user records if the same account authenticates multiple times.

---

# Data Architecture

Build the application using a clean architecture that separates:

- Authentication
- Users/profiles
- Games
- Store
- Achievements
- Inbox
- Notifications
- UI state

Create reusable types/interfaces/models for:

- User
- Game
- Achievement
- InboxMessage
- Notification
- StoreItem
- UserGame
- UserAchievement

The inbox system should support extensible message/notification types.

---

# Backend / Database

Do not make the application purely frontend/static.

Implement the necessary backend/database structure for:

- Users
- Profiles
- Games
- User games
- Achievements
- User achievements
- Inbox messages
- Notifications
- Read/unread status
- Favorites
- Store items
- Purchases if applicable

Use proper relationships, IDs, timestamps, indexes, and constraints.

For inbox messages, support fields conceptually equivalent to:

- id
- recipient/user id
- sender/user id where applicable
- type
- title
- body
- metadata
- read status
- archived status
- created timestamp
- read timestamp

Add indexes for common queries such as unread messages and messages belonging to a specific user.

---

# UX Requirements

Every interactive element should have a clear state.

Implement:

- Hover states
- Focus states
- Active states
- Disabled states
- Loading states
- Success feedback
- Error feedback
- Empty states
- Confirmation dialogs where destructive actions are involved

Use subtle animations for:

- Page transitions
- Sidebar interactions
- Modal opening/closing
- Game-card hover
- Inbox item interactions
- Toast notifications
- Loading skeletons

Animations should remain fast and purposeful.

---

# Responsive Design

The dashboard must work properly on:

- Large desktop monitors
- Standard laptops
- Tablets
- Mobile devices

On mobile:

- Convert the sidebar into a drawer/bottom navigation
- Make game cards responsive
- Make inbox messages easy to read
- Use a dedicated message-detail screen
- Ensure modals fit smaller screens
- Avoid horizontal scrolling

---

# Visual Quality

Use:

- High-quality game artwork
- Consistent aspect ratios
- Rounded corners
- Subtle borders
- Soft shadows
- Matte/glass surfaces
- Carefully controlled gradients
- Strong typography hierarchy
- Generous spacing
- Smooth micro-interactions

Avoid:

- Excessive neon
- Overly complicated dashboards
- Clutter
- Huge unnecessary animations
- Inconsistent spacing
- Generic placeholder-looking components
- Non-functional buttons

The final result should feel like a **real game platform product**, not a template.

---

# Important Completion Requirement

**Do not stop after creating the dashboard UI.**

Complete the entire experience, including:

1. Authentication
2. User/profile system
3. Username onboarding
4. Games dashboard
5. Game details
6. Store
7. Achievements
8. Profile
9. Inbox
10. Notifications
11. Read/unread management
12. Search/filtering
13. Loading states
14. Empty states
15. Error states
16. Responsive layouts
17. Database/backend integration
18. Proper navigation
19. Protected routes
20. Functional interactions

Use realistic seed/demo data where necessary so the application looks populated immediately.

Before considering the task complete, verify that **every navigation item works, every major button has an implemented action, the inbox unread count works, messages can be opened and marked as read, username onboarding works, and the entire application can be navigated without dead-end screens.**

The final product should be polished enough to present as a complete mid-level full-stack project.
