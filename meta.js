const ohm = require('ohm-js');

// Define a simple grammar for arithmetic expressions
const grammar = ohm.grammar(`
  Metadata {
    Exp = MetadataBlock | method | name
    
    MetadataBlock = "Metadata" space* "{" space* MetadataField* space* "}"
    
    MetadataField = space* (nameField | methodField) space*
    
    nameField = "name" space* ":" space* identifier space* ","?
    methodField = "method" space* ":" space* methodName space* ","?
    
    name = letter (letter | digit)*
    method = methodName
    
    identifier = letter (letter | digit)*
    methodName = letter (letter | digit | "." | "/" | "_")*
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
  nameField(_, _s1, _colon, _s2, id, _s3, _comma) {
    return { name: id.toObject() };
  },
  methodField(_, _s1, _colon, _s2, methodName, _s3, _comma) {
    return { method: methodName.toObject() };
  },
  name(firstLetter, rest) {
    return firstLetter.sourceString + rest.sourceString;
  },
  method(methodName) {
    return methodName.toObject();
  },
  identifier(firstLetter, rest) {
    return firstLetter.sourceString + rest.sourceString;
  },
  methodName(firstLetter, rest) {
    return firstLetter.sourceString + rest.sourceString;
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