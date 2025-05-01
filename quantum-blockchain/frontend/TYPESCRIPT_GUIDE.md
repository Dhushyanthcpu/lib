# TypeScript Guide for Quantum Blockchain Frontend

This guide provides instructions on how to handle TypeScript errors and maintain type safety in the Quantum Blockchain frontend.

## Common TypeScript Errors and How to Fix Them

### 1. "JSX element implicitly has type 'any'"

This error occurs when TypeScript can't infer the type of a JSX element. To fix it:

- Make sure your component has a proper type definition:
  ```typescript
  const MyComponent: React.FC = () => {
    // Component code
  };
  ```

- If you're importing a component from another file, make sure it's properly exported with a type:
  ```typescript
  // In the component file
  const MyComponent: React.FC = () => {
    // Component code
  };
  
  export default MyComponent;
  ```

### 2. "Property does not exist on type"

This error occurs when you're trying to access a property that TypeScript doesn't know exists on an object:

- Define interfaces for your objects:
  ```typescript
  interface User {
    id: string;
    name: string;
    email: string;
  }
  
  const user: User = {
    id: '123',
    name: 'John',
    email: 'john@example.com'
  };
  ```

- Use type assertions when necessary (but try to avoid them):
  ```typescript
  const user = data as User;
  ```

### 3. "Type 'X' is not assignable to type 'Y'"

This error occurs when you're trying to assign a value of one type to a variable of another type:

- Make sure your types match:
  ```typescript
  // Instead of
  const count: number = '5';
  
  // Do
  const count: number = 5;
  ```

- Use type conversion when necessary:
  ```typescript
  const count: number = parseInt('5');
  ```

## Project Structure for Types

In this project, we've organized types as follows:

- `/src/types/` - Directory for all shared type definitions
- `/src/types/index.ts` - Exports all types from the types directory
- `/src/types/kontour.ts` - Contains types related to the Kontour blockchain

## How to Add New Types

1. Identify which file the type belongs to (e.g., `kontour.ts` for blockchain-related types)
2. Add the type definition to the appropriate file:
   ```typescript
   export interface NewType {
     property1: string;
     property2: number;
   }
   ```
3. Import the type where needed:
   ```typescript
   import { NewType } from '../types';
   ```

## TypeScript Configuration

The project's TypeScript configuration is in `tsconfig.json`. Key settings include:

- `"strict": true` - Enables all strict type-checking options
- `"jsx": "react"` - Specifies JSX code generation for React
- `"noImplicitAny": false` - Allows variables to have implicit 'any' type
- `"typeRoots"` - Specifies locations to look for type definitions

## Best Practices

1. **Always define types for state variables**:
   ```typescript
   const [users, setUsers] = useState<User[]>([]);
   ```

2. **Use interfaces for object shapes**:
   ```typescript
   interface Props {
     title: string;
     count: number;
   }
   ```

3. **Use type aliases for complex types**:
   ```typescript
   type Status = 'idle' | 'loading' | 'success' | 'error';
   ```

4. **Avoid using `any` when possible**:
   ```typescript
   // Instead of
   const data: any = fetchData();
   
   // Define a proper type
   interface Data {
     id: string;
     value: number;
   }
   const data: Data = fetchData();
   ```

5. **Use generics for reusable components**:
   ```typescript
   interface ListProps<T> {
     items: T[];
     renderItem: (item: T) => React.ReactNode;
   }
   
   function List<T>(props: ListProps<T>) {
     // Component code
   }
   ```

By following these guidelines, you'll maintain type safety throughout the project and catch errors at compile time rather than runtime.