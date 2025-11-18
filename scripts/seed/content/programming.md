# Modern JavaScript and TypeScript Development

## Chapter 1: JavaScript Fundamentals

### 1.1 Variables and Data Types

JavaScript provides three ways to declare variables:

```javascript
// var - function scoped (legacy, avoid in modern code)
var oldWay = "deprecated";

// let - block scoped, can be reassigned
let count = 0;
count = 1; // OK

// const - block scoped, cannot be reassigned
const API_KEY = "abc123";
// API_KEY = "xyz"; // Error!
```

**Primitive Data Types**:
- `string`: Text data ("hello", 'world', `template`)
- `number`: Integers and floats (42, 3.14, NaN, Infinity)
- `boolean`: true or false
- `undefined`: Variable declared but not assigned
- `null`: Intentional absence of value
- `symbol`: Unique identifiers (ES6+)
- `bigint`: Large integers (ES2020+)

**Reference Types**:
- Objects, Arrays, Functions

### 1.2 Functions

**Function Declaration**:
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

**Function Expression**:
```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};
```

**Arrow Functions** (ES6+):
```javascript
const greet = (name) => {
  return `Hello, ${name}!`;
};

// Concise syntax for single expression
const greet = (name) => `Hello, ${name}!`;
```

**Key Difference**: Arrow functions don't bind their own `this`.

### 1.3 Async Programming

**Promises**:
```javascript
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: "John" });
      } else {
        reject(new Error("Invalid ID"));
      }
    }, 1000);
  });
}

// Using promises
fetchUser(1)
  .then(user => console.log(user))
  .catch(error => console.error(error));
```

**Async/Await** (ES2017+):
```javascript
async function getUser(id) {
  try {
    const user = await fetchUser(id);
    console.log(user);
  } catch (error) {
    console.error(error);
  }
}
```

## Chapter 2: Modern JavaScript Features

### 2.1 Destructuring

**Array Destructuring**:
```javascript
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
// first = 1, second = 2, rest = [3, 4, 5]
```

**Object Destructuring**:
```javascript
const user = { name: "Alice", age: 30, city: "NYC" };
const { name, age } = user;
// name = "Alice", age = 30

// Renaming
const { name: userName } = user;
// userName = "Alice"
```

### 2.2 Spread and Rest Operators

**Spread Operator** (...):
```javascript
// Arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
// [1, 2, 3, 4, 5, 6]

// Objects
const user = { name: "Bob" };
const details = { age: 25, city: "LA" };
const fullUser = { ...user, ...details };
// { name: "Bob", age: 25, city: "LA" }
```

**Rest Operator** (...):
```javascript
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3, 4); // 10
```

### 2.3 Array Methods

**Map**: Transform each element
```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8]
```

**Filter**: Keep elements that match condition
```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4, 6]
```

**Reduce**: Accumulate to single value
```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 10
```

**Find**: Get first matching element
```javascript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];
const user = users.find(u => u.id === 2);
// { id: 2, name: "Bob" }
```

## Chapter 3: TypeScript Essentials

### 3.1 Basic Types

TypeScript adds static typing to JavaScript:

```typescript
// Type annotations
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Tuples
let user: [string, number] = ["Alice", 30];

// Any (avoid when possible!)
let anything: any = "hello";
anything = 42; // OK, but loses type safety

// Unknown (safer than any)
let value: unknown = "hello";
// Must check type before using
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

### 3.2 Interfaces and Types

**Interfaces**:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional property
  readonly createdAt: Date; // Cannot be modified
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date()
};
```

**Type Aliases**:
```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

interface Task {
  id: ID;
  title: string;
  status: Status;
}
```

**Extending Interfaces**:
```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
}
```

### 3.3 Generics

Generics allow creating reusable components:

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("hello"); // Type: string
identity<number>(42);      // Type: number

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
}

const response: ApiResponse<User> = {
  data: { id: 1, name: "Alice" },
  status: 200,
  message: "Success"
};

// Generic constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length);
}

logLength("hello");    // OK: string has length
logLength([1, 2, 3]);  // OK: array has length
// logLength(42);      // Error: number doesn't have length
```

## Chapter 4: React with TypeScript

### 4.1 Function Components

```typescript
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ 
  label, 
  onClick, 
  disabled = false,
  variant = 'primary'
}: ButtonProps): JSX.Element {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### 4.2 Hooks with TypeScript

**useState**:
```typescript
import { useState } from 'react';

function Counter() {
  // Type inferred as number
  const [count, setCount] = useState(0);
  
  // Explicit type for complex state
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**useEffect**:
```typescript
import { useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data: User = await response.json();
      setUser(data);
    }
    
    fetchUser();
  }, [userId]); // Dependency array
  
  if (!user) return <div>Loading...</div>;
  
  return <div>{user.name}</div>;
}
```

**Custom Hooks**:
```typescript
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url);
        const json: T = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function UsersList() {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!users) return <div>No data</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Chapter 5: Best Practices

### 5.1 Error Handling

```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Async error handling
async function saveUser(user: User): Promise<void> {
  try {
    if (!user.email) {
      throw new ValidationError('Email is required');
    }
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User saved:', data);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
    } else if (error instanceof Error) {
      console.error('Failed to save user:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error; // Re-throw for caller to handle
  }
}
```

### 5.2 Code Organization

```typescript
// Use barrel exports (index.ts)
// components/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';

// Import as:
import { Button, Input, Card } from './components';

// Use absolute imports
// tsconfig.json: "baseUrl": "src"
import { Button } from 'components/Button';
// instead of
import { Button } from '../../../components/Button';
```

### 5.3 Performance Optimization

**Memoization**:
```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive calculations
  const sortedItems = useMemo(() => {
    console.log('Sorting items...');
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  // Memoize callback functions
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []); // No dependencies = stable reference
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Practice Exercises

1. Create a generic `Queue<T>` class with enqueue and dequeue methods
2. Implement a custom hook `useLocalStorage` with TypeScript
3. Build a type-safe REST API client using fetch and generics
4. Create a form component with validation using TypeScript
5. Implement error boundaries in React with TypeScript

## Additional Resources

- TypeScript Official Documentation: https://www.typescriptlang.org/docs/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- TypeScript Deep Dive: https://basarat.gitbook.io/typescript/

