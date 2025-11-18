# Introduction to Calculus

## Chapter 1: Limits and Continuity

### 1.1 Understanding Limits

A limit describes the value that a function approaches as the input approaches some value. Formally, we write:

lim(x→a) f(x) = L

This means that as x gets arbitrarily close to a, f(x) gets arbitrarily close to L.

**Example 1**: Consider the function f(x) = (x² - 4)/(x - 2)

While this function is undefined at x = 2, we can examine its limit:
- As x approaches 2 from the left: f(1.9) = 3.9, f(1.99) = 3.99
- As x approaches 2 from the right: f(2.1) = 4.1, f(2.01) = 4.01

Therefore, lim(x→2) (x² - 4)/(x - 2) = 4

### 1.2 Continuity

A function f(x) is continuous at x = a if:
1. f(a) is defined
2. lim(x→a) f(x) exists
3. lim(x→a) f(x) = f(a)

**Example 2**: The function f(x) = x² is continuous everywhere because it satisfies all three conditions at every point.

## Chapter 2: Derivatives

### 2.1 The Definition of a Derivative

The derivative of a function f at a point x represents the instantaneous rate of change. It's defined as:

f'(x) = lim(h→0) [f(x + h) - f(x)]/h

**Geometric Interpretation**: The derivative represents the slope of the tangent line to the curve at point x.

### 2.2 Basic Derivative Rules

1. **Power Rule**: If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹
2. **Constant Rule**: If f(x) = c, then f'(x) = 0
3. **Sum Rule**: If f(x) = g(x) + h(x), then f'(x) = g'(x) + h'(x)
4. **Product Rule**: If f(x) = g(x)·h(x), then f'(x) = g'(x)·h(x) + g(x)·h'(x)
5. **Chain Rule**: If f(x) = g(h(x)), then f'(x) = g'(h(x))·h'(x)

**Example 3**: Find the derivative of f(x) = 3x⁴ - 2x² + 5

Using the power rule and sum rule:
f'(x) = 12x³ - 4x

### 2.3 Applications of Derivatives

**Finding Maximum and Minimum Values**:
1. Find critical points where f'(x) = 0 or f'(x) is undefined
2. Use the second derivative test: f''(x) > 0 indicates a minimum, f''(x) < 0 indicates a maximum
3. Check endpoints for absolute extrema

**Example 4**: A rectangular box with a square base must have a volume of 1000 cubic inches. Find the dimensions that minimize the surface area.

Let x = side of square base, h = height
Volume: x²h = 1000, so h = 1000/x²
Surface area: S = 2x² + 4xh = 2x² + 4000/x

To minimize: S'(x) = 4x - 4000/x² = 0
Solving: 4x³ = 4000, x³ = 1000, x = 10

Therefore: x = 10 inches, h = 10 inches (a cube minimizes surface area!)

## Chapter 3: Integration

### 3.1 The Definite Integral

The definite integral represents the accumulated sum of infinitesimal quantities. For a continuous function f(x) on [a,b]:

∫[a to b] f(x)dx = lim(n→∞) Σ[i=1 to n] f(xᵢ)Δx

**Geometric Interpretation**: The definite integral represents the net signed area between the curve and the x-axis.

### 3.2 The Fundamental Theorem of Calculus

This theorem connects differentiation and integration:

If F'(x) = f(x), then ∫[a to b] f(x)dx = F(b) - F(a)

**Example 5**: Evaluate ∫[0 to 2] (3x² + 2x)dx

First, find the antiderivative: F(x) = x³ + x²
Then apply the theorem: F(2) - F(0) = (8 + 4) - (0) = 12

### 3.3 Integration Techniques

**Substitution Method**: Used when the integrand contains a function and its derivative.

Example: ∫ 2x·cos(x²)dx
Let u = x², then du = 2x dx
Result: ∫ cos(u)du = sin(u) + C = sin(x²) + C

**Integration by Parts**: ∫ u dv = uv - ∫ v du

Example: ∫ x·eˣ dx
Let u = x, dv = eˣ dx
Then du = dx, v = eˣ
Result: x·eˣ - ∫ eˣ dx = x·eˣ - eˣ + C = eˣ(x - 1) + C

## Practice Problems

1. Find lim(x→3) (x² - 9)/(x - 3)
2. Determine if f(x) = |x| is continuous at x = 0
3. Find the derivative of f(x) = (2x + 1)³
4. Find the maximum value of f(x) = -x² + 4x on [0, 5]
5. Evaluate ∫[1 to 3] (2x + 1)dx

