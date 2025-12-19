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
  
  describe('Individual Name Parsing', () => {
    test('should parse names correctly', () => {
      expect(parseAndGetResult('John')).toBe('John');
      expect(parseAndGetResult('Alice')).toBe('Alice');
      expect(parseAndGetResult('Bob')).toBe('Bob');
      expect(parseAndGetResult('a')).toBe('a');
    });
  });

  describe('Individual Method Parsing', () => {
    test('should parse gRPC methods', () => {
      expect(parseAndGetResult('grpc.health.v1.Health/Check')).toBe('grpc.health.v1.Health/Check');
      expect(parseAndGetResult('user.v1.UserService/CreateUser')).toBe('user.v1.UserService/CreateUser');
      expect(parseAndGetResult('SimpleMethod')).toBe('SimpleMethod');
    });
  });

  describe('Structured Metadata Parsing', () => {
    test('should parse complete metadata blocks', () => {
      const result = parseAndGetResult('Metadata{ name: roger, method: grpc.health.v1.Health/Check }');
      expect(result).toEqual({ name: 'roger', method: 'grpc.health.v1.Health/Check' });
    });

    test('should parse metadata with missing fields', () => {
      const result = parseAndGetResult('Metadata{ name: Alice }');
      expect(result).toEqual({ name: 'Alice' });
    });

    test('should parse metadata with different field order', () => {
      const result = parseAndGetResult('Metadata{ method: grpc.health.v1.Health/Check, name: Bob }');
      expect(result).toEqual({ method: 'grpc.health.v1.Health/Check', name: 'Bob' });
    });

    test('should parse empty metadata block', () => {
      const result = parseAndGetResult('Metadata{ }');
      expect(result).toEqual({});
    });
  });

  describe('Whitespace Handling', () => {
    test('should handle no spaces', () => {
      const result = parseAndGetResult('Metadata{name:roger,method:grpc.health.v1.Health/Check}');
      expect(result).toEqual({ name: 'roger', method: 'grpc.health.v1.Health/Check' });
    });

    test('should handle extra spaces', () => {
      const result = parseAndGetResult('Metadata{ name : roger , method : grpc.health.v1.Health/Check }');
      expect(result).toEqual({ name: 'roger', method: 'grpc.health.v1.Health/Check' });
    });

    test('should handle excessive spaces', () => {
      const result = parseAndGetResult('Metadata{  name  :  roger  ,  method  :  grpc.health.v1.Health/Check  }  ');
      expect(result).toEqual({ name: 'roger', method: 'grpc.health.v1.Health/Check' });
    });
  });

  describe('Optional Comma Handling', () => {
    test('should work without trailing comma', () => {
      const result = parseAndGetResult('Metadata{ method: grpc.health.v1.Health/Check, name: roger }');
      expect(result).toEqual({ method: 'grpc.health.v1.Health/Check', name: 'roger' });
    });

    test('should work with trailing comma', () => {
      const result = parseAndGetResult('Metadata{ method: grpc.health.v1.Health/Check, name: roger, }');
      expect(result).toEqual({ method: 'grpc.health.v1.Health/Check', name: 'roger' });
    });
  });

  describe('Field Extraction Function', () => {
    const input = 'Metadata{ method: grpc.health.v1.Health/Check, name: roger }';
    
    test('should extract existing fields', () => {
      expect(silentGetMetadataField(input, 'name')).toBe('roger');
      expect(silentGetMetadataField(input, 'method')).toBe('grpc.health.v1.Health/Check');
    });

    test('should return null for non-existent fields', () => {
      expect(silentGetMetadataField(input, 'nonexistent')).toBeNull();
    });
  });

  describe('Invalid Input Handling', () => {
    test('should return null for invalid syntax', () => {
      expect(parseAndGetResult('Metadata{ method: }')).toBeNull();
      expect(parseAndGetResult('Metadata{ : grpc.health.v1.Health/Check }')).toBeNull();
      expect(parseAndGetResult('Metadata{ method grpc.health.v1.Health/Check }')).toBeNull();
      expect(parseAndGetResult('Metadata method: grpc.health.v1.Health/Check }')).toBeNull();
      expect(parseAndGetResult('Metadata{ method: grpc.health.v1.Health/Check')).toBeNull();
    });
  });

  describe('Grammar Match Validation', () => {
    test('should match valid inputs', () => {
      expect(grammar.match('John').succeeded()).toBe(true);
      expect(grammar.match('grpc.health.v1.Health/Check').succeeded()).toBe(true);
      expect(grammar.match('Metadata{ method: grpc.health.v1.Health/Check }').succeeded()).toBe(true);
    });

    test('should not match invalid inputs', () => {
      expect(grammar.match('Metadata{ invalid: test }').succeeded()).toBe(false);
      expect(grammar.match('25.').succeeded()).toBe(false);
    });
  });

  describe('testMetadata Function', () => {
    test('should return correct result for valid input', () => {
      const result = silentTestMetadata('Metadata{ method: grpc.health.v1.Health/Check }', 'object');
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('object');
      expect(result.value).toEqual({ method: 'grpc.health.v1.Health/Check' });
    });

    test('should return failure for invalid input', () => {
      const result = silentTestMetadata('invalid syntax', 'object');
      
      expect(result.success).toBe(false);
      expect(result.value).toBeNull();
    });
  });
});