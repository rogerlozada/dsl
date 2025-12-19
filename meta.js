const ohm = require('ohm-js');

// Define a simple grammar for arithmetic expressions
const grammar = ohm.grammar(`
  Metadata {
    Exp = MetadataBlock | age | name | http
    
    MetadataBlock = "Metadata" space* "{" space* MetadataField* space* "}"
    
    MetadataField = space* (ageField | nameField | httpField) space*
    
    ageField = "age" space* ":" space* number space* ","?
    nameField = "name" space* ":" space* identifier space* ","?
    httpField = "http" space* ":" space* httpMethod space* ","?
    
    age = number
    name = letter+
    http = get | post
    
    identifier = letter+
    httpMethod = get | post

    get = "GET" | "get"
    post = "POST" | "post"
    
    number  (a number)
      = digit* "." digit+  -- fract
      | digit+             -- whole
  }
`);

// Create a semantics object
const semantics = grammar.createSemantics().addOperation('toObject', {
  Exp(e) {
    return e.toObject();
  },
  MetadataBlock(_, _s1, _open, _s2, fields, _s3, _close) {
    const result = {};
    fields.children.forEach(field => {
      const fieldResult = field.toObject();
      Object.assign(result, fieldResult);
    });
    return result;
  },
  MetadataField(_s1, field, _s2) {
    return field.toObject();
  },
  ageField(_, _s1, _colon, _s2, n, _s3, _comma) {
    return { age: n.toObject() };
  },
  nameField(_, _s1, _colon, _s2, id, _s3, _comma) {
    return { name: id.toObject() };
  },
  httpField(_, _s1, _colon, _s2, method, _s3, _comma) {
    return { http: method.toObject() };
  },
  age(n) {
    return n.toObject();
  },
  name(letters) {
    return letters.sourceString;
  },
  http(method) {
    return method.toObject();
  },
  identifier(letters) {
    return letters.sourceString;
  },
  httpMethod(method) {
    return method.toObject();
  },
  get(_) {
    return 'GET';
  },
  post(_) {
    return 'POST';
  },
  number_fract(a, _, b) {
    return parseFloat(a.sourceString + '.' + b.sourceString);
  },
  number_whole(a) {
    return parseInt(a.sourceString);
  }
});


console.log('Testing Metadata grammar:');
  
  // Test with whole number
  const result1 = grammar.match('25');
  if (result1.succeeded()) {
    console.log('Input: "25" -> Age:', semantics(result1).toObject());
  } else {
    console.log('Failed to parse: "25"');
  }
  
  // Test with decimal number
  const result2 = grammar.match('25.5');
  if (result2.succeeded()) {
    console.log('Input: "25.5" -> Age:', semantics(result2).toObject());
  } else {
    console.log('Failed to parse: "25.5"');
  }

  // Test with name
  const result3 = grammar.match('John');
  if (result3.succeeded()) {
    console.log('Input: "John" -> Name:', semantics(result3).toObject());
  } else {
    console.log('Failed to parse: "John"');
  }

  // Test with HTTP GET
  const result4 = grammar.match('GET');
  if (result4.succeeded()) {
    console.log('Input: "GET" -> HTTP Method:', semantics(result4).toObject());
  } else {
    console.log('Failed to parse: "GET"');
  }

  // Test with HTTP POST
  const result5 = grammar.match('POST');
  if (result5.succeeded()) {
    console.log('Input: "POST" -> HTTP Method:', semantics(result5).toObject());
  } else {
    console.log('Failed to parse: "POST"');
  }

  // Function to test metadata parsing with custom values
  function testMetadata(input, expectedType) {
    console.log(`\nTesting: "${input}" (expected: ${expectedType})`);
    const result = grammar.match(input);
    if (result.succeeded()) {
      const value = semantics(result).toObject();
      if (typeof value === 'object' && value !== null) {
        console.log(`✅ Parsed successfully: ${JSON.stringify(value, null, 2)} (type: ${typeof value})`);
      } else {
        console.log(`✅ Parsed successfully: ${value} (type: ${typeof value})`);
      }
      return { success: true, value: value, type: typeof value };
    } else {
      console.log(`❌ Failed to parse: "${input}"`);
      return { success: false, value: null, type: null };
    }
  }

  // Function to extract a specific field from metadata
  function getMetadataField(input, fieldName) {
    console.log(`\nExtracting "${fieldName}" from: "${input}"`);
    const result = grammar.match(input);
    if (result.succeeded()) {
      const parsedObject = semantics(result).toObject();
      if (typeof parsedObject === 'object' && parsedObject !== null) {
        if (parsedObject.hasOwnProperty(fieldName)) {
          console.log(`✅ Found ${fieldName}: ${parsedObject[fieldName]}`);
          return parsedObject[fieldName];
        } else {
          console.log(`❌ Field "${fieldName}" not found in metadata`);
          return null;
        }
      } else {
        console.log(`❌ Input is not a metadata object`);
        return null;
      }
    } else {
      console.log(`❌ Failed to parse: "${input}"`);
      return null;
    }
  }

  // Interactive test cases
  console.log('\n=== Custom Metadata Tests ===');
  
  // Test structured metadata (your requested format)
  console.log('\n--- Structured Metadata Tests ---');
  testMetadata('Metadata{ age: 30, name: roger, http: get }', 'object');
  testMetadata('Metadata{ age: 25.5, name: Alice }', 'object');
  testMetadata('Metadata{ http: POST, name: Bob, age: 35 }', 'object');
  
  // Test individual values
  console.log('\n--- Individual Value Tests ---');
  testMetadata('30', 'number');
  testMetadata('25.75', 'number');
  testMetadata('Alice', 'string');
  testMetadata('GET', 'string');

  // Test field extraction
  console.log('\n--- Field Extraction Tests ---');
  const metadataInput = 'Metadata{ age: 30, name: roger, http: get }';
  
  // Extract each field individually
  const age = getMetadataField(metadataInput, 'age');
  const name = getMetadataField(metadataInput, 'name'); 
  const http = getMetadataField(metadataInput, 'http');
  
  // Test non-existent field
  getMetadataField(metadataInput, 'nonexistent');
  
  // Show how to use the extracted values
  console.log('\n--- Using Extracted Values ---');
  console.log(`Roger is ${age} years old`);
  console.log(`Name: ${name}`);
  console.log(`HTTP method: ${http}`);

  // Export the grammar and semantics for use in other modules
module.exports = {
  grammar,
  semantics,
  testMetadata,
  getMetadataField
};