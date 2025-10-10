# Stock Line - UI/UX Specifications

**Version:** 1.0  
**Design System:** Stock Line DS v1  
**Date:** October 10, 2025

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Design System](#design-system)
3. [User Flows](#user-flows)
4. [Screen Specifications](#screen-specifications)
5. [Component Library](#component-library)
6. [Mobile Considerations](#mobile-considerations)
7. [Accessibility](#accessibility)

---

## Design Principles

### 1. **Simplicity First**
- Minimal cognitive load
- Clear visual hierarchy
- One primary action per screen
- Hide complexity, reveal progressively

### 2. **Mobile-First**
- Touch-friendly (min 44px tap targets)
- Thumb-zone optimization
- Offline-capable
- Fast load times (< 2s on 3G)

### 3. **Local Context**
- Multi-language support (Hindi, English, regional)
- Familiar metaphors (notebook, calculator, etc.)
- Culturally appropriate colors & icons
- Local units (₹, kg, liter)

### 4. **Trust & Reliability**
- Consistent design
- Clear feedback on actions
- Graceful error handling
- Data privacy transparency

### 5. **Delight**
- Smooth animations (60fps)
- Celebratory moments (sales milestones)
- Helpful micro-interactions
- Personalized experience

---

## Design System

### Color Palette

#### Primary Colors
```
Brand Primary (Indigo):
- 50:  #EEF2FF
- 100: #E0E7FF
- 500: #6366F1  ← Primary
- 600: #4F46E5  ← Primary Dark
- 700: #4338CA
- 900: #312E81
```

#### Accent Colors
```
Success (Green):
- 500: #10B981
- 600: #059669

Warning (Amber):
- 500: #F59E0B
- 600: #D97706

Error (Red):
- 500: #EF4444
- 600: #DC2626

Info (Blue):
- 500: #3B82F6
- 600: #2563EB
```

#### Neutral Colors
```
Gray Scale:
- 50:  #F9FAFB  ← Background
- 100: #F3F4F6  ← Light Background
- 200: #E5E7EB  ← Border
- 400: #9CA3AF  ← Disabled
- 500: #6B7280  ← Secondary Text
- 700: #374151  ← Body Text
- 900: #111827  ← Heading
```

---

### Typography

**Font Family:** Inter (fallback: system-ui)

#### Desktop/Tablet
```
H1: 36px / 40px, Bold (700)
H2: 30px / 36px, Semibold (600)
H3: 24px / 32px, Semibold (600)
H4: 20px / 28px, Medium (500)
H5: 18px / 28px, Medium (500)

Body Large: 18px / 28px, Regular (400)
Body: 16px / 24px, Regular (400)
Body Small: 14px / 20px, Regular (400)

Caption: 12px / 16px, Regular (400)
Label: 14px / 20px, Medium (500)
```

#### Mobile
```
H1: 28px / 32px, Bold (700)
H2: 24px / 28px, Semibold (600)
H3: 20px / 24px, Semibold (600)
H4: 18px / 24px, Medium (500)

Body: 16px / 24px, Regular (400)
Body Small: 14px / 20px, Regular (400)
Caption: 12px / 16px, Regular (400)
```

---

### Spacing Scale

**Base Unit:** 4px

```
1:  4px   (0.25rem)
2:  8px   (0.5rem)
3:  12px  (0.75rem)
4:  16px  (1rem)
5:  20px  (1.25rem)
6:  24px  (1.5rem)
8:  32px  (2rem)
10: 40px  (2.5rem)
12: 48px  (3rem)
16: 64px  (4rem)
20: 80px  (5rem)
```

**Usage:**
- Component padding: 4, 6
- Card padding: 6, 8
- Page margin: 6, 8, 10
- Section spacing: 10, 12, 16

---

### Border Radius

```
sm:  4px   (0.25rem)  - Buttons, inputs
md:  8px   (0.5rem)   - Cards
lg:  12px  (0.75rem)  - Modals
xl:  16px  (1rem)     - Large cards
2xl: 24px  (1.5rem)   - Special components
full: 9999px          - Pills, avatars
```

---

### Shadows

```
sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05)
md:   0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1)
2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

---

### Icons

**Icon Library:** Heroicons (outlined + solid)

**Sizes:**
- xs: 16px
- sm: 20px
- md: 24px
- lg: 32px
- xl: 40px

**Usage:**
- Navigation icons: 24px
- Action buttons: 20px
- Decorative: 16px
- Feature highlights: 32px+

---

## User Flows

### 1. Onboarding Flow

```
Landing Page
  ↓
Sign Up (WhatsApp/Email)
  ↓
OTP Verification
  ↓
Shop Setup (5 steps)
  ├─ Step 1: Shop Name & Category
  ├─ Step 2: Location
  ├─ Step 3: Business Hours
  ├─ Step 4: Contact Info
  └─ Step 5: First Product
  ↓
Dashboard (Welcome Tour)
```

**Design Notes:**
- Progress indicator (1/5, 2/5...)
- Skip option for non-critical steps
- Celebration animation on completion
- Helpful tooltips

---

### 2. Add Product Flow

```
Inventory Page
  ↓
Click "Add Product" (+ button)
  ↓
Choose Method:
  ├─ Manual Entry
  ├─ Scan Barcode
  └─ Upload Image
  ↓
Fill Product Details
  ├─ Name (required)
  ├─ Category (dropdown)
  ├─ Quantity (number)
  ├─ Price (number)
  └─ Photo (optional)
  ↓
Review & Save
  ↓
Success Toast → Back to Inventory
```

**Design Notes:**
- Auto-save draft
- Smart defaults (category suggests based on name)
- Inline validation
- Large, touch-friendly inputs

---

### 3. Create Bill Flow

```
Billing Page
  ↓
Click "New Bill"
  ↓
Search & Add Products
  ├─ Type to search
  ├─ Scan barcode
  └─ Recent products
  ↓
Adjust Quantities
  ↓
Review Total
  ├─ Subtotal
  ├─ Tax
  └─ Total
  ↓
Select Payment Method
  ├─ Cash
  ├─ UPI
  ├─ Card
  └─ Credit
  ↓
Customer Details (optional)
  ↓
Generate Bill
  ↓
Success → Options:
  ├─ Print
  ├─ WhatsApp
  ├─ Email
  └─ New Bill
```

**Design Notes:**
- Quick add via barcode
- Running total visible
- Swipe to remove item
- Haptic feedback on add

---

### 4. Image Scan Flow

```
Inventory Page
  ↓
Click "Scan Shelf"
  ↓
Camera Opens
  ↓
Take Photo
  ↓
Processing (2-5s)
  ├─ Loading animation
  └─ "AI is analyzing..."
  ↓
Results Screen
  ├─ Product 1 ✓ (matched)
  ├─ Product 2 ✓ (matched)
  └─ Product 3 ? (needs review)
  ↓
Review & Correct
  ↓
Apply to Inventory
  ↓
Success Toast
```

**Design Notes:**
- Grid layout for results
- Green checkmark for matched
- Yellow warning for needs review
- Swipe to edit quantity
- Bulk apply option

---

## Screen Specifications

### 1. Login Screen

**Layout:**
```
┌────────────────────────────┐
│                            │
│      [Logo]                │
│   Stock Line               │
│                            │
│ "Smart Stock, Simple Shop" │
│                            │
│  ┌──────────────────────┐  │
│  │  WhatsApp Number     │  │
│  │  +91 |_____________| │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   Send OTP           │  │
│  └──────────────────────┘  │
│                            │
│     ─── OR ───             │
│                            │
│  ┌──────────────────────┐  │
│  │ 🔵 Google Sign In    │  │
│  └──────────────────────┘  │
│                            │
└────────────────────────────┘
```

**Components:**
- Logo: 80px × 80px
- Input: Height 48px, rounded-md
- Button: Height 48px, full width
- OR divider: Gray line with text

**States:**
- Default
- OTP sent (show 6-digit input)
- Loading
- Error (red border + message)

---

### 2. Dashboard (Home)

**Layout (Mobile):**
```
┌────────────────────────────┐
│ ☰  Dashboard        [👤]  │ ← Header
├────────────────────────────┤
│                            │
│ 👋 Good morning, Rajesh!   │ ← Greeting
│                            │
│ ┌────────┬────────┬──────┐ │ ← Quick Stats
│ │ ₹12.5K │  45    │  12  │ │
│ │ Revenue│ Bills  │ Low  │ │
│ │ Today  │        │Stock │ │
│ └────────┴────────┴──────┘ │
│                            │
│ Quick Actions              │
│ ┌──────┐ ┌──────┐         │
│ │ 🧾   │ │ 📦   │         │
│ │ New  │ │ Add  │         │
│ │ Bill │ │ Stock│         │
│ └──────┘ └──────┘         │
│                            │
│ Low Stock Alerts (3)       │
│ ┌────────────────────────┐ │
│ │ ⚠️ Maggi Noodles       │ │
│ │    15 remaining        │ │
│ │    [Restock]           │ │
│ └────────────────────────┘ │
│                            │
│ Sales Chart (Today)        │
│ ┌────────────────────────┐ │
│ │     📈                 │ │
│ │  [Line Chart]          │ │
│ └────────────────────────┘ │
│                            │
└────────────────────────────┘
```

**Components:**
1. **Header**
   - Hamburger menu (left)
   - Title (center)
   - Profile avatar (right)

2. **Stats Cards**
   - 3 columns on mobile
   - Icon + Value + Label
   - Color coded (green for revenue)

3. **Quick Actions**
   - 2×2 grid
   - Icon + Label
   - Tap to navigate

4. **Alert Card**
   - Warning icon
   - Product name
   - Quantity
   - CTA button

5. **Sales Chart**
   - Recharts line chart
   - Hourly breakdown
   - Tooltip on hover/tap

---

### 3. Inventory List

**Layout:**
```
┌────────────────────────────┐
│ ← Inventory         [+]    │ ← Header
├────────────────────────────┤
│ [Search products...]   🔍  │ ← Search
│                            │
│ Filters: All ▾  A-Z ▾      │ ← Filters
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ [img] Maggi Noodles    │ │ ← Product Card
│ │       ₹15   Stock: 45  │ │
│ │       [···]            │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ [img] Coca Cola 500ml  │ │
│ │       ₹20   Stock: 8⚠️ │ │
│ │       [···]            │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ [img] Parle G Biscuit  │ │
│ │       ₹5    Stock: 120 │ │
│ │       [···]            │ │
│ └────────────────────────┘ │
│                            │
│          [Load More]       │
│                            │
└────────────────────────────┘
```

**Product Card Components:**
- Product image (60×60px, rounded)
- Name (body text, 1-2 lines, ellipsis)
- Price (semibold)
- Stock quantity (with warning icon if low)
- More menu (···)

**Interactions:**
- Tap card → Product details
- Tap (···) → Quick actions menu
  - Edit
  - Adjust stock
  - Delete
- Swipe left → Quick stock adjust
- Pull to refresh

**Empty State:**
```
     [📦 Icon]
   No products yet

 Add your first product
      to get started

    [Add Product]
```

---

### 4. Create Bill

**Layout:**
```
┌────────────────────────────┐
│ ← New Bill            [✓]  │ ← Header
├────────────────────────────┤
│ [Search or scan...]    🔍  │ ← Search
│                            │
│ Cart (2 items)             │
│ ┌────────────────────────┐ │
│ │ Maggi x5          ₹75  │ │ ← Line Item
│ │ [-] 5 [+]          [×] │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Coca Cola x2      ₹40  │ │
│ │ [-] 2 [+]          [×] │ │
│ └────────────────────────┘ │
│                            │
│ ─────────────────────────  │
│ Subtotal           ₹115.00 │
│ Tax (12%)           ₹13.80 │
│ ─────────────────────────  │
│ Total              ₹128.80 │
│ ─────────────────────────  │
│                            │
│ Payment Method             │
│ [💵 Cash] [📱 UPI] [💳 Card]│
│                            │
│ Customer (optional)        │
│ [Name]          [Phone]    │
│                            │
│    [Generate Bill]         │
│                            │
└────────────────────────────┘
```

**Line Item Components:**
- Product name
- Quantity controls (-/+)
- Price
- Remove (×)

**Total Section:**
- Clear breakdown
- Large total (emphasize)

**Payment Methods:**
- Toggle buttons
- Icon + label
- Active state (primary color)

**CTA:**
- Fixed at bottom
- Primary button, full width
- Disabled if cart empty

---

### 5. Reports

**Layout:**
```
┌────────────────────────────┐
│ ← Reports                  │
├────────────────────────────┤
│ Period: [Today ▾]          │ ← Filter
│                            │
│ ┌────────┬────────┬──────┐ │ ← Stats
│ │ ₹12.5K │  45    │ ₹277 │ │
│ │Revenue │ Bills  │ Avg  │ │
│ └────────┴────────┴──────┘ │
│                            │
│ Sales Trend                │
│ ┌────────────────────────┐ │
│ │   📊 [Bar Chart]       │ │
│ └────────────────────────┘ │
│                            │
│ Top Products               │
│ ┌────────────────────────┐ │
│ │ 1. Maggi      ₹375 25x │ │
│ │ 2. Coca Cola  ₹320 16x │ │
│ │ 3. Parle G    ₹250 50x │ │
│ └────────────────────────┘ │
│                            │
│ Payment Breakdown          │
│ ┌────────────────────────┐ │
│ │ [Pie Chart]            │ │
│ │ Cash 40% | UPI 50%     │ │
│ │ Card 10%               │ │
│ └────────────────────────┘ │
│                            │
│  [📄 Export PDF] [📊 Excel]│
│                            │
└────────────────────────────┘
```

**Charts:**
- Use Recharts library
- Responsive sizing
- Tooltips on interaction
- Color coded (brand colors)

**Export Buttons:**
- Secondary style
- Icon + label
- Download confirmation toast

---

## Component Library

### 1. Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Save
</Button>
```

**Variants:**
- `primary`: Indigo-600, white text
- `secondary`: Gray-200, gray-900 text
- `outline`: Border only
- `ghost`: No background
- `danger`: Red-600, white text

**Sizes:**
- `sm`: 32px height, 12px text
- `md`: 40px height, 14px text
- `lg`: 48px height, 16px text

**States:**
- Default
- Hover (darker shade)
- Active (pressed effect)
- Disabled (gray-300, opacity 0.5)
- Loading (spinner + disabled)

---

### 2. Input Fields

```tsx
<Input
  label="Product Name"
  placeholder="Enter product name"
  type="text"
  error="This field is required"
/>
```

**Types:**
- `text`, `email`, `tel`, `number`, `password`

**Features:**
- Floating label (optional)
- Prefix/suffix icons
- Error state (red border + message)
- Success state (green border + checkmark)
- Character count
- Auto-complete

**Styling:**
- Height: 48px
- Padding: 12px
- Border: 1px solid gray-300
- Border radius: 6px
- Focus: 2px indigo-500 ring

---

### 3. Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

**Styling:**
- Background: white
- Border: 1px gray-200
- Border radius: 8px
- Shadow: md
- Padding: 24px

**Variants:**
- Default
- Hoverable (lift on hover)
- Clickable (cursor pointer)
- Outlined (border only)

---

### 4. Alerts

```tsx
<Alert variant="warning">
  <AlertIcon />
  <AlertTitle>Low Stock</AlertTitle>
  <AlertDescription>
    15 items remaining
  </AlertDescription>
</Alert>
```

**Variants:**
- `info`: Blue background
- `success`: Green background
- `warning`: Amber background
- `error`: Red background

**Components:**
- Icon (variant-colored)
- Title (semibold)
- Description
- Close button (optional)

---

### 5. Modals

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Confirm Delete</ModalHeader>
    <ModalBody>
      Are you sure you want to delete this product?
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Delete
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

**Features:**
- Backdrop overlay (dark, 40% opacity)
- Center alignment
- Slide-up animation (mobile)
- Fade-in (desktop)
- Click outside to close
- Escape key to close

---

### 6. Toasts

```tsx
toast.success("Product saved successfully!");
toast.error("Failed to save product");
```

**Position:** Top-right (desktop), top-center (mobile)

**Duration:** 3 seconds (configurable)

**Variants:**
- Success (green, ✓ icon)
- Error (red, ✗ icon)
- Warning (amber, ⚠ icon)
- Info (blue, ℹ icon)

**Actions:**
- Auto-dismiss
- Manual close (×)
- Action button (optional)

---

## Mobile Considerations

### 1. Touch Targets
- Minimum: 44×44px
- Recommended: 48×48px
- Spacing between targets: 8px+

### 2. Thumb Zone
- Primary actions: Bottom 1/3 of screen
- Secondary actions: Top
- Critical actions: Center

### 3. Gestures
- Swipe right: Go back
- Swipe left on item: Quick actions
- Pull down: Refresh
- Swipe up: More content
- Long press: Context menu

### 4. Navigation
- Bottom tab bar (main navigation)
- Top header (page title + actions)
- Floating action button (primary action)

### 5. Performance
- Lazy load images
- Virtual scrolling for long lists
- Optimistic UI updates
- Skeleton loaders

---

## Accessibility

### 1. Color Contrast
- Text: WCAG AA (4.5:1)
- Large text: WCAG AA (3:1)
- Never rely on color alone

### 2. Keyboard Navigation
- Tab order logical
- Focus indicators visible
- Skip links for main content
- Escape to close modals

### 3. Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Announce dynamic content

### 4. Text
- Resizable (up to 200%)
- Line height: 1.5+
- Paragraph width: 60-80 characters
- Clear, simple language

### 5. Forms
- Labels for all inputs
- Error messages descriptive
- Help text for complex fields
- Autocomplete attributes

---

## Animation Guidelines

### Timing
- Micro: 100-200ms (hovers, focus)
- Functional: 200-300ms (dropdowns, tooltips)
- Expressive: 300-500ms (modals, page transitions)

### Easing
- `ease-out`: Entrances
- `ease-in`: Exits
- `ease-in-out`: Movements

### Examples
```css
/* Button hover */
transition: background-color 150ms ease-out;

/* Modal open */
transition: opacity 300ms ease-out, transform 300ms ease-out;

/* Card lift */
transition: box-shadow 200ms ease-out, transform 200ms ease-out;
```

---

## Responsive Breakpoints

```
sm:  640px   (Mobile landscape)
md:  768px   (Tablet)
lg:  1024px  (Desktop)
xl:  1280px  (Large desktop)
2xl: 1536px  (Extra large)
```

**Design for:**
1. Mobile first (320px+)
2. Tablet (768px+)
3. Desktop (1024px+)

---

**Document Owner:** Design Team, Stock Line  
**Design Tool:** Figma  
**Last Updated:** 2025-10-10  
**Next Review:** Bi-weekly during development
