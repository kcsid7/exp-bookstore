const request = require("supertest");

const app = require("../app.js");
const db = require("../db.js");


process.env.NODE_ENV = "test";

let book;


// Add test data to the test database
beforeEach(async function() {
    let res = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '0691161518',
        'http://a.co/eobPtX2',
        'Matthew Lane',
        'english',
        264,
        'Princeton University Press',
        'Power-Up: Unlocking the Hidden Mathematics in Video Games', 
        2017)
      RETURNING isbn
    `)
    book = res.rows[0].isbn
})

// GET /books Test
// Get all books
describe("GET: /books", function () {
    test("Gets the list of all books", async function () {
      const res = await request(app).get(`/books`);
      const allBooks = res.body.books;
      expect(allBooks).toHaveLength(1);
      expect(allBooks[0]).toHaveProperty("title");
      expect(allBooks[0]).toHaveProperty("author");
      expect(allBooks[0]).toHaveProperty("isbn");
      expect(allBooks[0]).toHaveProperty("amazon_url");
    });
});

// POST /books Test
// Add New Book Data
// Test for valid data entry
describe("POST: /books", function() {
  test("Add book", async function() {
    const res = await request(app).post("/books").send({
        isbn: "testISBN",
        amazon_url: "http:test.url",
        author: "Test Author",
        language: "english",
        pages: 100,
        publisher: "Test Publisher",
        title: "Test Title",
        year: 2010
    })
    expect(res.statusCode).toBe(201);
  })
  
  test("Invalid Data Entry", async function() {
    const res = await request(app).post("/books").send({
      author: "Test Author"
    })
    expect(res.statusCode).toBe(400);
  })

})


// GET /books/:isbn Test
// Get book data via isbn 
describe("GET: /books/:isbn", function () {
  test("Get book via valid book ISBN", async function () {
    const res = await request(app).get(`/books/${book}`);
    const allBooks = res.body.book;
    expect(allBooks).toHaveProperty("title");
    expect(allBooks).toHaveProperty("author");
    expect(allBooks).toHaveProperty("isbn");
    expect(allBooks).toHaveProperty("amazon_url");
    expect(allBooks).toHaveProperty("amazon_url");
  });

  test("Get invalid book data", async function() {
    const res = await request(app).get(`/books/invalidData`);
    expect(res.statusCode).toBe(404);
  })
});


// PUT /books/:isbn Test
// Updates book data via isbn 
describe("PUT: /books/:isbn", function() {
  test("Update book via book ISBN", async function() {
    const res = await request(app).put(`/books/${book}`).send({
      amazon_url: "http:test.url",
      author: "Updated Author",
      language: "english",
      pages: 100,
      publisher: "Updated Publisher",
      title: "Updated Title",
      year: 2010
    })
    expect(res.body.book).toHaveProperty("isbn");
    expect(res.body.book.author).toBe("Updated Author");
  })
})


// DELETE /books/:isbn Test
// Deletes book data via isbn 
describe("DELETE: /books/:isbn", function () {
  test("Delete book via valid book ISBN", async function () {
    const res = await request(app).delete(`/books/${book}`);
    expect(res.statusCode).toBe(200);
  });
});



afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end()
});


