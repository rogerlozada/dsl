const { grammar, semantics, testMetadata, getMetadataField } = require('./meta.js');

// Helper function to parse and get result (suppressing console output)
function parseAndGetResult(input) {
  const result = grammar.match(input);
  if (result.succeeded()) {
    return semantics(result).toObject();
  }
  return null;
}

// Suppress console.log for testMetadata function during tests
function silentTestMetadata(input, expectedType) {
  const originalLog = console.log;
  console.log = () => {}; // Suppress output
  
  const result = testMetadata(input, expectedType);
  
  console.log = originalLog; // Restore console.log
  return result;
}

function silentGetMetadataField(input, fieldName) {
  const originalLog = console.log;
  console.log = () => {}; // Suppress output
  
  const result = getMetadataField(input, fieldName);
  
  console.log = originalLog; // Restore console.log
  return result;
}

describe('Meta.js DSL Parser', () => {
  
  describe('Individual Number Parsing', () => {
    test('should parse whole numbers', () => {
      expect(parseAndGetResult('25')).toBe(25);
      expect(parseAndGetResult('0')).toBe(0);
      expect(parseAndGetResult('100')).toBe(100);
    });

    test('should parse decimal numbers', () => {
      expect(parseAndGetResult('25.5')).toBe(25.5);
      expect(parseAndGetResult('100.75')).toBe(100.75);
      expect(parseAndGetResult('0.1')).toBe(0.1);
    });
  });

  describe('Individual Name Parsing', () => {
    test('should parse names correctly', () => {
      expect(parseAndGetResult('John')).toBe('John');
      expect(parseAndGetResult('Alice')).toBe('Alice');
      expect(parseAndGetResult('Bob')).toBe('Bob');
      expect(parseAndGetResult('a')).toBe('a');
    });
  });

  describe('Individual HTTP Method Parsing', () => {
    test('should parse HTTP methods', () => {
      expect(parseAndGetResult('GET')).toBe('GET');
      expect(parseAndGetResult('POST')).toBe('POST');
      expect(parseAndGetResult('get')).toBe('get'); // Individual parsing preserves case
      expect(parseAndGetResult('post')).toBe('post'); // Individual parsing preserves case
    });
  });

  describe('Structured Metadata Parsing', () => {
    test('should parse complete metadata blocks', () => {
      const result = parseAndGetResult('Metadata{ age: 30, name: roger, http: get }');
      expect(result).toEqual({ age: 30, name: 'roger', http: 'GET' });
    });

    test('should parse metadata with missing fields', () => {
      const result = parseAndGetResult('Metadata{ age: 25.5, name: Alice }');
      expect(result).toEqual({ age: 25.5, name: 'Alice' });
    });

    test('should parse metadata with different field order', () => {
      const result = parseAndGetResult('Metadata{ http: POST, name: Bob, age: 35 }');
      expect(result).toEqual({ http: 'POST', name: 'Bob', age: 35 });
    });

    test('should parse empty metadata block', () => {
      const result = parseAndGetResult('Metadata{ }');
      expect(result).toEqual({});
    });
  });

  describe('Whitespace Handling', () => {
    test('should handle no spaces', () => {
      const result = parseAndGetResult('Metadata{age:30,name:roger,http:get}');
      expect(result).toEqual({ age: 30, name: 'roger', http: 'GET' });
    });

    test('should handle extra spaces', () => {
      const result = parseAndGetResult('Metadata{ age : 30 , name : roger , http : get }');
      expect(result).toEqual({ age: 30, name: 'roger', http: 'GET' });
    });

    test('should handle excessive spaces', () => {
      const result = parseAndGetResult('Metadata{  age  :  30  ,  name  :  roger  }  ');
      expect(result).toEqual({ age: 30, name: 'roger' });
    });
  });

  describe('Optional Comma Handling', () => {
    test('should work without trailing comma', () => {
      const result = parseAndGetResult('Metadata{ age: 30, name: roger }');
      expect(result).toEqual({ age: 30, name: 'roger' });
    });

    test('should work with trailing comma', () => {
      const result = parseAndGetResult('Metadata{ age: 30, name: roger, }');
      expect(result).toEqual({ age: 30, name: 'roger' });
    });
  });

  describe('Field Extraction Function', () => {
    const input = 'Metadata{ age: 30, name: roger, http: get }';
    
    test('should extract existing fields', () => {
      expect(silentGetMetadataField(input, 'age')).toBe(30);
      expect(silentGetMetadataField(input, 'name')).toBe('roger');
      expect(silentGetMetadataField(input, 'http')).toBe('GET');
    });

    test('should return null for non-existent fields', () => {
      expect(silentGetMetadataField(input, 'nonexistent')).toBeNull();
    });
  });

  describe('Invalid Input Handling', () => {
    test('should return null for invalid syntax', () => {
      expect(parseAndGetResult('Metadata{ age: }')).toBeNull();
      expect(parseAndGetResult('Metadata{ : 30 }')).toBeNull();
      expect(parseAndGetResult('Metadata{ age 30 }')).toBeNull();
      expect(parseAndGetResult('Metadata age: 30 }')).toBeNull();
      expect(parseAndGetResult('Metadata{ age: 30')).toBeNull();
    });
  });

  describe('Grammar Match Validation', () => {
    test('should match valid inputs', () => {
      expect(grammar.match('25').succeeded()).toBe(true);
      expect(grammar.match('John').succeeded()).toBe(true);
      expect(grammar.match('GET').succeeded()).toBe(true);
      expect(grammar.match('Metadata{ age: 30 }').succeeded()).toBe(true);
    });

    test('should not match invalid inputs', () => {
      expect(grammar.match('Metadata{ invalid: test }').succeeded()).toBe(false);
      expect(grammar.match('25.').succeeded()).toBe(false);
    });
  });

  describe('testMetadata Function', () => {
    test('should return correct result for valid input', () => {
      const result = silentTestMetadata('Metadata{ age: 30 }', 'object');
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('object');
      expect(result.value).toEqual({ age: 30 });
    });

    test('should return failure for invalid input', () => {
      const result = silentTestMetadata('invalid syntax', 'object');
      
      expect(result.success).toBe(false);
      expect(result.value).toBeNull();
    });
  });
});