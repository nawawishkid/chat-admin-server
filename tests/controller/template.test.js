const {
  should,
  makeRequest,
  makeResponse,
  getBody,
  db,
  models
} = require("../utils");
const { User, Template, TemplateInput } = require("../../src/models");
const {
  createTestCase,
  shouldResponds422IfInvalidId,
  shouldResponds404IfMismatchedId
} = require("./utils");
const prefix = require("./utils").prefix + "[Template]";
const { testUser, testTemplate, testTemplateInput } = models;
const ctrl = require("../../src/controllers/template");

describe(`${prefix} get()`, () => {
  let userId, templateId, templateInputId, testCase;

  before(async () => {
    await db.connect();

    userId = await User.create(testUser.data).then(doc => doc._id);

    templateInputId = await TemplateInput.create({
      ...testTemplateInput.data,
      creatorId: userId
    }).then(doc => doc._id);

    templateId = await Template.create({
      ...testTemplate.data,
      inputs: [templateInputId],
      creatorId: userId
    }).then(doc => doc._id.toString());
  });

  after(async () => {
    await db.reset();

    db.disconnect();
  });

  testCase = createTestCase({
    controller: ctrl.get,
    status: 200,
    message: "Template found",
    name: {
      condition: "there is at least one template exists",
      data: "all templates"
    },
    request: () => ({ body: { creatorId: userId } })
  });

  it(
    testCase.name,
    testCase.getCallback(res =>
      getBody(res).data.templates.length.should.eql(1)
    )
  );

  testCase = createTestCase({
    controller: ctrl.get,
    status: 200,
    message: "Template found",
    name: {
      condition: "template ID is specified",
      data: "one matched template object instead of array with single item"
    },
    request: store => ({
      params: { id: templateId },
      body: { creatorId: userId }
    })
  });

  it(
    testCase.name,
    testCase.getCallback((res, req, store) => {
      const { template } = getBody(res).data;

      should.exist(template);
      template.should.have.property("_id", templateId);
    })
  );

  testCase = shouldResponds404IfMismatchedId("template", ctrl.get);

  it(testCase.name, testCase.getCallback());

  testCase = shouldResponds422IfInvalidId("template", ctrl.get, "get");

  it(testCase.name, testCase.getCallback());
});

describe(`${prefix} create()`, () => {
  let testCase;

  before(async () => await db.connect());

  after(async () => {
    await db.reset();

    db.disconnect();
  });

  beforeEach(async () => await Template.remove({}));

  testCase = createTestCase({
    controller: ctrl.create,
    status: 201,
    message: "Template created",
    name: {
      data: "created template",
      condition: "valid data given"
    },
    request: store => ({
      body: { ...testTemplate.data, creatorId: store.creatorId }
    }),
    pre: async store => {
      store.creatorId = await User.create(testUser.data).then(doc =>
        doc._id.toString()
      );
    }
  });

  it(
    testCase.name,
    testCase.getCallback((res, req, store) => {
      const { template } = getBody(res).data;

      should.exist(template);
      template.should.have.property("creatorId", store.creatorId);
    })
  );

  testCase = createTestCase({
    controller: ctrl.create,
    status: 422,
    message: "Failed to create template",
    name: {
      condition: "invalid data given",
      data: "error object"
    },
    request: { body: { a: "hahah" } }
  });

  it(
    testCase.name,
    testCase.getCallback(res => {
      const body = getBody(res);

      should.not.exist(body.data);
      should.exist(body.err);
    })
  );
});

describe(`${prefix} update()`, () => {
  let userId, templateInputId, testCase;

  before(async () => {
    await db.connect();

    userId = await User.create(testUser.data).then(doc => doc._id);
    templateInputId = await TemplateInput.create({
      ...testTemplateInput.data,
      creatorId: userId
    }).then(doc => doc._id);
  });

  after(async () => {
    await db.reset();

    db.disconnect();
  });

  beforeEach(async () => await Template.remove({}));

  testCase = createTestCase({
    controller: ctrl.update,
    status: 200,
    message: "Template updated",
    name: {
      data: "updated template",
      condition: "valid data given"
    },
    request: store => {
      store.updatedName = "Updated name";

      return {
        params: { id: store.templateId },
        body: { name: store.updatedName, creatorId: userId }
      };
    },
    pre: async store => {
      const newDoc = {
        ...testTemplate.data,
        inputs: [templateInputId],
        creatorId: userId
      };

      store.templateId = await Template.create(newDoc).then(doc =>
        doc._id.toString()
      );
    }
  });

  it(
    testCase.name,
    testCase.getCallback((res, req, store) => {
      const { template } = getBody(res).data;

      should.exist(template);
      template.should.have.property("name", store.updatedName);
      template.should.have.property("_id", store.templateId);
    })
  );

  testCase = shouldResponds404IfMismatchedId("template", ctrl.update);

  it(testCase.name, testCase.getCallback());

  testCase = shouldResponds422IfInvalidId("template", ctrl.update, "update");

  it(testCase.name, testCase.getCallback());
});

describe(`${prefix} delete()`, () => {
  let userId, templateId, templateInputId, testCase;

  before(async () => {
    await db.connect();

    userId = await User.create(testUser.data).then(doc => doc._id);

    templateInputId = await TemplateInput.create({
      ...testTemplateInput.data,
      creatorId: userId
    }).then(doc => doc._id);

    templateId = await Template.create({
      ...testTemplate.data,
      inputs: [templateInputId],
      creatorId: userId
    }).then(doc => doc._id.toString());
  });

  after(async () => {
    await db.reset();

    db.disconnect();
  });

  testCase = createTestCase({
    controller: ctrl.delete,
    status: 200,
    message: "Template deleted",
    name: {
      data: "deleted template",
      condition: "'req.params.id' match existing template"
    },
    request: store => ({
      params: { id: templateId }
    })
  });

  it(
    testCase.name,
    testCase.getCallback(res => {
      const { template } = getBody(res).data;

      should.exist(template);
      template.should.have.property("_id", templateId);
    })
  );

  testCase = shouldResponds404IfMismatchedId("template", ctrl.delete, "delete");

  it(testCase.name, testCase.getCallback());

  testCase = shouldResponds422IfInvalidId("template", ctrl.delete, "delete");

  it(testCase.name, testCase.getCallback());
});
