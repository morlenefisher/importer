'use strict'

let handler = require('./handler');

let event = {
  "body" : [{
    "uuid": "54cf99a7-3eb4-4ab8-9e1c-3cc650b485ae",
    "owner": "45c0199c-26ac-4646-ab6d-a3d55eb0f2d6",
    "title": "Griffin"
  },
   {
    "uuid": "5289cc67-dfc2-41a4-a5b0-25091037cc60",
    "title": "Richardson"
  }],
  "table": "imported",
  "source": "local",
  "destination": "db"
}


//
let context = {
        fail: function(msg) {
            expect(msg).toBeDefined();
        },
        succeed: function(data) {
            expect(data).toBeDefined();
            expect(data.statusCode).toBeDefined();
            expect(data.statusCode).toEqual(200);
        }
    }
    //ˇ
let callback = {
    anyting: function(err, res) {}
}


describe("Handler", function() {
  let o;
  beforeEach(function(){
    o = new handler(event, context, callback);
    spyOn(o,"write").andCallFake(function(){
      return new Promise(function(resolve, reject){
        resolve(true);
      })
    });


  })

  it('can instantiate class with params', function() {
      expect(o).toBeDefined();
      expect(o.context).toBeDefined();
      expect(o.event).toBeDefined();
      expect(o.callback).toBeDefined();

      expect(o.event).toMatch(event);
      expect(o.context).toMatch(context);
      expect(o.callback).toMatch(callback);
  })

  it('can set the data', function(done){
    o.getData();
    expect(o.data).toBeDefined();
    o.setTable();
    expect(o.table).toBeDefined();
    o.getSchema();
    expect(o.schema).toBeDefined();
    o.setSource();
    expect(o.source).toBeDefined();
    o.setDestination();
    expect(o.destination).toBeDefined();

    o.create();
    done();
  })
})
