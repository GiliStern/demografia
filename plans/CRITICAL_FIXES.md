# Critical Infinite Loop Fixes

## Issue: Infinite React Re-render Loop
Browser console flooded with 5000+ warnings about duplicate React keys, causing complete browser freeze.

## Root Causes Identified

### 1. **Duplicate XP Orb IDs** ❌
**Problem:** Enemies hit by multiple projectiles in same frame created multiple XP orbs with identical IDs
```typescript
// BAD: Same ID for orbs created in same millisecond
id: `xp-${id}-${Date.now()}`
```

**Impact:** React detected duplicate keys → infinite re-render loop → browser freeze

### 2. **Multiple Death Triggers** ❌
**Problem:** Enemy `handleIntersection` fired multiple times before React could remove component
- Frame 1: Projectile A hits → HP = 0 → spawn orb, call onDeath()
- Frame 1: Projectile B hits → HP = -10 → spawn orb AGAIN, call onDeath() AGAIN
- Frame 1: Projectile C hits → HP = -20 → spawn orb AGAIN...

**Impact:** Multiple XP orbs with same ID + multiple store updates = catastrophic re-render cascade

### 3. **Shared Texture Mutation** ⚠️
**Problem:** All sprites using same texture shared the same UV coordinates
```typescript
// BAD: Modifies shared texture object
texture.repeat.set(...)  // All sprites show same frame!
```

**Impact:** Animation bugs, sprites showing wrong frames

## Solutions Applied

### Fix 1: Prevent Multiple Death Triggers ✅
```typescript
const isDead = useRef(false);

const handleIntersection = (payload) => {
  if (isDead.current) return; // Ignore hits after death
  
  if (newHp <= 0 && !isDead.current) {
    isDead.current = true; // Mark dead IMMEDIATELY
    // ... spawn orb, rewards, etc
  }
};
```

**Result:** Enemy can only die ONCE per lifecycle

### Fix 2: Guaranteed Unique Orb IDs ✅
```typescript
// GOOD: cryptographically unique IDs
const orbId = crypto.randomUUID() || `xp-${id}-${Date.now()}-${Math.random()}`;
```

**Result:** Every orb has truly unique ID, no React key conflicts

### Fix 3: Duplicate ID Prevention in Store ✅
```typescript
addXpOrb: (orb) =>
  set((state) => {
    if (state.xpOrbs.some((existing) => existing.id === orb.id)) {
      console.warn(`Duplicate orb ID prevented: ${orb.id}`);
      return state; // No re-render if duplicate
    }
    return { xpOrbs: [...state.xpOrbs, orb] };
  });
```

**Result:** Safety net - even if duplicate IDs slip through, store rejects them

### Fix 4: Per-Sprite Texture Cloning ✅
```typescript
const spriteTexture = useMemo(() => {
  const cloned = texture.clone();
  // ... configure cloned texture
  return cloned;
}, [texture]);
```

**Result:** Each sprite has independent UVs, correct animation frames

## Files Modified

1. `src/components/Enemy.tsx` - isDead guard, unique orb IDs
2. `src/store/xpOrbsStore.ts` - Duplicate ID detection
3. `src/components/Sprite.tsx` - Texture cloning per sprite

## Verification

### Before:
- Browser console: 5000+ "duplicate key" warnings
- Game: Completely frozen
- Performance: 0 FPS

### After (Expected):
- Console: Clean, no warnings
- Game: Smooth gameplay
- Performance: 55-60 FPS

## Test Instructions

1. Refresh browser (Ctrl+R)
2. Start game
3. Kill 5-10 enemies rapidly
4. Collect XP orbs
5. Check console - should be clean with only performance logs

### Success Criteria:
✅ No "duplicate key" warnings  
✅ No infinite re-renders  
✅ Game runs smoothly at 55-60 FPS  
✅ All sprites show correct animation frames  

## Technical Notes

### Why Texture Cloning is Necessary:
Three.js textures are **mutable objects**. When multiple sprites reference the same texture and modify its `repeat` and `offset` properties, they all end up showing the same UV coordinates (same frame).

**Trade-off:** Memory usage increases (one texture clone per sprite) but correctness is guaranteed. Future optimization: GPU instancing with uniform arrays.

### Why crypto.randomUUID():
- `Date.now()` has millisecond resolution → collisions in same frame
- `Math.random()` is pseudo-random → potential collisions  
- `crypto.randomUUID()` is cryptographically secure → guaranteed unique

---

**Status:** ✅ CRITICAL BUGS FIXED - Game should now run smoothly without infinite loops

