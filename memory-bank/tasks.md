# Memory Bank: Tasks

## Current Task

No active task - Memory Bank ready for next task

---

## Previous Task Archive

### Task: Add emotion CSS and move all styling to emotion styled components

## Reflection Highlights

- **What Went Well**: Systematic migration approach, TypeScript integration, code organization, dynamic styling handling, successful build verification
- **Challenges**: TypeScript strict mode with props (solved with `$` prefix), duplicate code during edits (fixed), global styles migration (solved with Global component), hover state conversion (solved with CSS pseudo-selectors)
- **Lessons Learned**: Emotion best practices (`$` prefix, template literals, Global component), migration strategy (start simple, test incrementally), TypeScript integration (explicit prop types), code quality (consistent patterns)
- **Next Steps**: Consider theme system, style utilities, performance optimization, documentation, visual regression testing

## Reflection Document

- **Date**: 2026-01-11
- **Document**: `memory-bank/reflection/reflection-emotion-migration.md`
- **Status**: ✅ Reflection Complete

## Archive Document

- **Date**: 2026-01-11
- **Document**: `memory-bank/archive/archive-emotion-migration_20260111.md`
- **Status**: ✅ COMPLETED & ARCHIVED

## Task Description

Refactor the entire codebase to use Emotion CSS-in-JS library:

- Install @emotion/react and @emotion/styled
- Convert all inline styles (CSSProperties) to Emotion styled components
- Convert CSS files (index.css, App.css) to Emotion Global styles
- Remove CSS files and update imports
- Maintain visual consistency throughout the migration

## Status

- [x] Task definition
- [x] Implementation plan
- [x] Execution
- [x] Reflection
- [x] Archiving complete

## Archive

- **Date**: 2026-01-11
- **Archive Document**: `memory-bank/archive/archive-emotion-migration_20260111.md`
- **Status**: ✅ COMPLETED & ARCHIVED

## Complexity Analysis

**Determined Level: Level 2-3 - Simple to Intermediate Enhancement**

### Reasoning:

- **Scope**: Multiple components need refactoring (CharacterCard, AppButton, TouchJoystick, screens, HUD components)
- **Impact**: Affects styling architecture across the entire codebase
- **Design Decisions Required**:
  - Emotion setup and configuration
  - Styled component naming conventions
  - Global styles migration strategy
- **Integration**: Needs to work with existing React Three Fiber components
- **Time Estimate**: Hours to 1-2 days

---

## Previous Task Archive

Add touch track/joystick controls for mobile devices to complement keyboard controls

## Task Description

Implement a touch-based joystick control system for mobile devices that:

- Functions like a joystick anywhere the user touches the screen
- Complements existing keyboard controls
- Works similar to mobile games with joystick controls
- Allows users to control character movement via touch input

## Status

- [x] Task definition
- [x] Implementation plan
- [x] Execution
- [x] Reflection
- [x] Archiving complete

## Archive

- **Date**: 2026-01-11
- **Archive Document**: `memory-bank/archive/archive-touch-joystick-controls_20260111.md`
- **Status**: ✅ COMPLETED & ARCHIVED

## Complexity Analysis

**Determined Level: Level 3 - Intermediate Feature**

## Reflection Highlights

- **What Went Well**: Structured planning, clean architecture, sound creative decisions, good code quality
- **Challenges**: Y-axis coordinate system inversion (fixed), touch state synchronization, multiple touch handling
- **Lessons Learned**: Always validate coordinate system assumptions, test coordinate transformations explicitly, ref-based hooks need state sync for visual components
- **Next Steps**: User testing on mobile devices, add automated tests, document coordinate systems

### Reasoning:

- **Scope**: Multiple components (touch hook, UI component, integration)
- **Impact**: Affects input system architecture
- **Design Decisions Required**:
  - Joystick visual design
  - Input combination strategy (touch + keyboard)
  - Dead zone handling
  - Mobile detection approach
- **Integration**: Needs to work alongside existing `useKeyboardControls` hook
- **Time Estimate**: Days to 1-2 weeks

---

## TECHNOLOGY STACK

### Current Stack (No Changes Required)

- **Framework**: React 18.2.0
- **3D Library**: React Three Fiber (@react-three/fiber)
- **State Management**: Zustand
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Inline styles (CSS-in-JS pattern)

### Technology Validation

- ✅ No new dependencies required - using native browser Touch Events API
- ✅ React hooks pattern already established
- ✅ TypeScript type safety maintained
- ✅ Existing input system compatible with extension

---

## DETAILED REQUIREMENTS ANALYSIS

### Functional Requirements

1. **Touch Input Detection**

   - Detect touch events (touchstart, touchmove, touchend)
   - Track touch position relative to initial touch point
   - Handle multiple touches (prioritize first touch)
   - Prevent default touch behaviors (scrolling, zooming)

2. **Joystick Behavior**

   - Joystick appears at initial touch location
   - Joystick knob follows finger movement within radius
   - Normalize joystick position to -1 to 1 range for x and y
   - Implement dead zone to prevent drift
   - Joystick disappears when touch ends

3. **Input Integration**

   - Combine touch and keyboard inputs
   - Touch input takes priority when active
   - Fallback to keyboard when touch inactive
   - Maintain same input format: `{ x: number, y: number }`

4. **Mobile Detection**

   - Detect mobile/touch-capable devices
   - Show joystick only on mobile devices
   - Hide joystick on desktop (keyboard-only)

5. **Visual Feedback**
   - Joystick base (fixed position)
   - Joystick knob (follows touch)
   - Visual styling consistent with game aesthetic
   - Non-intrusive overlay positioning

### Non-Functional Requirements

1. **Performance**

   - No frame rate impact
   - Efficient touch event handling
   - Minimal re-renders

2. **User Experience**

   - Responsive touch tracking
   - Smooth joystick movement
   - Intuitive control feel
   - Works in fullscreen mode

3. **Compatibility**
   - Works on iOS Safari
   - Works on Android Chrome
   - Works on desktop browsers (hidden)
   - Touch event API support

---

## COMPONENT ANALYSIS

### New Components to Create

1. **`useTouchControls` Hook** (`src/hooks/controls/useTouchControls.ts`)

   - **Purpose**: Handle touch input and convert to joystick position
   - **Returns**: `MutableRefObject<{ x: number, y: number }>` (same format as `useKeyboardControls`)
   - **Dependencies**: React hooks, touch event API
   - **Changes Needed**: New file

2. **`useUnifiedControls` Hook** (`src/hooks/controls/useUnifiedControls.ts`)

   - **Purpose**: Combine keyboard and touch inputs
   - **Returns**: `MutableRefObject<{ x: number, y: number }>`
   - **Dependencies**: `useKeyboardControls`, `useTouchControls`
   - **Changes Needed**: New file

3. **`TouchJoystick` Component** (`src/components/TouchJoystick.tsx`)

   - **Purpose**: Visual joystick UI overlay
   - **Props**: `position: { x: number, y: number }`, `isActive: boolean`
   - **Dependencies**: React, touch event handlers
   - **Changes Needed**: New file

4. **`useMobileDetection` Hook** (`src/hooks/utils/useMobileDetection.ts`)
   - **Purpose**: Detect mobile/touch-capable devices
   - **Returns**: `boolean`
   - **Dependencies**: User agent detection, touch capability check
   - **Changes Needed**: New file

### Existing Components to Modify

1. **`usePlayerBehavior` Hook** (`src/hooks/entities/usePlayerBehavior.ts`)

   - **Current**: Uses `useKeyboardControls()`
   - **Change**: Replace with `useUnifiedControls()`
   - **Impact**: Low - same interface, just different hook
   - **Line**: 26

2. **`App.tsx` Component** (`src/App.tsx`)

   - **Current**: Renders game canvas and HUD
   - **Change**: Add `<TouchJoystick />` component conditionally for mobile
   - **Impact**: Low - add one conditional component
   - **Location**: After `<GameCanvas />`, before closing `</div>`

3. **`InGameHUD.tsx` Component** (`src/components/InGameHUD.tsx`)
   - **Current**: Has `pointerEvents: "none"` to allow clicks through
   - **Change**: Ensure joystick area doesn't conflict with HUD
   - **Impact**: Minimal - may need z-index adjustment

### Component Interactions

```
useMobileDetection
    ↓
TouchJoystick (conditionally rendered)
    ↓
useTouchControls (handles touch events)
    ↓
useUnifiedControls (combines keyboard + touch)
    ↓
usePlayerBehavior (uses unified controls)
    ↓
updatePlayerFrame (processes input)
```

---

## IMPLEMENTATION STRATEGY

### Phase 1: Foundation Setup

1. **Create Mobile Detection Hook**

   - Implement `useMobileDetection` hook
   - Test on various devices/browsers
   - Document detection logic

2. **Create Touch Controls Hook**
   - Implement `useTouchControls` hook
   - Handle touchstart, touchmove, touchend events
   - Normalize touch position to joystick coordinates
   - Implement dead zone logic
   - Return ref with `{ x, y }` format

### Phase 2: Input Integration

3. **Create Unified Controls Hook**

   - Implement `useUnifiedControls` hook
   - Combine `useKeyboardControls` and `useTouchControls`
   - Priority: Touch active → use touch, else use keyboard
   - Maintain same interface as `useKeyboardControls`

4. **Update Player Behavior**
   - Replace `useKeyboardControls()` with `useUnifiedControls()` in `usePlayerBehavior`
   - Verify no breaking changes
   - Test keyboard still works

### Phase 3: Visual Joystick

5. **Create TouchJoystick Component**

   - Design joystick visual (base + knob)
   - Implement positioning logic
   - Handle touch event binding
   - Style to match game aesthetic
   - Add opacity/visibility transitions

6. **Integrate Joystick into App**
   - Add `<TouchJoystick />` to `App.tsx`
   - Conditionally render based on mobile detection
   - Position overlay correctly
   - Ensure z-index doesn't conflict with HUD

### Phase 4: Testing & Refinement

7. **Mobile Testing**

   - Test on iOS Safari
   - Test on Android Chrome
   - Test touch responsiveness
   - Test dead zone behavior
   - Test input combination

8. **Desktop Testing**

   - Verify keyboard still works
   - Verify joystick hidden on desktop
   - Verify no performance impact

9. **Edge Cases**
   - Multiple touches handling
   - Touch outside joystick area
   - Rapid touch start/end
   - Screen rotation
   - Fullscreen mode

---

## IMPLEMENTATION STEPS (Detailed Checklist)

### Phase 1: Foundation

- [ ] Create `src/hooks/utils/useMobileDetection.ts`

  - [ ] Implement user agent detection
  - [ ] Implement touch capability check
  - [ ] Add window resize listener for orientation changes
  - [ ] Return boolean state

- [ ] Create `src/hooks/controls/useTouchControls.ts`
  - [ ] Set up touch event listeners (touchstart, touchmove, touchend)
  - [ ] Track initial touch position
  - [ ] Calculate relative position from initial touch
  - [ ] Normalize to -1 to 1 range
  - [ ] Implement dead zone (e.g., 5% radius)
  - [ ] Return ref with `{ x: number, y: number }`
  - [ ] Clean up event listeners on unmount

### Phase 2: Integration

- [ ] Create `src/hooks/controls/useUnifiedControls.ts`

  - [ ] Import `useKeyboardControls` and `useTouchControls`
  - [ ] Determine active input source (touch if active, else keyboard)
  - [ ] Combine inputs appropriately
  - [ ] Return ref with same format as `useKeyboardControls`
  - [ ] Test keyboard fallback

- [ ] Update `src/hooks/entities/usePlayerBehavior.ts`
  - [ ] Replace `useKeyboardControls()` with `useUnifiedControls()`
  - [ ] Verify no type errors
  - [ ] Test keyboard input still works

### Phase 3: Visual Component

- [ ] Create `src/components/TouchJoystick.tsx`

  - [ ] Design joystick base circle (fixed position)
  - [ ] Design joystick knob (follows touch)
  - [ ] Implement touch event handlers
  - [ ] Calculate knob position from touch
  - [ ] Add visual styling (colors, opacity, borders)
  - [ ] Add smooth transitions
  - [ ] Handle touch start/end visibility
  - [ ] Ensure pointer-events work correctly

- [ ] Update `src/App.tsx`
  - [ ] Import `useMobileDetection` and `TouchJoystick`
  - [ ] Conditionally render `<TouchJoystick />` based on mobile detection
  - [ ] Position overlay correctly (absolute positioning)
  - [ ] Ensure z-index doesn't block game canvas
  - [ ] Test conditional rendering

### Phase 4: Testing & Polish

- [ ] Mobile Device Testing

  - [ ] Test on iOS Safari (iPhone)
  - [ ] Test on Android Chrome
  - [ ] Test touch responsiveness
  - [ ] Test dead zone behavior
  - [ ] Test joystick visual feedback
  - [ ] Test input accuracy

- [ ] Desktop Testing

  - [ ] Verify keyboard controls still work
  - [ ] Verify joystick not visible on desktop
  - [ ] Verify no performance impact
  - [ ] Test edge cases (rapid key presses, etc.)

- [ ] Edge Cases

  - [ ] Multiple touches (should prioritize first)
  - [ ] Touch outside joystick area
  - [ ] Rapid touch start/end
  - [ ] Screen rotation handling
  - [ ] Fullscreen mode compatibility

- [ ] Performance Optimization
  - [ ] Verify no unnecessary re-renders
  - [ ] Optimize touch event handling
  - [ ] Check frame rate impact
  - [ ] Memory leak check (event listeners)

---

## CREATIVE PHASES REQUIRED

### 🎨 UI/UX Design - Touch Joystick Visual Design

**Status**: ✅ Complete
**File**: `memory-bank/creative/creative-touch-joystick-ui.md`

**Design Decisions Made**:

1. ✅ **Joystick Visual Style**

   - Base: 120px diameter, dark gradient (#2a2a2a → #1f1f1f), 3px border (#444), 0.7 opacity
   - Knob: 50px diameter, lighter gradient (#3a3a3a → #2a2a2a), 2px border (#666), 0.9 opacity
   - Visual feedback: Opacity transitions, border color changes on active state
   - Matches game aesthetic: Uses same colors and gradients as CharacterCard component

2. ✅ **Positioning Strategy**

   - **Selected**: Fixed position at bottom-left corner
   - Position: `bottom: 30px, left: 30px` (fixed)
   - Responsive sizing: 100-140px base based on screen width
   - Rationale: Matches user expectations, non-intrusive, consistent

3. ✅ **Interaction Feedback**
   - Opacity: 0.3 idle → 0.7 active (base), 0.5 idle → 0.9 active (knob)
   - Smooth transitions: 0.2-0.3s ease transitions
   - Border highlight: Changes to #666 when active
   - Dead zone indicator: Optional inner circle at 20% radius

**Decision Summary**: Fixed bottom-left position with dark theme styling matching game aesthetic. Responsive sizing ensures usability across devices.

### ⚙️ Algorithm Design - Input Combination Strategy

**Status**: ✅ Complete
**File**: `memory-bank/creative/creative-input-combination.md`

**Design Decisions Made**:

1. ✅ **Input Priority Logic**

   - **Selected**: Simple Priority (Touch Override)
   - Logic: Touch active (non-zero) → use touch, else use keyboard
   - No mixing: Clear priority prevents confusion
   - Rationale: Simplest, most predictable, standard pattern

2. ✅ **Dead Zone Implementation**

   - **Selected**: Circular dead zone with snap-to-center
   - Radius: 8% of joystick max radius (~5px for 120px base)
   - Shape: Circular (matches joystick visual)
   - Behavior: Returns { x: 0, y: 0 } when within dead zone
   - Rationale: Prevents drift, provides clear neutral state

3. ✅ **Normalization Algorithm**
   - Calculate distance from initial touch point
   - Normalize to joystick radius (maxRadius)
   - Apply dead zone check
   - Convert to -1 to 1 range using angle and normalized distance
   - Clamp at edges (hard limit at maxRadius)

**Decision Summary**: Simple priority system with circular dead zone. Normalization algorithm converts pixel-based touch to -1 to 1 input range compatible with existing keyboard controls.

---

## DEPENDENCIES

### Technical Dependencies

- ✅ React 18.2.0 (already installed)
- ✅ TypeScript (already configured)
- ✅ Browser Touch Events API (native, no dependency)
- ✅ React Three Fiber (already installed, no changes needed)

### Code Dependencies

- `useKeyboardControls` hook (existing, must maintain compatibility)
- `usePlayerBehavior` hook (existing, needs modification)
- `updatePlayerFrame` function (existing, no changes needed)
- Game store (Zustand) - no changes needed

### External Dependencies

- None - using native browser APIs

---

## CHALLENGES & MITIGATIONS

### Challenge 1: Touch Event Handling Across Browsers

**Risk**: iOS Safari and Android Chrome handle touch events differently
**Mitigation**:

- Use standard Touch Events API
- Test on both platforms early
- Use feature detection, not user agent sniffing
- Handle touch event cancellation properly

### Challenge 2: Input Combination Logic

**Risk**: Keyboard and touch inputs conflict or feel janky
**Mitigation**:

- Clear priority: touch active → touch, else keyboard
- Ensure smooth transition between input methods
- Test edge cases (rapid switching)

### Challenge 3: Visual Joystick Positioning

**Risk**: Joystick interferes with game UI or gameplay
**Mitigation**:

- Use absolute positioning with proper z-index
- Ensure HUD has `pointerEvents: "none"` (already done)
- Test on various screen sizes
- Consider dynamic positioning based on touch location

### Challenge 4: Performance Impact

**Risk**: Touch event handling causes frame drops
**Mitigation**:

- Use refs to avoid unnecessary re-renders
- Throttle/debounce touch events if needed
- Profile performance on mobile devices
- Optimize joystick rendering (use CSS transforms)

### Challenge 5: Dead Zone Implementation

**Risk**: Dead zone too small (drift) or too large (unresponsive)
**Mitigation**:

- Start with 5-10% dead zone
- Make dead zone configurable
- Test with real users
- Allow fine-tuning based on feedback

### Challenge 6: Mobile Detection Accuracy

**Risk**: False positives/negatives in mobile detection
**Mitigation**:

- Use multiple detection methods (touch capability + screen size)
- Don't rely solely on user agent
- Provide fallback (show joystick if touch events available)
- Test on various devices

---

## TESTING STRATEGY

### Unit Tests

- [ ] `useMobileDetection` hook tests

  - Test user agent detection
  - Test touch capability detection
  - Test window resize handling

- [ ] `useTouchControls` hook tests

  - Test touch event handling
  - Test normalization logic
  - Test dead zone behavior
  - Test cleanup on unmount

- [ ] `useUnifiedControls` hook tests
  - Test input combination logic
  - Test priority (touch vs keyboard)
  - Test fallback behavior

### Integration Tests

- [ ] Touch joystick + player movement

  - Test touch input moves player
  - Test joystick visual follows touch
  - Test input accuracy

- [ ] Keyboard + touch combination
  - Test keyboard works when touch inactive
  - Test touch takes priority when active
  - Test smooth transition

### Manual Testing Checklist

- [ ] iOS Safari testing
- [ ] Android Chrome testing
- [ ] Desktop browser testing (joystick hidden)
- [ ] Touch responsiveness
- [ ] Visual feedback
- [ ] Performance (frame rate)
- [ ] Edge cases (multiple touches, rapid touches)

---

## DOCUMENTATION PLAN

### Code Documentation

- [ ] JSDoc comments for all new hooks
- [ ] Component prop documentation
- [ ] Algorithm explanations (normalization, dead zone)

### User Documentation

- [ ] Update README with mobile controls info
- [ ] Document joystick behavior
- [ ] Document mobile compatibility

### Architecture Documentation

- [ ] Update `memory-bank/systemPatterns.md` with input system architecture
- [ ] Document input flow diagram
- [ ] Document design decisions

---

## TECHNOLOGY VALIDATION CHECKPOINT

### Technology Stack Validation

- ✅ No new dependencies required
- ✅ Native browser APIs used (Touch Events)
- ✅ React hooks pattern consistent with existing code
- ✅ TypeScript types maintained
- ✅ Build configuration unchanged

### Proof of Concept

- [ ] Create minimal touch event handler test
- [ ] Verify touch events work in target browsers
- [ ] Test normalization algorithm
- [ ] Verify no build errors

### Build Validation

- [ ] TypeScript compilation passes
- [ ] No linting errors
- [ ] Build completes successfully
- [ ] No runtime errors in development

---

## NEXT STEPS

1. **Creative Phase**: Address UI/UX design and input combination algorithm

   - Run `/creative` command for joystick visual design
   - Run `/creative` command for input combination strategy

2. **Implementation**: After creative phases complete

   - Run `/build` command to begin implementation
   - Follow implementation steps checklist
   - Update progress regularly

3. **Testing**: Throughout implementation

   - Test on mobile devices frequently
   - Verify keyboard still works
   - Check performance

4. **Documentation**: During and after implementation
   - Document design decisions
   - Update code comments
   - Update user documentation
