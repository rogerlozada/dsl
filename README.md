# DSL Learning Project

**Learning Objective**: This project is designed to learn how to create a Domain-Specific Language (DSL) using JavaScript and [Ohm.js](https://ohmjs.org/). The knowledge gained here will be applied to build a future gRPC testing framework, similar to how [Bruno CLI](https://www.usebruno.com) works for REST APIs.

## 🎓 What This Project Teaches

- **DSL Design Principles**: How to design readable, domain-specific syntax
- **Grammar Definition**: Writing Ohm.js grammar rules for parsing
- **Semantic Actions**: Converting parsed syntax into usable JavaScript objects
- **Parser Testing**: Comprehensive testing strategies for language parsers
- **Type Safety**: Handling different data types in custom languages
- **Error Handling**: Graceful parsing failure management
- **How to evaluate javascript code**: Copy a Javascript piece of code from a file and run


![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Jest](https://img.shields.io/badge/testing-jest-red.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 🎯 Features

- **Flexible Metadata Parsing**: Parse structured metadata with age, name, and HTTP method fields
- **Type-Safe Operations**: Automatic type conversion (numbers, strings, HTTP methods)
- **Whitespace Tolerant**: Handles various spacing and formatting styles
- **Individual Field Extraction**: Extract specific values from parsed objects
- **Comprehensive Testing**: Full Jest test suite with VS Code integration
- **Multiple Format Support**: Parse individual values or complete metadata blocks
- **Running Javascript Code from a Piece of Code in a File**: Copy a block of code from a file and run


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rogerlozada/dsl.git
cd dsl

# Install dependencies
npm install

# Run tests
npm test

# Run the example
node meta.js
```

## 📋 Usage Examples

### Basic Metadata Parsing

```javascript
const { grammar, semantics } = require('./meta.js');

// Parse a complete metadata block
const input = 'Metadata{ age: 30, name: roger, http: get }';
const result = grammar.match(input);

if (result.succeeded()) {
  const data = semantics(result).toObject();
  console.log(data);
  // Output: { age: 30, name: "roger", http: "GET" }
}
```

### Individual Value Parsing

```javascript
// Parse individual values
console.log(parseValue('25'));      // 25 (number)
console.log(parseValue('Alice'));   // "Alice" (string)  
console.log(parseValue('POST'));    // "POST" (string)
```

### Field Extraction

```javascript
const { getMetadataField } = require('./meta.js');

const metadata = 'Metadata{ age: 30, name: roger, http: get }';

// Extract specific fields
const age = getMetadataField(metadata, 'age');     // 30
const name = getMetadataField(metadata, 'name');   // "roger"
const method = getMetadataField(metadata, 'http'); // "GET"
```

## 🔧 Grammar Specification

The DSL supports the following syntax:

### Metadata Block Format
```
Metadata{ field1: value1, field2: value2, ... }
```

### Supported Fields

| Field | Type      | Example                               | Description           |
|----------|--------|---------------------------------------|-----------------------|
| `name`   | String | `name: ping`                          | Alphabetic characters |
| `method` | Method | `method: grpc.health.v1.Health/Check` | GRPC Address          |

### Syntax Rules

- **Flexible spacing**: `Metadata{name:roger}` or `Metadata{ name : roger }`
- **Optional commas**: Works with or without trailing commas
- **Multiple field orders**: Fields can appear in any order

## 🧪 Testing

The project includes comprehensive testing with both Jest and a custom test framework:

### Run Jest Tests (Recommended)
```bash
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm test -- --coverage     # Run with coverage report
```

### Run Custom Tests
```bash
npm run test:custom         # Run custom test framework
```

## 🎯 Learning Goal: gRPC Testing DSL

The ultimate learning objective is to apply DSL creation knowledge to build a **gRPC Testing Framework**. This project serves as the foundation for understanding how to:

### 🔧 Skills Being Developed

1. **DSL Design for Testing**: Learn how to create intuitive syntax for test scenarios
2. **gRPC Integration**: Understanding how parsers can bridge human-readable syntax with gRPC calls
3. **Test Framework Architecture**: How DSLs can power testing tools
4. **Parser Performance**: Optimizing grammar for complex test file parsing

### 📝 Future gRPC Testing DSL Vision

```javascript
// Future syntax goals
metadata {
    name: "API Test Suite"
    description: "User authentication tests"
}

body {
    {
        "userId" : "{{userId}}"
        "username": "{{user}}",
        "password": "{{pass}}"
    }
}

pre-grpc-call {
  // javascript code, example:
  const { v4: uuidv4 } = require('uuid');
  const jsonString = req.getBody();
  const postData = JSON.parse(JSON.stringify(jsonString));
  const userId = uuidv4();
  
  postData.userId = userId;
  console.log(postData);
}

tests {
    test('should return 200', function() {
        expect(res.getStatus()).to.equal(200);
    });
    
    test('should have auth token', function() {
        const data = res.getBody();
        expect(data.token).to.exist;
    });
}
```
