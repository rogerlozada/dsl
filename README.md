# Introduction

The objective of this project is to learn how to create and DSL to parse an object.

This project was inspired by Bruno CLI (https://www.usebruno.com).


# File structure


Metadata {
    name: run grpc test
}

body {
    {
        .... json
    }
}

-- should running the tests within the brakets using Jasmine
tests {
  test('returns 200', function() {
    expect(res.getStatus()).to.equal(200);
  });
  
  test('expected response', function() {
    const data = res.getBody();
    orgId = "test" 
    expect(data.organization_id).to.equal(orgId);
  });
}

### How to run

node index.html
... need to be done