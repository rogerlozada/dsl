const ohm = require('ohm-js');

// Define a simple grammar for arithmetic expressions
const grammar = ohm.grammar(`
  Metadata {
    Exp = MetadataBlock | name | method
    
    MetadataBlock = "Metadata" space* "{" space* MetadataField* space* "}"
    
    MetadataField = space* (nameField | methodField) space*
    
    nameField = "name" space* ":" space* identifier space* ","?
    methodField = "method" space* ":" space* identifier space* ","?
    
    name = letter+
    method = letter+
    
    identifier = letter+
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

// Export the grammar and semantics for use in other modules
module.exports = {
  grammar,
  semantics,
  testMetadata,
  getMetadataField
};